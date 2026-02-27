const express = require('express');
const router = express.Router();
const contractController = require('../controllers/contractController');
const { verifyToken } = require('../middleware/authMiddleware'); // ดึงยามมาเฝ้า

// ดึงสัญญาทั้งหมด (GET)
router.get('/', verifyToken, contractController.getAllContracts);

// สร้างสัญญาใหม่ (POST)
router.post('/', verifyToken, contractController.createContract);

// 👇 บรรทัดนี้สำคัญมาก! ถ้าไม่มีบรรทัดนี้ server.js จะพังทันที
module.exports = router;