const app = require("./app");
const initDb = require("./db/initDb");
const { runConsumer } = require("./kafka/consumer");

const port = process.env.PORT || 3000;

initDb()
  .then(async () => {
    try {
      await runConsumer();
    } catch (err) {
      console.error("Kafka unavailable, continuing without consumer:", err.message);
    }
    app.listen(port, () => {
      console.log(`API running on http://localhost:${port}`);
    });
  })