const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');

// กำหนดเส้นทางสำหรับดึงข้อมูลพนักงานทั้งหมด (GET /api/employees)
router.get('/', employeeController.getAllEmployees);

module.exports = router;