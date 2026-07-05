
const { syncKafka } = require("./kafka/client");
const pool = require("./db/pool");

async function startReplicator() {
  const consumer = syncKafka.consumer({ groupId: "sync-group" });
  const producer = syncKafka.producer({ compression: "gzip" });
 let connected = false;
  while (!connected) {
    try {
      await producer.connect();
      await consumer.connect();
      await consumer.subscribe({ topic: "user-events", fromBeginning: false });
      connected = true;
    } catch (err) {
      console.error(`Replicator connection failed (${err.message}). Retrying in 5s...`);
      await new Promise(r => setTimeout(r, 5000));
    }
  }
  await consumer.run({
    eachMessage: async ({ message }) => {
      await producer.send({
        topic: "user-events-backup",
        messages: [{ key: message.key, value: message.value }],
      });
    }
  });
  console.log("Replicator started (user-events → user-events-backup)");
}

module.exports = { startReplicator };