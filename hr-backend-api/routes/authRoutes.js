const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// กำหนดเส้นทางสำหรับ Login
router.post('/login', authController.login);

module.exports = router;