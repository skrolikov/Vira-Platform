package kafka

import (
	"encoding/json"
	"fmt"
	"log"
	"showcase-back/pkg/config"
	"time"

	"github.com/IBM/sarama"
)

var Producer sarama.SyncProducer
var Consumer sarama.Consumer

type Event struct {
	Type      string      `json:"type"`
	Payload   interface{} `json:"payload"`
	Timestamp time.Time   `json:"timestamp"`
}

func InitProducer() error {
	cfg := sarama.NewConfig()
	cfg.Producer.Return.Successes = true
	cfg.Producer.Retry.Max = 5
	cfg.Producer.RequiredAcks = sarama.WaitForAll

	var err error
	Producer, err = sarama.NewSyncProducer(config.AppConfig.Kafka.Brokers, cfg)
	if err != nil {
		return fmt.Errorf("failed to create kafka producer: %w", err)
	}

	log.Println("✅ Kafka producer initialized")
	return nil
}

func InitConsumer() error {
	cfg := sarama.NewConfig()
	cfg.Consumer.Return.Errors = true

	var err error
	Consumer, err = sarama.NewConsumer(config.AppConfig.Kafka.Brokers, cfg)
	if err != nil {
		return fmt.Errorf("failed to create kafka consumer: %w", err)
	}

	log.Println("✅ Kafka consumer initialized")
	return nil
}

func PublishEvent(topic string, event Event) error {
	event.Timestamp = time.Now()
	jsonData, err := json.Marshal(event)
	if err != nil {
		return fmt.Errorf("failed to marshal event: %w", err)
	}

	msg := &sarama.ProducerMessage{
		Topic: topic,
		Value: sarama.StringEncoder(jsonData),
	}

	partition, offset, err := Producer.SendMessage(msg)
	if err != nil {
		return fmt.Errorf("failed to send message: %w", err)
	}

	log.Printf("✅ Event published to topic %s [partition %d, offset %d]", topic, partition, offset)
	return nil
}

func Close() error {
	var errs []error

	if Producer != nil {
		if err := Producer.Close(); err != nil {
			errs = append(errs, err)
		}
	}

	if Consumer != nil {
		if err := Consumer.Close(); err != nil {
			errs = append(errs, err)
		}
	}

	if len(errs) > 0 {
		return fmt.Errorf("errors closing kafka: %v", errs)
	}

	return nil
}
