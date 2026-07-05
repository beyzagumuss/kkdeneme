const app = require("./app");
const initDb = require("./db/initDb");
const { runConsumer } = require("./kafka/consumer");
const { startOutboxRelay } = require("./outboxRelay.js");

const port = process.env.PORT || 3000;

async function startConsumerWithRetry() {
  const delay = 5000;
  while (true) {
    try {
      await runConsumer();
      break; // bağlantı başarılı, döngüden çık
    } catch (err) {
      console.error(`Kafka consumer connection failed (${err.message}). Retrying in ${delay / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

initDb()
  .then(() => {
    // API'yi Kafka'yı beklemeden hemen başlat
    app.listen(port, () => {
      console.log(`API running on http://localhost:${port}`);
    });
    startConsumerWithRetry();
    startOutboxRelay();
  })
  .catch((err) => {
    console.error("DB init failed:", err.message);
    process.exit(1);
  });