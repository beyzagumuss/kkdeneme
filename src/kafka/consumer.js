const kafka = require("./client");
const pool = require("../db/pool");

async function runConsumer() {
  const consumer = kafka.consumer({ groupId: "deneme-group" });
  await consumer.connect();
  await consumer.subscribe({ topic: "user-events" });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const { event, data } = JSON.parse(message.value.toString());

      switch (event) {
        case "user.created":
          await pool.query(
            "INSERT INTO users (id, name, email, message, created_at) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (email) DO NOTHING",
            [data.id, data.name, data.email, data.message, data.created_at]
          );
          break;
        case "user.updated":
          await pool.query(
            "UPDATE users SET name=$1, email=$2, message=$3 WHERE id=$4",
            [data.name, data.email, data.message, data.id]
          );
          break;
        case "user.deleted":
          await pool.query("DELETE FROM users WHERE id=$1", [data]);
          break;
      }
      console.log(`Consumer (Partition ${partition}): ${event} -> DB (id:${data.id || data})`);
    }
  });
  console.log(`Consumer started`);
}
module.exports = { runConsumer };