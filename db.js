import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  database: "phishing_platform"
});

export default pool;
