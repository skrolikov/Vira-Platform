export const eventHandlerTemplate = (name: string) => {
  const pascal = name
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((s) => s[0].toUpperCase() + s.slice(1))
    .join("");

  return `package events

import (
  "context"
  "encoding/json"
  "github.com/gorilla/websocket"
)

// ${pascal} handles event: ${name}
func ${pascal}(ctx context.Context, hub EventEmitter, conn *websocket.Conn, msg WSMessage) {
  var payload map[string]any
  if len(msg.Data) > 0 {
    _ = json.Unmarshal(msg.Data, &payload)
  }

  // TODO: implement domain logic here
  // Example: hub.Emit(ChannelCustom("demo", "echo"), payload)
}

func init() {
  Register("${name}", ${pascal})
}
`;
};

