package redis

import (
	"context"
	"fmt"
	"log"
	"showcase-back/pkg/config"
	"time"

	"github.com/go-redis/redis/v8"
)

var Client *redis.Client
var ctx = context.Background()

func Connect() error {
	Client = redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%d", config.AppConfig.Redis.Host, config.AppConfig.Redis.Port),
		Password: config.AppConfig.Redis.Password,
		DB:       config.AppConfig.Redis.DB,
	})

	if err := Client.Ping(ctx).Err(); err != nil {
		return fmt.Errorf("failed to connect to redis: %w", err)
	}

	log.Println("✅ Redis connected successfully")
	return nil
}

func Close() error {
	if Client != nil {
		return Client.Close()
	}
	return nil
}

// Cache helpers
func Set(key string, value interface{}, expiration time.Duration) error {
	return Client.Set(ctx, key, value, expiration).Err()
}

func Get(key string) (string, error) {
	return Client.Get(ctx, key).Result()
}

func Delete(key string) error {
	return Client.Del(ctx, key).Err()
}

func Exists(key string) (bool, error) {
	count, err := Client.Exists(ctx, key).Result()
	return count > 0, err
}
