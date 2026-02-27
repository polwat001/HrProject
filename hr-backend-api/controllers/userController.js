const db = require('../config/db');

// ดึงข้อมูลผู้ใช้งานปัจจุบัน (Current User)
exports.getCurrentUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const query = `
      SELECT u.id, u.username, u.email, r.NAME as role
      FROM users u
      LEFT JOIN user_company_roles ucr ON u.id = ucr.user_id
      LEFT JOIN roles r ON ucr.role_id = r.id
      WHERE u.id = ?
      LIMIT 1
    `;
    const [rows] = await db.query(query, [userId]);
    if (rows.length === 0) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลผู้ใช้งาน' });
    }
    res.status(200).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'ดึงข้อมูลผู้ใช้งานปัจจุบันไม่สำเร็จ', error: err.message });
  }
};

// ดึงรายชื่อผู้ใช้งานทั้งหมด พร้อมสิทธิ์ (Role)
exports.getAllUsers = async (req, res) => {
  try {
    const query = `
      SELECT u.id, u.username, u.email, r.NAME as role_name
      FROM users u
      LEFT JOIN user_company_roles ucr ON u.id = ucr.user_id
      LEFT JOIN roles r ON ucr.role_id = r.id
      WHERE ucr.company_id = ?
    `;
    const [rows] = await db.query(query, [req.user.company_id]);
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: 'ดึงข้อมูลผู้ใช้งานไม่สำเร็จ', error: err.message });
  }
};