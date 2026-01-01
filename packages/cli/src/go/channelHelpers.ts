export const channelHelpers = `package events

import "fmt"

// Channel helpers for common entity scopes.
func ChannelUser(id any) string {
  return fmt.Sprintf("user:%v", id)
}

func ChannelTask(id any) string {
  return fmt.Sprintf("task:%v", id)
}

func ChannelNotifications(userID any) string {
  return fmt.Sprintf("notifications:%v", userID)
}

func ChannelCustom(name string, key any) string {
  return fmt.Sprintf("%s:%v", name, key)
}

// ChannelKanban returns a kanban board channel.
func ChannelKanban(boardID any) string {
  return fmt.Sprintf("kanban:%v", boardID)
}
`;

