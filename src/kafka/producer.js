const kafka = require("./client");
const { saveToOutbox } = require("../db/outbox");

const producer = kafka.producer({ compression: "gzip" });
let connected = false;

async function connect() {
  if (!connected) {
    await producer.connect();
    connected = true;
  }
}

async function sendBatch(events) {
  await connect();
  const messages = events.map(({ eventType, data }) => ({
    key: String(data.id || data),
    value: JSON.stringify({ event: eventType, data, timestamp: new Date().toISOString() }),
  }));
  await producer.send({ topic: "user-events", messages });
}
async function sendUserEvent(eventType, data,skipOutbox = false) {
  try {
    await connect();
    const message = {
      key: String(data.id || data),
      value: JSON.stringify({ event: eventType, data, timestamp: new Date().toISOString() }),
    };
    await producer.send({ topic: "user-events", messages: [message] });
    console.log(`Kafka: ${eventType}`);
    return { ok: true };
  } catch (err) {
   if (!skipOutbox) {
      console.error(`Kafka send failed (${err.message}), saving to outbox`);
      await saveToOutbox(eventType, data);
       return { ok: false, fallback: "outbox" };
    }
    throw err;
  }
  
}

module.exports = { sendUserEvent,sendBatch };