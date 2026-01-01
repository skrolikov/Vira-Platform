export const kafkaYaml = `brokers:
- localhost:9092
groupId: vira-engine
topics:
events: vira.events
dlq: vira.events.dlq
`;