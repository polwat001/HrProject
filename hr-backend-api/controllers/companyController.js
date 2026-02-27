const db = require('../config/db');

exports.getAllCompanies = async (req, res) => {
  try {
    // ชื่อตารางต้องเป็น 'companies' ตามใน phpMyAdmin
    const [rows] = await db.query('SELECT * FROM companies');
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message });
  }
};
const query = `
  SELECT 
    id, 
    name_th AS name, 
    short_name AS shortName, 
    COALESCE(logo, '🏢') AS logo, 
    COALESCE(color, 'hsl(215 70% 45%)') AS color 
  FROM companies
`;