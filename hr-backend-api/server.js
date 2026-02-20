const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors()); // เปิดให้ Frontend ยิงมาได้
app.use(express.json()); // อ่าน JSON จาก Body ได้

// Routes (เดี๋ยวเรามาสร้างไฟล์พวกนี้ทีหลัง)
//app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/employees', require('./routes/employeeRoutes'));
//app.use('/api/companies', require('./routes/companyRoutes'));

// Test Route
app.get('/', (req, res) => {
    res.send('HR API is running...');
});

// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});