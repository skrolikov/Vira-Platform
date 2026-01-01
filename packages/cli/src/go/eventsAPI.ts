export const eventsAPI = `package events

import (
  "context"
  "encoding/json"
  "sync"
  "time"

  jsonpatch "github.com/evanphx/json-patch/v5"
  "github.com/gorilla/websocket"
)

// VRP_VERSION is the current protocol version.
const VRP_VERSION = "0.1"

// ProtocolVersion returns the current VRP version.
func ProtocolVersion() string {
	return VRP_VERSION
}

// WSMessage matches protocol message schema.
type WSMessage struct {
  Type      string          \`json:"type"\`
  Name      string          \`json:"name,omitempty"\`
  Channel   string          \`json:"channel,omitempty"\`
  Channels  []string        \`json:"channels,omitempty"\`
  Data      json.RawMessage \`json:"data,omitempty"\`
  Patch     json.RawMessage \`json:"patch,omitempty"\`
  Ts        int64           \`json:"ts,omitempty"\`
  Client    string          \`json:"client,omitempty"\`
  Version   string          \`json:"version,omitempty"\`
  Auth      string          \`json:"authToken,omitempty"\`
  Session   string          \`json:"session,omitempty"\`
  Interval  int64           \`json:"interval,omitempty"\`
  VersionNo int64           \`json:"versionNo,omitempty"\`
  MsgID     string          \`json:"msgId,omitempty"\` // for idempotency
  Code      string          \`json:"code,omitempty"\`  // error code
  Message   string          \`json:"message,omitempty"\` // error message
  Retry     bool            \`json:"retry,omitempty"\` // error retry flag
}

// EventHandler signature for domain events.
type EventHandler func(ctx context.Context, hub EventEmitter, conn *websocket.Conn, msg WSMessage)

// EventEmitter exposes server-side emit/update/diff for handlers.
type EventEmitter interface {
  Emit(channel string, payload any)
  Update(channel string, payload any)
  Diff(channel string, patch any)
  Snapshot(channel string) (json.RawMessage, int64, bool)
}

// DiffMode controls how diffs are generated.
type DiffMode int

const (
  DiffModeMerge DiffMode = iota // JSON Merge Patch (RFC 7396)
  DiffModePatch                 // JSON Patch (RFC 6902)
)

// Hub is an in-memory event hub with state and versions.
type Hub struct {
  mu        sync.Mutex
  clients   map[*websocket.Conn]bool
  subs      map[string]map[*websocket.Conn]bool
  sessions  map[*websocket.Conn]string
  state     map[string]json.RawMessage
  versions  map[string]int64
  events    map[string]EventHandler
  diffMode  DiffMode
  history   map[string][]StateSnapshot // for replay
  maxHistory int
  store     StateStore
  ttlSec    int
  msgIDs    map[string]int64 // msgId -> timestamp cache for dedup (bounded)
  maxMsgIDs int
}

// StateSnapshot stores a versioned state snapshot.
type StateSnapshot struct {
  Data      json.RawMessage
  VersionNo int64
  Ts        int64
}

func NewHub() *Hub {
  return &Hub{
    clients:   make(map[*websocket.Conn]bool),
    subs:      make(map[string]map[*websocket.Conn]bool),
    sessions:  make(map[*websocket.Conn]string),
    state:     make(map[string]json.RawMessage),
    versions:  make(map[string]int64),
    events:    make(map[string]EventHandler),
    diffMode:  DiffModeMerge,
    history:   make(map[string][]StateSnapshot),
    maxHistory: 100, // keep last 100 versions per channel
    store:     MemoryStore{},
    ttlSec:    0,
    msgIDs:    make(map[string]int64),
    maxMsgIDs: 1000, // keep last 1000 msgIds for dedup
  }
}

// SetDiffMode sets the diff generation mode.
func (h *Hub) SetDiffMode(mode DiffMode) {
  h.mu.Lock()
  defer h.mu.Unlock()
  h.diffMode = mode
}

// SetHistoryLimit limits how many snapshots are stored per channel.
func (h *Hub) SetHistoryLimit(limit int) {
  h.mu.Lock()
  defer h.mu.Unlock()
  if limit > 0 {
    h.maxHistory = limit
  }
}

// SetStore sets the state store (memory/redis).
func (h *Hub) SetStore(store StateStore) {
  h.mu.Lock()
  defer h.mu.Unlock()
  if store != nil {
    h.store = store
  }
}

// SetTTL sets TTL for persisted entries.
func (h *Hub) SetTTL(ttlSec int) {
  h.mu.Lock()
  defer h.mu.Unlock()
  if ttlSec >= 0 {
    h.ttlSec = ttlSec
  }
}

// CheckMsgID returns true if msgId was already seen (and records it), false otherwise.
// Used for idempotency: duplicate messages with same msgId are ignored.
func (h *Hub) CheckMsgID(msgID string) bool {
  if msgID == "" {
    return false
  }
  h.mu.Lock()
  defer h.mu.Unlock()
  now := time.Now().UnixMilli()
  // Clean old entries (older than 5 minutes)
  cutoff := now - 5*60*1000
  for id, ts := range h.msgIDs {
    if ts < cutoff {
      delete(h.msgIDs, id)
    }
  }
  // Check if exists
  if _, exists := h.msgIDs[msgID]; exists {
    return true // duplicate
  }
  // Record
  h.msgIDs[msgID] = now
  // Trim if too many
  if len(h.msgIDs) > h.maxMsgIDs {
    // Remove oldest 100 entries
    type entry struct {
      id  string
      ts  int64
    }
    var entries []entry
    for id, ts := range h.msgIDs {
      entries = append(entries, entry{id, ts})
    }
    // Sort by timestamp (oldest first)
    for i := 0; i < len(entries)-1; i++ {
      for j := i + 1; j < len(entries); j++ {
        if entries[i].ts > entries[j].ts {
          entries[i], entries[j] = entries[j], entries[i]
        }
      }
    }
    // Remove oldest 100
    for i := 0; i < 100 && i < len(entries); i++ {
      delete(h.msgIDs, entries[i].id)
    }
  }
  return false // new message
}

// Emit aliases Update with force update.
func (h *Hub) Emit(channel string, payload any) {
  h.applyUpdate(channel, payload, true)
}

// Update applies merge-patch optimization when possible.
func (h *Hub) Update(channel string, payload any) {
  h.applyUpdate(channel, payload, false)
}

// Diff applies a raw patch and broadcasts.
func (h *Hub) Diff(channel string, patch any) {
  h.applyDiff(channel, patch)
}

func (h *Hub) Snapshot(channel string) (json.RawMessage, int64, bool) {
  h.mu.Lock()
  snap, ok := h.state[channel]
  v := h.versions[channel]
  store := h.store
  h.mu.Unlock()
  
  if ok {
    return snap, v, true
  }
  
  // Try loading from store if available
  if store != nil {
    if snap, ok, _ := store.LoadSnapshot(context.Background(), channel); ok {
      // Update in-memory cache
      h.mu.Lock()
      h.state[channel] = snap.Data
      h.versions[channel] = snap.VersionNo
      h.mu.Unlock()
      return snap.Data, snap.VersionNo, true
    }
  }
  
  return nil, 0, false
}

// Replay returns state snapshots for a channel from a given version.
func (h *Hub) Replay(channel string, fromVersion int64) []StateSnapshot {
  h.mu.Lock()
  hist := h.history[channel]
  store := h.store
  h.mu.Unlock()
  
  var result []StateSnapshot
  for _, snap := range hist {
    if snap.VersionNo > fromVersion {
      result = append(result, snap)
    }
  }
  
  // Try loading from store if available and in-memory is empty/incomplete
  if store != nil && len(result) == 0 {
    if stored, err := store.LoadHistory(context.Background(), channel, fromVersion); err == nil {
      result = stored
    }
  }
  
  return result
}

// internal helpers
func (h *Hub) applyUpdate(channel string, payload any, force bool) {
  newData, err := json.Marshal(payload)
  if err != nil {
    return
  }
  var prev []byte
  h.mu.Lock()
  if s, ok := h.state[channel]; ok {
    prev = append([]byte{}, s...)
  }
  h.state[channel] = newData
  h.versions[channel]++
  version := h.versions[channel]
  
  // Save snapshot for replay
  snap := StateSnapshot{
    Data:      append([]byte{}, newData...),
    VersionNo: version,
    Ts:        time.Now().UnixMilli(),
  }
  hist := h.history[channel]
  hist = append(hist, snap)
  if len(hist) > h.maxHistory {
    hist = hist[len(hist)-h.maxHistory:]
  }
  h.history[channel] = hist
  store := h.store
  ttl := h.ttlSec

  h.mu.Unlock()

  if store != nil {
    _ = store.SaveSnapshot(context.Background(), channel, snap, ttl)
    _ = store.AppendHistory(context.Background(), channel, snap, h.maxHistory, ttl)
  }

  if !force && prev != nil {
    var patch json.RawMessage
    var err error
    // Note: json-patch/v5 only supports CreateMergePatch (RFC 7396)
    // For RFC 6902 JSON Patch, we'd need a different library or custom implementation
    // For now, always use merge patch regardless of diffMode setting
    patch, err = jsonpatch.CreateMergePatch(prev, newData)
    if err == nil && len(patch) > 2 {
      h.applyDiff(channel, patch)
      return
    }
  }

  msg := WSMessage{
    Type:      "update",
    Channel:   channel,
    Data:      newData,
    VersionNo: version,
    Ts:        time.Now().UnixMilli(),
  }
  raw, err := json.Marshal(msg)
  if err != nil {
    return
  }
  h.broadcast(channel, raw)
}

func (h *Hub) applyDiff(channel string, patch any) {
  data, err := json.Marshal(patch)
  if err != nil {
    return
  }
  h.mu.Lock()
  prev := h.state[channel]
  merged := prev
  if prev != nil {
    if h.diffMode == DiffModePatch {
      // Apply RFC 6902 JSON Patch
      ops, err := jsonpatch.DecodePatch(data)
      if err == nil {
        applied, err := ops.Apply(prev)
        if err == nil {
          merged = applied
        }
      }
    } else {
      // Apply RFC 7396 JSON Merge Patch
      if applied, err := jsonpatch.MergePatch(prev, data); err == nil {
        merged = applied
      }
    }
  } else {
    merged = data
  }
  h.state[channel] = merged
  h.versions[channel]++
  version := h.versions[channel]
  
  // Save snapshot
  snap := StateSnapshot{
    Data:      append([]byte{}, merged...),
    VersionNo: version,
    Ts:        time.Now().UnixMilli(),
  }
  hist := h.history[channel]
  hist = append(hist, snap)
  if len(hist) > h.maxHistory {
    hist = hist[len(hist)-h.maxHistory:]
  }
  h.history[channel] = hist
  store := h.store
  ttl := h.ttlSec
  
  h.mu.Unlock()

  if store != nil {
    _ = store.SaveSnapshot(context.Background(), channel, snap, ttl)
    _ = store.AppendHistory(context.Background(), channel, snap, h.maxHistory, ttl)
  }

  msg := WSMessage{
    Type:      "diff",
    Channel:   channel,
    Patch:     data,
    Ts:        time.Now().UnixMilli(),
    VersionNo: version,
  }
  raw, err := json.Marshal(msg)
  if err != nil {
    return
  }
  h.broadcast(channel, raw)
}

// Broadcast sends a message to all subscribers of a channel.
// This is called by applyUpdate/applyDiff after creating the message.
func (h *Hub) Broadcast(channel string, raw json.RawMessage) {
  // This will be implemented by wsHub wrapper in main.go
  // Hub only manages state, wsHub manages connections
}

// Get returns an event handler by name.
func (h *Hub) Get(name string) (EventHandler, bool) {
  h.mu.Lock()
  defer h.mu.Unlock()
  handler, ok := h.events[name]
  return handler, ok
}

// SetBroadcaster sets a custom broadcast function (used by wsHub).
type Broadcaster func(channel string, raw json.RawMessage)

var globalBroadcaster Broadcaster

func SetBroadcaster(fn Broadcaster) {
  globalBroadcaster = fn
}

func (h *Hub) broadcast(channel string, raw json.RawMessage) {
  if globalBroadcaster != nil {
    globalBroadcaster(channel, raw)
  }
}
`;
