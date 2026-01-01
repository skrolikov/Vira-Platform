export const stateStore = `package events

import (
  "context"
  "encoding/json"
  "fmt"
  "time"

  "github.com/redis/go-redis/v9"
)

// StateStore abstracts persist/replay of channel state.
type StateStore interface {
  SaveSnapshot(ctx context.Context, channel string, snapshot StateSnapshot, ttlSec int) error
  LoadSnapshot(ctx context.Context, channel string) (StateSnapshot, bool, error)
  AppendHistory(ctx context.Context, channel string, snapshot StateSnapshot, maxLen int, ttlSec int) error
  LoadHistory(ctx context.Context, channel string, fromVersion int64) ([]StateSnapshot, error)
}

// MemoryStore fallback (no-op persist)
type MemoryStore struct{}

func (MemoryStore) SaveSnapshot(ctx context.Context, channel string, snapshot StateSnapshot, ttlSec int) error { return nil }
func (MemoryStore) LoadSnapshot(ctx context.Context, channel string) (StateSnapshot, bool, error) {
  return StateSnapshot{}, false, nil
}
func (MemoryStore) AppendHistory(ctx context.Context, channel string, snapshot StateSnapshot, maxLen int, ttlSec int) error {
  return nil
}
func (MemoryStore) LoadHistory(ctx context.Context, channel string, fromVersion int64) ([]StateSnapshot, error) {
  return nil, nil
}

// RedisStore persists snapshots/history into Redis.
type RedisStore struct {
  client *redis.Client
}

func NewRedisStore(client *redis.Client) *RedisStore {
  return &RedisStore{client: client}
}

// Keys:
// snapshot:<channel> -> json StateSnapshot
// history:<channel> -> list of json StateSnapshot (trimmed)

func snapshotKey(ch string) string { return fmt.Sprintf("snapshot:%s", ch) }
func historyKey(ch string) string  { return fmt.Sprintf("history:%s", ch) }

func (s *RedisStore) SaveSnapshot(ctx context.Context, channel string, snapshot StateSnapshot, ttlSec int) error {
  raw, err := json.Marshal(snapshot)
  if err != nil {
    return err
  }
  key := snapshotKey(channel)
  if err := s.client.Set(ctx, key, raw, time.Duration(ttlSec)*time.Second).Err(); err != nil {
    return err
  }
  return nil
}

func (s *RedisStore) LoadSnapshot(ctx context.Context, channel string) (StateSnapshot, bool, error) {
  key := snapshotKey(channel)
  val, err := s.client.Get(ctx, key).Bytes()
  if err == redis.Nil {
    return StateSnapshot{}, false, nil
  }
  if err != nil {
    return StateSnapshot{}, false, err
  }
  var snap StateSnapshot
  if err := json.Unmarshal(val, &snap); err != nil {
    return StateSnapshot{}, false, err
  }
  return snap, true, nil
}

func (s *RedisStore) AppendHistory(ctx context.Context, channel string, snapshot StateSnapshot, maxLen int, ttlSec int) error {
  raw, err := json.Marshal(snapshot)
  if err != nil {
    return err
  }
  key := historyKey(channel)
  pipe := s.client.Pipeline()
  pipe.RPush(ctx, key, raw)
  if maxLen > 0 {
    pipe.LTrim(ctx, key, int64(-maxLen), int64(-1))
  }
  if ttlSec > 0 {
    pipe.Expire(ctx, key, time.Duration(ttlSec)*time.Second)
  }
  _, err = pipe.Exec(ctx)
  return err
}

func (s *RedisStore) LoadHistory(ctx context.Context, channel string, fromVersion int64) ([]StateSnapshot, error) {
  key := historyKey(channel)
  items, err := s.client.LRange(ctx, key, 0, -1).Result()
  if err == redis.Nil {
    return nil, nil
  }
  if err != nil {
    return nil, err
  }
  var out []StateSnapshot
  for _, item := range items {
    var snap StateSnapshot
    if err := json.Unmarshal([]byte(item), &snap); err == nil {
      if snap.VersionNo > fromVersion {
        out = append(out, snap)
      }
    }
  }
  return out, nil
}
`;

