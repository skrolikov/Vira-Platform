export const dbGo = `package db

import (
  "context"
  "fmt"
  "time"

  "github.com/jackc/pgx/v5/pgxpool"
  "github.com/rs/zerolog"

  "vira-engine-backend/internal/config"
)

func NewPool(ctx context.Context, cfg config.Config, logger zerolog.Logger) (*pgxpool.Pool, error) {
  dsn := fmt.Sprintf("postgres://%s:%s@%s:%d/%s?sslmode=%s",
    cfg.DB.User,
    cfg.DB.Password,
    cfg.DB.Host,
    cfg.DB.Port,
    cfg.DB.Database,
    cfg.DB.SSLMode,
  )

  poolConfig, err := pgxpool.ParseConfig(dsn)
  if err != nil {
    return nil, fmt.Errorf("parse pool config: %w", err)
  }
  poolConfig.MaxConnLifetime = time.Hour
  poolConfig.MaxConnIdleTime = 30 * time.Minute
  poolConfig.HealthCheckPeriod = 30 * time.Second

  pool, err := pgxpool.NewWithConfig(ctx, poolConfig)
  if err != nil {
    return nil, fmt.Errorf("create pool: %w", err)
  }

  if err := pool.Ping(ctx); err != nil {
    return nil, fmt.Errorf("ping db: %w", err)
  }

  logger.Info().Str("db.host", cfg.DB.Host).Int("db.port", cfg.DB.Port).Msg("db pool ready")
  return pool, nil
}
`;