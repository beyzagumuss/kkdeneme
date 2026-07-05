const pool = require("./pool");

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
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
  await pool.query(`
    CREATE TABLE IF NOT EXISTS outbox (
      id UUID PRIMARY KEY,
      event_type VARCHAR(50) NOT NULL,
      payload JSONB NOT NULL,
      status VARCHAR(20) DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      retry_count INTEGER DEFAULT 0,
      last_error TEXT
    )
  `);
}
module.exports = initDb;












// const pool = require("./pool");

// async function initDb() {
//   await pool.query(`
//     CREATE TABLE IF NOT EXISTS users (
//       id SERIAL PRIMARY KEY,
//       name VARCHAR(100) NOT NULL,
//       email VARCHAR(150) NOT NULL UNIQUE,
//       created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
//       message VARCHAR(100)
//     )
//   `);

//   await pool.query(`
//     ALTER TABLE users
//     ADD COLUMN IF NOT EXISTS message VARCHAR(100)
//   `);

//   const { runConsumer } = require("./kafka/consumer");

// initDb()
//   .then(async () => {
//     await runConsumer();    
//     app.listen(port, () => {
//       console.log(`API running on http://localhost:${port}`);
//     });
//   })
// }


