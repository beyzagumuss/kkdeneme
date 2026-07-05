const { consumerKafka } = require("./client");
const pool = require("../db/pool");

async function runConsumer() {
  const consumer = consumerKafka.consumer({ groupId: "deneme-group" });
  await consumer.connect();
  await consumer.subscribe({ topic: "user-events" });

  await consumer.run({
  eachBatch: async ({ batch }) => {
    const users = [];
    for (const message of batch.messages) {
      const { event, data } = JSON.parse(message.value.toString());
      if (event === "user.created") {
        users.push(data);
      }
    }
    if (users.length > 0) {
      const values = users.map((u, i) =>
        `($${i * 5 + 1},$${i * 5 + 2},$${i * 5 + 3},$${i * 5 + 4},$${i * 5 + 5})`
      ).join(",");
      const params = users.flatMap(u => [u.id, u.name, u.email, u.message, u.created_at]);
      await pool.query(
        `INSERT INTO users (id, name, email, message, created_at) VALUES ${values} ON CONFLICT (email) DO NOTHING`,
        params
      );
    }
    console.log(`Consumer batch: ${batch.messages.length} messages processed`);
  }
});
  console.log(`Consumer started`);
}
module.exports = { runConsumer };