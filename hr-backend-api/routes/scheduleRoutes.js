const express = require('express');
const router = express.Router();
const scheduleController = require('../controllers/scheduleController');
const { verifyToken } = require('../middleware/authMiddleware'); // ดึงยามมาเฝ้า

// ดึงตารางงานทั้งหมด (GET)
router.get('/', verifyToken, scheduleController.getAllSchedules);

// จัดตารางงานใหม่ (POST)
router.post('/', verifyToken, scheduleController.createSchedule);

module.exports = router;