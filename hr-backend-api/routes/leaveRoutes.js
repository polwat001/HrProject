const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { verifyToken } = require('../middleware/authMiddleware'); // ดึงยามมาเฝ้า

// ดึงรายการใบลากลับมาดู
router.get('/requests', verifyToken, leaveController.getAllLeaves);

// ส่งใบลาใหม่
router.post('/request', verifyToken, leaveController.requestLeave);

// อัปเดตสถานะใบลา (อนุมัติ/ประจืน) เช่น PUT /api/leaves/1/status
router.put('/:id/status', verifyToken, leaveController.updateLeaveStatus);

module.exports = router;