export const typesGo = `package types

import "time"

// Example shared model; extend with your domain structs.
type User struct {
  ID        int       \`json:"id"\`
  Username  string    \`json:"username"\`
  Role      string    \`json:"role"\`
  UpdatedAt time.Time \`json:"updated_at"\`
}
`;