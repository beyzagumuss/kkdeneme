const express = require("express");
const pool = require("./db/pool");
const usersRouter = require("./routes/users");

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "API calisiyor. Database kontrolu icin /health adresine bak.",
  });
});

app.get("/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ ok: true, dbTime: result.rows[0].now });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.use("/users", usersRouter);

module.exports = app;
