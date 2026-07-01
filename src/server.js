const app = require("./app");
const initDb = require("./db/initDb");

const port = process.env.PORT || 3000;

initDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`API running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error("Database init error:", error);
    process.exit(1);
  });
