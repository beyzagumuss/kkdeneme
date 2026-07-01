const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://beyzauser:new123@localhost:5433/hello_db",
});

module.exports = pool;
