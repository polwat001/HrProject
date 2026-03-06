const db = require('../config/db');

// ==========================================
// 1. ฟังก์ชันดึงผู้ใช้งานทั้งหมด (getAllUsers)
// ==========================================
exports.getAllUsers = async (req, res) => {
  try {
    const targetCompanyId = req.query.companyId;

    let query = `
      SELECT 
        u.id, 
        u.username, 
        u.email, 
        u.is_super_admin,
        u.STATUS as user_status,
        r.NAME as role_name,
        e.firstname_th,
        e.lastname_th
      FROM users u
      LEFT JOIN user_company_roles ucr ON u.id = ucr.user_id
      LEFT JOIN roles r ON ucr.role_id = r.id
      LEFT JOIN employees e ON u.id = e.user_id
      WHERE 1=1
    `;
    
    let params = [];

    if (targetCompanyId) {
      query += ` AND ucr.company_id = ?`;
      params.push(targetCompanyId);
    } else if (!req.user.is_super_admin && req.user.company_id) {
      query += ` AND ucr.company_id = ?`;
      params.push(req.user.company_id);
    }

    const [rows] = await db.query(query, params);
    res.status(200).json(rows);

  } catch (err) {
    console.error('Error in getAllUsers:', err);
    res.status(500).json({ message: 'ดึงข้อมูลผู้ใช้งานไม่สำเร็จ', error: err.message });
  }
};

// ==========================================
// 2. ฟังก์ชันดึงสิทธิ์การใช้งานทั้งหมด (getAllRoles)
// ==========================================
exports.getAllRoles = async (req, res) => {
  try {
    const query = `SELECT * FROM roles`;
    const [rows] = await db.query(query);
    res.status(200).json(rows);
  } catch (err) {
    console.error('Error in getAllRoles:', err);
    res.status(500).json({ message: 'ดึงข้อมูลสิทธิ์ไม่สำเร็จ', error: err.message });
  }
};