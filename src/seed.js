const { sendBatch } = require("./kafka/producer");

async function seed() {
  console.log("Seed started: 20000000 user inserting");

 const BATCH_SIZE = 500;
let batch = [];

for (let i = 1; i <= 20000000; i++) {
    const user = {
    id: crypto.randomUUID(),
    name: `User${i}`,
    email: `user${i}@test.com`,
    message: `Seed data #${i}`,
    created_at: new Date().toISOString(),
  };
  batch.push({ eventType: "user.created", data: user });

  if (batch.length >= BATCH_SIZE) {
    await sendBatch(batch);
    batch = [];
    console.log(`${i}/${20000000} sent`);
  }
}
if (batch.length) await sendBatch(batch);
  console.log("Seed completed");
}

seed().catch(console.error);