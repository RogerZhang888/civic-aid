const { neon } = require("@neondatabase/serverless");
const pgsql = neon(process.env.DATABASE_URL);
module.exports = pgsql;