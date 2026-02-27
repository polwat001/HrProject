const express = require('express');
const router = express.Router();
const orgController = require('../controllers/orgController');
const { verifyToken } = require('../middleware/authMiddleware'); // ดึงยามมาเฝ้าประตู

// เส้นทางสำหรับแผนก (Departments)
router.get('/departments', verifyToken, orgController.getDepartments);
router.post('/departments', verifyToken, orgController.createDepartment);

// เส้นทางสำหรับตำแหน่ง (Positions)
router.get('/positions', verifyToken, orgController.getPositions);
router.post('/positions', verifyToken, orgController.createPosition);

module.exports = router;