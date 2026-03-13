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

// ==========================================
// 🎓   level
// ==========================================
router.get('/levels', orgController.getLevels);
router.get('/levels/:id', orgController.getLevelById);
router.post('/levels', orgController.createLevel);
router.put('/levels/:id', orgController.updateLevel);
router.delete('/levels/:id', orgController.deleteLevel);

// Divisions Routes
router.get('/divisions', orgController.getDivisions);
router.get('/divisions/:id', orgController.getDivisionById);
router.post('/divisions', orgController.createDivision);
router.put('/divisions/:id', orgController.updateDivision);
router.delete('/divisions/:id', orgController.deleteDivision);

// Sections Routes
router.get('/sections', orgController.getSections);
router.get('/sections/:id', orgController.getSectionById);
router.post('/sections', orgController.createSection);
router.put('/sections/:id', orgController.updateSection);
router.delete('/sections/:id', orgController.deleteSection);

module.exports = router;