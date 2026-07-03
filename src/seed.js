const { sendUserEvent } = require("./kafka/producer");

async function seed() {
  console.log("Seed started: 1000 user inserting");

  for (let i = 1; i <= 1000; i++) {
    const user = {
      id: crypto.randomUUID(),
      name: `User${i}`,
      email: `user${i}@test.com`,
      message: `Seed data #${i}`,
      created_at: new Date().toISOString(),
    };
    await sendUserEvent("user.created", user);

    if (i % 100 === 0) console.log(`${i}/1000 sent`);
  }

  console.log("Seed completed");
}

seed().catch(console.error);