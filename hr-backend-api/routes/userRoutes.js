const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken } = require('../middleware/authMiddleware');

router.get('/current', verifyToken, userController.getCurrentUser);
router.get('/', verifyToken, userController.getAllUsers);

module.exports = router;