const db = require('../config/db');

// ฟังก์ชันดึงรายชื่อพนักงานทั้งหมด
exports.getAllEmployees = async (req, res) => {
    try {
        // Query ดึงข้อมูลพนักงานเบื้องต้น
        const [employees] = await db.execute(`
            SELECT id, employee_code, firstname_th, lastname_th, current_company_id, status 
            FROM employees
        `);
        
        // ส่งผลลัพธ์กลับไปให้ Frontend
        res.json({
            message: "Get Employees Success",
            count: employees.length,
            data: employees
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};