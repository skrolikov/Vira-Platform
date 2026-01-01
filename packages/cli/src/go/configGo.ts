export const configGo = `package config

import (
	"fmt"
	"os"
	"strings"

	"github.com/rs/zerolog"
	"gopkg.in/yaml.v3"
)

type Config struct {
	Service string \`yaml:"service"\`
	Env     string \`yaml:"env"\`
	HTTP    struct {
		Port int \`yaml:"port"\`
	} \`yaml:"http"\`
	Logging struct {
		Level string \`yaml:"level"\`
	} \`yaml:"logging"\`
	DB struct {
		Host     string \`yaml:"host"\`
		Port     int    \`yaml:"port"\`
		User     string \`yaml:"user"\`
		Password string \`yaml:"password"\`
		Database string \`yaml:"database"\`
		SSLMode  string \`yaml:"sslmode"\`
	} \`yaml:"db"\`
	Kafka struct {
		Brokers []string \`yaml:"brokers"\`
		GroupID string   \`yaml:"groupId"\`
		Topics  struct {
			Events string \`yaml:"events"\`
			DLQ    string \`yaml:"dlq"\`
		} \`yaml:"topics"\`
	} \`yaml:"kafka"\`
	Redis struct {
		Host     string \`yaml:"host"\`
		Port     int    \`yaml:"port"\`
		Password string \`yaml:"password"\`
		DB       int    \`yaml:"db"\`
	} \`yaml:"redis"\`
	Auth struct {
		Token string \`yaml:"token"\`
	} \`yaml:"auth"\`
	State struct {
		DiffMode   string \`yaml:"diffMode"\`
		MaxHistory int    \`yaml:"maxHistory"\`
		Persist    string \`yaml:"persist"\`
		TTLSec     int    \`yaml:"ttlSeconds"\`
	} \`yaml:"state"\`
}

func Load(path string) Config {
	var cfg Config
	data, err := os.ReadFile(path)
	if err != nil {
		panic(err)
	}
	if err := yaml.Unmarshal(data, &cfg); err != nil {
		panic(err)
	}

	overrideEnv(&cfg)
	applyDefaults(&cfg)
	return cfg
}

func NewLogger(cfg Config) zerolog.Logger {
	level := parseLevel(cfg.Logging.Level)
	return zerolog.New(os.Stdout).
		Level(level).
		With().
		Timestamp().
		Str("service", cfg.Service).
		Str("env", cfg.Env).
		Logger()
}

func overrideEnv(cfg *Config) {
	if port := os.Getenv("PORT"); port != "" {
		if p := parsePort(port); p > 0 {
			cfg.HTTP.Port = p
		}
	}
	if lvl := os.Getenv("LOG_LEVEL"); lvl != "" {
		cfg.Logging.Level = lvl
	}
	if host := os.Getenv("DB_HOST"); host != "" {
		cfg.DB.Host = host
	}
	if port := os.Getenv("DB_PORT"); port != "" {
		if p := parsePort(port); p > 0 {
			cfg.DB.Port = p
		}
	}
	if user := os.Getenv("DB_USER"); user != "" {
		cfg.DB.User = user
	}
	if pass := os.Getenv("DB_PASSWORD"); pass != "" {
		cfg.DB.Password = pass
	}
	if db := os.Getenv("DB_NAME"); db != "" {
		cfg.DB.Database = db
	}
	if ssl := os.Getenv("DB_SSLMODE"); ssl != "" {
		cfg.DB.SSLMode = ssl
	}
	if brokers := os.Getenv("KAFKA_BROKERS"); brokers != "" {
		cfg.Kafka.Brokers = splitAndTrim(brokers)
	}
	if group := os.Getenv("KAFKA_GROUP_ID"); group != "" {
		cfg.Kafka.GroupID = group
	}
	if events := os.Getenv("KAFKA_TOPIC_EVENTS"); events != "" {
		cfg.Kafka.Topics.Events = events
	}
	if dlq := os.Getenv("KAFKA_TOPIC_DLQ"); dlq != "" {
		cfg.Kafka.Topics.DLQ = dlq
	}
	if host := os.Getenv("REDIS_HOST"); host != "" {
		cfg.Redis.Host = host
	}
	if port := os.Getenv("REDIS_PORT"); port != "" {
		if p := parsePort(port); p > 0 {
			cfg.Redis.Port = p
		}
	}
	if pass := os.Getenv("REDIS_PASSWORD"); pass != "" {
		cfg.Redis.Password = pass
	}
	if db := os.Getenv("REDIS_DB"); db != "" {
		if p := parsePort(db); p >= 0 {
			cfg.Redis.DB = p
		}
	}
	if diff := os.Getenv("DIFF_MODE"); diff != "" {
		cfg.State.DiffMode = diff
	}
	if hist := os.Getenv("DIFF_MAX_HISTORY"); hist != "" {
		if p := parsePort(hist); p > 0 {
			cfg.State.MaxHistory = p
		}
	}
	if p := os.Getenv("STATE_PERSIST"); p != "" {
		cfg.State.Persist = p
	}
	if ttl := os.Getenv("STATE_TTL_SECONDS"); ttl != "" {
		if p := parsePort(ttl); p >= 0 {
			cfg.State.TTLSec = p
		}
	}
}

func applyDefaults(cfg *Config) {
	if cfg.HTTP.Port == 0 {
		cfg.HTTP.Port = 8080
	}
	if cfg.Service == "" {
		cfg.Service = "vira-engine"
	}
	if cfg.Env == "" {
		cfg.Env = "development"
	}
	if cfg.Logging.Level == "" {
		cfg.Logging.Level = "info"
	}
	if cfg.DB.Port == 0 {
		cfg.DB.Port = 5432
	}
	if cfg.DB.Host == "" {
		cfg.DB.Host = "localhost"
	}
	if cfg.DB.User == "" {
		cfg.DB.User = "vira"
	}
	if cfg.DB.Password == "" {
		cfg.DB.Password = "vira"
	}
	if cfg.DB.Database == "" {
		cfg.DB.Database = "vira"
	}
	if cfg.DB.SSLMode == "" {
		cfg.DB.SSLMode = "disable"
	}
	if len(cfg.Kafka.Brokers) == 0 {
		cfg.Kafka.Brokers = []string{"localhost:9092"}
	}
	if cfg.Kafka.GroupID == "" {
		cfg.Kafka.GroupID = "vira-engine"
	}
	if cfg.Kafka.Topics.Events == "" {
		cfg.Kafka.Topics.Events = "vira.events"
	}
	if cfg.Kafka.Topics.DLQ == "" {
		cfg.Kafka.Topics.DLQ = "vira.events.dlq"
	}
	if cfg.Redis.Port == 0 {
		cfg.Redis.Port = 6379
	}
	if cfg.Redis.Host == "" {
		cfg.Redis.Host = "localhost"
	}
	if cfg.Redis.DB < 0 {
		cfg.Redis.DB = 0
	}
	if token := os.Getenv("AUTH_TOKEN"); token != "" {
		cfg.Auth.Token = token
	}
	if cfg.State.DiffMode == "" {
		cfg.State.DiffMode = "merge" // merge | patch
	}
	if cfg.State.MaxHistory == 0 {
		cfg.State.MaxHistory = 100
	}
	if cfg.State.Persist == "" {
		cfg.State.Persist = "memory" // memory | redis
	}
	if cfg.State.TTLSec < 0 {
		cfg.State.TTLSec = 0
	}
}

func parseLevel(lvl string) zerolog.Level {
	switch lvl {
	case "debug":
		return zerolog.DebugLevel
	case "warn":
		return zerolog.WarnLevel
	case "error":
		return zerolog.ErrorLevel
	case "fatal":
		return zerolog.FatalLevel
	default:
		return zerolog.InfoLevel
	}
}

func parsePort(val string) int {
	var p int
	_, err := fmt.Sscanf(val, "%d", &p)
	if err != nil {
		return 0
	}
	return p
}

func splitAndTrim(val string) []string {
	parts := strings.Split(val, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		t := strings.TrimSpace(p)
		if t != "" {
			out = append(out, t)
		}
	}
	return out
}
`;