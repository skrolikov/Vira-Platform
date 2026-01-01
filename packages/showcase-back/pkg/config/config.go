package config

import (
	"log"
	"os"
	"strconv"

	"github.com/joho/godotenv"
)

type Config struct {
	Env string

	// Database
	DB struct {
		Host     string
		Port     int
		User     string
		Password string
		Name     string
		SSLMode  string
	}

	// Redis
	Redis struct {
		Host     string
		Port     int
		Password string
		DB       int
	}

	// Kafka
	Kafka struct {
		Brokers       []string
		ClientID      string
		ConsumerGroup string
	}

	// Server
	Server struct {
		Port string
		Host string
	}

	// CORS
	CORS struct {
		AllowedOrigins []string
	}
}

var AppConfig *Config

func Load() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	AppConfig = &Config{
		Env: getEnv("ENV", "development"),

		DB: struct {
			Host     string
			Port     int
			User     string
			Password string
			Name     string
			SSLMode  string
		}{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnvAsInt("DB_PORT", 5432),
			User:     getEnv("DB_USER", "vira"),
			Password: getEnv("DB_PASSWORD", "vira123"),
			Name:     getEnv("DB_NAME", "showcase"),
			SSLMode:  getEnv("DB_SSLMODE", "disable"),
		},

		Redis: struct {
			Host     string
			Port     int
			Password string
			DB       int
		}{
			Host:     getEnv("REDIS_HOST", "localhost"),
			Port:     getEnvAsInt("REDIS_PORT", 6379),
			Password: getEnv("REDIS_PASSWORD", ""),
			DB:       getEnvAsInt("REDIS_DB", 0),
		},

		Kafka: struct {
			Brokers       []string
			ClientID      string
			ConsumerGroup string
		}{
			Brokers:       []string{getEnv("KAFKA_BROKERS", "localhost:9092")},
			ClientID:      getEnv("KAFKA_CLIENT_ID", "showcase-api"),
			ConsumerGroup: getEnv("KAFKA_CONSUMER_GROUP", "showcase-group"),
		},

		Server: struct {
			Port string
			Host string
		}{
			Port: getEnv("PORT", "8080"),
			Host: getEnv("HOST", "0.0.0.0"),
		},

		CORS: struct {
			AllowedOrigins []string
		}{
			AllowedOrigins: []string{
				"http://localhost:5173",
				"http://localhost:3000",
			},
		},
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}
