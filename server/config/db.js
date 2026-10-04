const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

require("dotenv").config();

const poolConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
};

if (process.env.DB_SSL === "true") {
  poolConfig.ssl = {
    ca: fs.readFileSync(path.join(__dirname, "../certs/ca.pem")),
    rejectUnauthorized: true,
  };
}

const pool = mysql.createPool(poolConfig);

module.exports = pool;
