const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { verifyToken } = require('../middleware/authMiddleware');

// ดึงข้อมูลบริษัททั้งหมด (ต้องใช้ Token)
router.get('/', verifyToken, companyController.getAllCompanies);

module.exports = router;