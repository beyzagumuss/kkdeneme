const express = require("express");
const pool = require("../db/pool");
const { sendUserEvent } = require("../kafka/producer");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const offset = (page - 1) * limit;

    const countResult = await pool.query("SELECT COUNT(*) FROM users");
    const total = parseInt(countResult.rows[0].count);

    const result = await pool.query(
      "SELECT * FROM users ORDER BY id ASC LIMIT $1 OFFSET $2",
      [limit, offset]
    );

    res.json({
      data: result.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
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

    const id = crypto.randomUUID();
    const created_at = new Date().toISOString();
    const user = { id, name, email, message: message || null, created_at };
    // const result = await pool.query(
    //   "INSERT INTO users (name, email, message) VALUES ($1, $2, $3) RETURNING *",
    //   [name, email, message || null]
    // );
    // res.status(201).json(result.rows[0]);

    await sendUserEvent("user.created", user);
    res.status(201).json(user);
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

    const exists = await pool.query("SELECT id FROM users WHERE id=$1", [id]);
    if (exists.rows.length === 0) {
      return res.status(404).json({ ok: false, error: "user not found" });
    }

    await sendUserEvent("user.updated", { id, name, email, message: message || null });
    res.json({ ok: true, message: "user update event sent" });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
const exists =await pool.query("SELECT id FROM users WHERE id=$1",[id]);
if(exists.rows.length===0){
  return res.status(404).json({ok:false, error:"user cannot deleted"});
}

    await sendUserEvent("user.deleted", id  );
    res.json({ok: true, message: "user delete event send"})
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

module.exports = router;
