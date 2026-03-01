const express = require('express');
const router = express.Router();
const orgController = require('../controllers/orgController');
const auth = require('../middleware/authMiddleware');

// ==========================================
// 🏢 Companies
// ==========================================
router.get('/companies', auth, orgController.getCompanies);
router.get('/companies/:id', auth, orgController.getCompanyById);
router.post('/companies', auth, orgController.createCompany);
router.put('/companies/:id', auth, orgController.updateCompany);
router.delete('/companies/:id', auth, orgController.deleteCompany);
router.get('/companies', auth, orgController.getCompanies);

// ==========================================
// 🏬 Departments
// ==========================================
router.get('/departments', auth, orgController.getDepartments);
router.get('/departments/:id', auth, orgController.getDepartmentById);
router.post('/departments', auth, orgController.createDepartment);
router.put('/departments/:id', auth, orgController.updateDepartment);
router.delete('/departments/:id', auth, orgController.deleteDepartment);

// ==========================================
// 🎓 Positions
// ==========================================
router.get('/positions', auth, orgController.getPositions);
router.get('/positions/:id', auth, orgController.getPositionById);
router.post('/positions', auth, orgController.createPosition);
router.put('/positions/:id', auth, orgController.updatePosition);
router.delete('/positions/:id', auth, orgController.deletePosition);

module.exports = router;