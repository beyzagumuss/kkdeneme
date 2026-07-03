const { Kafka } = require("kafkajs");

const kafka = new Kafka({
  clientId: "deneme-app",
  brokers: [
    process.env.KAFKA_BROKER_1 || "kafka1:9092",
    process.env.KAFKA_BROKER_2 || "kafka2:9093",
    process.env.KAFKA_BROKER_3 || "kafka3:9094",
  ],
});

module.exports = kafka;