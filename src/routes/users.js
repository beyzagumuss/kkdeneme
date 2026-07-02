const express = require("express");
const pool = require("../db/pool");
const { sendUserEvent } = require("../kafka/producer");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users ORDER BY id ASC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, error: "user not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email) {
      return res.status(400).json({ ok: false, error: "name ve email zorunlu" });
    }

    const result = await pool.query(
      "INSERT INTO users (name, email, message) VALUES ($1, $2, $3) RETURNING *",
      [name, email, message || null]
    );

    res.status(201).json(result.rows[0]);
    await sendUserEvent("user.created", result.rows[0]);
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, message } = req.body;

    if (!name || !email) {
      return res.status(400).json({ ok: false, error: "name ve email zorunlu" });
    }

    const result = await pool.query(
      `UPDATE users
       SET name = $1, email = $2, message = $3
       WHERE id = $4
       RETURNING *`,
      [name, email, message || null, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, error: "user not found" });
    }

    res.json({
      ok: true,
      message: "user updated",
      user: result.rows[0],
    });
    await sendUserEvent("user.updated", result.rows[0]);
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING *",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ ok: false, error: "user not found" });
    }

    res.json({
      ok: true,
      message: "user deleted",
      deletedUser: result.rows[0],
    });
    await sendUserEvent("user.deleted", req.params.id);
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

module.exports = router;
