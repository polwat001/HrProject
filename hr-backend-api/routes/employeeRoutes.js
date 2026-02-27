const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');
const { verifyToken } = require('../middleware/authMiddleware'); // 👈 ดึงยามมาใช้งาน

// สังเกตว่าเราแทรกคำว่า "auth" ไว้ตรงกลาง แปลว่าต้องผ่านยามก่อน ถึงจะเข้าไปดึงข้อมูล (Controller) ได้
router.get('/', verifyToken, employeeController.getAllEmployees);
router.post('/', verifyToken, employeeController.createEmployee);
router.get('/:id', verifyToken, employeeController.getEmployeeById);
router.put('/:id', verifyToken, employeeController.updateEmployee);

module.exports = router;