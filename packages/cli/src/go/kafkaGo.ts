export const kafkaGo = `package events

import (
  "context"
  "fmt"
  "time"

  "github.com/segmentio/kafka-go"
  "github.com/rs/zerolog"

  "vira-engine-backend/internal/config"
)

type Client struct {
  dialer *kafka.Dialer
  cfg    config.Config
  logger zerolog.Logger
}

func NewKafka(cfg config.Config, logger zerolog.Logger) (*Client, error) {
  d := &kafka.Dialer{
    Timeout:   5 * time.Second,
    DualStack: true,
  }
  c := &Client{dialer: d, cfg: cfg, logger: logger}
  if err := c.Ping(context.Background()); err != nil {
    return nil, err
  }
  return c, nil
}

func (c *Client) Ping(ctx context.Context) error {
  if len(c.cfg.Kafka.Brokers) == 0 {
    return fmt.Errorf("no kafka brokers configured")
  }
  conn, err := c.dialer.DialContext(ctx, "tcp", c.cfg.Kafka.Brokers[0])
  if err != nil {
    return fmt.Errorf("dial kafka: %w", err)
  }
  _ = conn.Close()
  return nil
}

func (c *Client) NewWriter(topic string) *kafka.Writer {
  return &kafka.Writer{
    Addr:         kafka.TCP(c.cfg.Kafka.Brokers...),
    Topic:        topic,
    RequiredAcks: kafka.RequireAll,
    BatchTimeout: 10 * time.Millisecond,
  }
}

func (c *Client) NewReader(topic string) *kafka.Reader {
  return kafka.NewReader(kafka.ReaderConfig{
    Brokers:        c.cfg.Kafka.Brokers,
    GroupID:        c.cfg.Kafka.GroupID,
    Topic:          topic,
    StartOffset:    kafka.FirstOffset,
    SessionTimeout: 10 * time.Second,
    HeartbeatInterval: 3 * time.Second,
    CommitInterval: 5 * time.Second,
  })
}

func (c *Client) Close() error {
  return nil
}
`;