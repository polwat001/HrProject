const express = require('express');
const router = express.Router();
const shiftController = require('../controllers/shiftController');
const { verifyToken } = require('../middleware/authMiddleware'); // ดึงยามมาเฝ้า

router.get('/', verifyToken, shiftController.getAllShifts);
router.post('/', verifyToken, shiftController.createShift);

module.exports = router; // สำคัญที่สุด!