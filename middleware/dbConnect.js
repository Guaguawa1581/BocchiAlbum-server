const mysql = require("mysql2");
const { promisify } = require("util");

const dbConnectPool = mysql.createPool({
  host: process.env.DB_HOSTNAME,
  port: process.env.DB_PORT,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true
  // connectionLimit: 10,
  // queueLimit: 0,
});

const sqlQuery = promisify(dbConnectPool.query).bind(dbConnectPool);
// 模擬sqlite的連線
const dbConnect = { selectSql: sqlQuery, runSql: sqlQuery };

module.exports = dbConnect;
