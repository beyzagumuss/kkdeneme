const { sendUserEvent } = require("./kafka/producer");
const { getPendingOutboxMessages, markAsSent, incrementRetry } = require("./db/outbox");

async function processOutbox() {
  const pending = await getPendingOutboxMessages();
  for (const msg of pending) {
    try {
      const data = msg.payload;
      await sendUserEvent(msg.event_type, data, true);
      await markAsSent(msg.id);
      console.log(`Outbox relay: ${msg.event_type} sent (id:${msg.id})`);
    } catch (err) {
      await incrementRetry(msg.id, err);
    }
  }
}

function startOutboxRelay() {
  setInterval(processOutbox, 5000);
  console.log("Outbox relay started (interval: 5s)");
}

module.exports = { startOutboxRelay };