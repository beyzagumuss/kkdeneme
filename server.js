const express = require("express");
const { Pool } = require("pg");

const app = express();

app.use(express.json());

const pool = new Pool({
  connectionString: "postgresql://beyzauser:new123@localhost:5433/hello_db",
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      message VARCHAR(100) 
    )
  `);
await pool.query(`
      ALTER TABLE users
      ADD COLUMN IF NOT EXISTS message VARCHAR(100)
    `);
    }

app.get("/", (req, res) => {
  res.json({ message: "API calisiyor. Database kontrolu icin /health adresine bak." });
});

app.get("/health", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({ ok: true, dbTime: result.rows[0].now });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

app.get("/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users ORDER BY id ASC");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});
app.get("/users/:id", async (req, res) => {
  try {
    const {id}=req.params;
    const result = await pool.query("SELECT * FROM users WHERE id = $1",[id]);
    if(result.rows.length===0){
      return res.status(404).json({ ok: false, error:"user cannot found" });
    }
    res.json(result.rows[0]);
  }catch(error){
    res.status(500).json({ ok: false, error: error.message });
  }
});
app.delete("/users/:id", async (req, res) => {
  try {
    const {id}=req.params;
    const result= await pool.query("DELETE FROM users WHERE id = $1 RETURNING *",[id]);

    if(result.rows.length===0){
      return res.status(404).json({ ok: false, error:"user cannot found" });
    }
    res.json({
        ok: true,
        message: "user deleted",
        deletedUser: result.rows[0],
      });

  }catch(error){
    res.status(500).json({ ok: false, error: error.message });
  }
});
app.put("/users/:id", async (req,res)=>{
try{
    const {id}=req.params;
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
}catch{
  res.status(500).json({ ok: false, error: error.message });
}

});
app.post("/users", async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email) {
      return res.status(400).json({ ok: false, error: "name ve email zorunlu" });
    }

    const result = await pool.query(
      "INSERT INTO users (name, email, message) VALUES ($1, $2, $3) RETURNING *",
      [name, email,message || null]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

initDb().then(() => {
  app.listen(3000, () => {
    console.log("API running on http://localhost:3000");
  });
}).catch((error) => {
  console.error("Database init error:", error);
  process.exit(1);
});
