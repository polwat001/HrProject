const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken } = require('../middleware/authMiddleware');

// เส้นทางสำหรับดึงรายงานต่างๆ

router.get('/employee-summary', verifyToken, reportController.getEmployeeSummary);
router.get('/attendance-daily', verifyToken, reportController.getDailyAttendanceReport);

module.exports = router;