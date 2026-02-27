const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { verifyToken } = require('../middleware/authMiddleware'); // ดึงยามมาเฝ้าประตูเหมือนเดิม!

// ... โค้ดส่วนบน ...
router.get('/', verifyToken, attendanceController.getAttendanceLogs); // สำหรับดึงข้อมูล
router.post('/record', verifyToken, attendanceController.recordAttendance); // สำหรับบันทึกเข้างาน
router.put('/check-out', verifyToken, attendanceController.checkOut); // สำหรับบันทึกออกงาน

module.exports = router;