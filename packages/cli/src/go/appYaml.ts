export const appYaml = `service: vira-engine
env: development
http:
  port: 8080
logging:
  level: info
db:
  host: localhost
  port: 5432
  user: vira
  password: vira
  database: vira
  sslmode: disable
redis:
  host: localhost
  port: 6379
  db: 0
  password: ""
kafka:
  brokers:
    - localhost:9092
  groupId: vira-engine
  topics:
    events: vira.events
    dlq: vira.events.dlq
state:
  diffMode: merge  # merge | patch
  maxHistory: 100
  persist: memory   # memory | redis
  ttlSeconds: 0     # 0 = no TTL
`;