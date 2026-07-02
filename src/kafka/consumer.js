const kafka = require("./client");

async function runConsumer() {
  const consumer = kafka.consumer({ groupId: "deneme-group" });

  await consumer.connect();
  await consumer.subscribe({ topic: "user-events", fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const event = JSON.parse(message.value.toString());
      console.log("Kafka event received:", event);
    },
  });

  console.log("Kafka consumer started");
}

module.exports = { runConsumer };