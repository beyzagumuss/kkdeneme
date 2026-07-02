const kafka = require("./client");

const producer = kafka.producer();
let connected = false;

async function connect() {
  if (!connected) {
    await producer.connect();
    connected = true;
  }
}
async function sendUserEvent(eventType, data) {
  await connect();
  await producer.send({
    topic: "user-events",
    messages: [{
      key: eventType,
      value: JSON.stringify({ event: eventType, data, timestamp: new Date().toISOString() }),
    }],
  });
  console.log(`Kafka: ${eventType}`);
}

module.exports = { sendUserEvent };