const { Kafka } = require("kafkajs");

const producerKafka = new Kafka({
  clientId: "deneme-app-producer",
  brokers: ["kafka1:9092"],  // Cluster A
});

const consumerKafka = new Kafka({
  clientId: "deneme-app-consumer",
  brokers: ["kafka1:9092"],  // Cluster A (ana consumer)
});

const syncKafka = new Kafka({
  clientId: "deneme-app-sync",
  brokers: ["kafka1:9092"],  // Cluster A (sync için)
});  // ← Sync #1 için ayrı client (opsiyonel, aynı cluster)

module.exports = { producerKafka, consumerKafka, syncKafka };
