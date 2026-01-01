export const redisGo = `package cache

import (
  "context"
  "fmt"
  "time"

  "github.com/redis/go-redis/v9"
  "github.com/rs/zerolog"

  "vira-engine-backend/internal/config"
)

func NewRedisClient(ctx context.Context, cfg config.Config, logger zerolog.Logger) (*redis.Client, error) {
  addr := fmt.Sprintf("%s:%d", cfg.Redis.Host, cfg.Redis.Port)
  client := redis.NewClient(&redis.Options{
    Addr:     addr,
    Password: cfg.Redis.Password,
    DB:       cfg.Redis.DB,
    ReadTimeout:  3 * time.Second,
    WriteTimeout: 3 * time.Second,
    DialTimeout:  3 * time.Second,
  })

  if _, err := client.Ping(ctx).Result(); err != nil {
    return nil, fmt.Errorf("ping redis: %w", err)
  }

  logger.Info().Str("redis.addr", addr).Int("redis.db", cfg.Redis.DB).Msg("redis ready")
  return client, nil
}
`;