export const dockerComposeProd = `
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: vira
      POSTGRES_PASSWORD: vira
      POSTGRES_DB: vira
    volumes:
      - pgdata:/var/lib/postgresql/data

  redis:
    image: redis:7
    command: ["redis-server", "--appendonly", "yes"]
    volumes:
      - redisdata:/data

  zookeeper:
    image: confluentinc/cp-zookeeper:7.5.0
    environment:
      ZOOKEEPER_CLIENT_PORT: 2181
      ZOOKEEPER_TICK_TIME: 2000
    volumes:
      - zookeeper-data:/var/lib/zookeeper/data
    healthcheck:
      test: ["CMD-SHELL", "nc -z localhost 2181 || exit 1"]
      interval: 10s
      timeout: 5s
      retries: 5

  kafka:
    image: confluentinc/cp-kafka:7.5.0
    environment:
      KAFKA_BROKER_ID: 1
      KAFKA_ZOOKEEPER_CONNECT: zookeeper:2181
      KAFKA_ADVERTISED_LISTENERS: PLAINTEXT://kafka:9092
      KAFKA_OFFSETS_TOPIC_REPLICATION_FACTOR: 1
      KAFKA_AUTO_CREATE_TOPICS_ENABLE: "true"
    depends_on:
      zookeeper:
        condition: service_healthy
    ports:
      - "9092:9092"
    volumes:
      - kafka-data:/var/lib/kafka/data
    healthcheck:
      test: ["CMD-SHELL", "kafka-broker-api-versions --bootstrap-server localhost:9092 || exit 1"]
      interval: 30s
      timeout: 10s
      retries: 5
      start_period: 60s

  api:
    build:
      context: ../backend
    depends_on:
      - postgres
      - redis
      - kafka
    environment:
      PORT: 8080
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USER: vira
      DB_PASSWORD: vira
      DB_NAME: vira
      DB_SSLMODE: disable
      REDIS_HOST: redis
      REDIS_PORT: 6379
      KAFKA_BROKERS: kafka:9092
    ports:
      - "8080:8080"

volumes:
  pgdata:
  redisdata:
  zookeeper-data:
  kafka-data:
`;