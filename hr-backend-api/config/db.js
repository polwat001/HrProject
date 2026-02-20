const mysql = require('mysql2');
require('dotenv').config();

// สร้าง Connection Pool (แนะนำกว่า createConnection เพราะรองรับคนใช้พร้อมกันเยอะๆ)
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// แปลงให้ใช้ async/await ได้ (เขียนโค้ดง่ายขึ้น)
const promisePool = pool.promise();

console.log('MySQL Pool Created...');

module.exports = promisePool;