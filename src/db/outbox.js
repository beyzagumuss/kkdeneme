const pool = require("./pool");

async function saveToOutbox(eventType, data) {
  const id = crypto.randomUUID();
  const payload = JSON.stringify(data);
  await pool.query(
    "INSERT INTO outbox (id, event_type, payload) VALUES ($1, $2, $3)",
    [id, eventType, payload]
  );
  console.log(`Outbox: ${eventType} saved (id:${id})`);
}

async function markAsSent(id) {
  await pool.query("UPDATE outbox SET status='sent' WHERE id=$1", [id]);
}

async function getPendingOutboxMessages() {
  const result = await pool.query(
    "SELECT * FROM outbox WHERE status='pending' ORDER BY created_at ASC LIMIT 100"
  );
  return result.rows;
}

async function incrementRetry(id, error) {
  await pool.query(
    "UPDATE outbox SET retry_count = retry_count + 1, last_error = $1 WHERE id=$2",
    [error.message, id]
  );
}

module.exports = { saveToOutbox, markAsSent, getPendingOutboxMessages, incrementRetry };