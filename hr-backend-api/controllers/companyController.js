const db = require('../config/db');

exports.getAllCompanies = async (req, res) => {
  try {
    // ปรับให้ตรงกับโครงสร้างจริงในภาพ
    const query = `
      SELECT 
        id, 
        name_th AS name,       -- เปลี่ยนจาก name_th เป็น name
        CODE AS shortName,      -- เปลี่ยนจาก CODE เป็น shortName
        COALESCE(logo_url, '🏢') AS logo, -- ใช้ logo_url ตามภาพ
        'hsl(215 70% 45%)' AS color 
      FROM companies
    `;

    const [rows] = await db.query(query);
    res.status(200).json(rows);
  } catch (err) {
    console.error("❌ SQL Error:", err.message);
    res.status(500).json({ message: 'Error', error: err.message });
  }
};