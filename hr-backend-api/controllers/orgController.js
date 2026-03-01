const db = require('../config/db');

// ==========================================
// 🏢 Companies
// ==========================================



exports.getCompanies = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT id, name_th
      FROM companies
      ORDER BY name_th ASC
    `);

    res.status(200).json(rows);
  } catch (err) {
    console.error("GET COMPANIES ERROR:", err);
    res.status(500).json({
      message: "ดึงข้อมูลบริษัทไม่สำเร็จ",
      error: err.message
    });
  }
};

exports.getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      'SELECT * FROM companies WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'ไม่พบบริษัท' });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'ดึงข้อมูลบริษัทไม่สำเร็จ', error: err.message });
  }
};

exports.createCompany = async (req, res) => {
  try {
    const { name, code } = req.body;

    const [result] = await db.query(
      'INSERT INTO companies (name, code) VALUES (?, ?)',
      [name, code]
    );

    res.status(201).json({
      message: 'สร้างบริษัทสำเร็จ',
      id: result.insertId
    });
  } catch (err) {
    res.status(500).json({ message: 'บันทึกบริษัทไม่สำเร็จ', error: err.message });
  }
};

exports.updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code } = req.body;

    await db.query(
      'UPDATE companies SET name = ?, code = ? WHERE id = ?',
      [name, code, id]
    );

    res.json({ message: 'แก้ไขบริษัทสำเร็จ' });
  } catch (err) {
    res.status(500).json({ message: 'แก้ไขบริษัทไม่สำเร็จ', error: err.message });
  }
};

exports.deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;

    await db.query(
      'DELETE FROM companies WHERE id = ?',
      [id]
    );

    res.json({ message: 'ลบบริษัทสำเร็จ' });
  } catch (err) {
    res.status(500).json({ message: 'ลบบริษัทไม่สำเร็จ', error: err.message });
  }
};

// ==========================================
// 🏬 Departments
// ==========================================

exports.getDepartments = async (req, res) => {
  try {
    const { companyId } = req.query;

    let query = 'SELECT * FROM departments';
    let params = [];

    if (companyId) {
      query += ' WHERE company_id = ?';
      params.push(companyId);
    }

    query += ' ORDER BY NAME ASC';

    const [rows] = await db.query(query, params);
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: 'ดึงข้อมูลแผนกไม่สำเร็จ', error: err.message });
  }
};

exports.getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      'SELECT * FROM departments WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'ไม่พบแผนก' });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'ดึงข้อมูลแผนกไม่สำเร็จ', error: err.message });
  }
};

exports.createDepartment = async (req, res) => {
  try {
    const { company_id, NAME, parent_dept_id, cost_center } = req.body;

    const [result] = await db.query(
      'INSERT INTO departments (company_id, NAME, parent_dept_id, cost_center) VALUES (?, ?, ?, ?)',
      [company_id, NAME, parent_dept_id || null, cost_center || null]
    );

    res.status(201).json({ message: 'สร้างแผนกสำเร็จ', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'บันทึกแผนกไม่สำเร็จ', error: err.message });
  }
};

exports.updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { NAME, parent_dept_id, cost_center } = req.body;

    await db.query(
      'UPDATE departments SET NAME = ?, parent_dept_id = ?, cost_center = ? WHERE id = ?',
      [NAME, parent_dept_id || null, cost_center || null, id]
    );

    res.json({ message: 'แก้ไขแผนกสำเร็จ' });
  } catch (err) {
    res.status(500).json({ message: 'แก้ไขแผนกไม่สำเร็จ', error: err.message });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM departments WHERE id = ?', [id]);
    res.json({ message: 'ลบแผนกสำเร็จ' });
  } catch (err) {
    res.status(500).json({ message: 'ลบแผนกไม่สำเร็จ', error: err.message });
  }
};

// ==========================================
// 🎓 Positions
// ==========================================

exports.getPositions = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM positions ORDER BY title_th ASC'
    );
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: 'ดึงข้อมูลตำแหน่งไม่สำเร็จ', error: err.message });
  }
};

exports.getPositionById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(
      'SELECT * FROM positions WHERE id = ?',
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'ไม่พบตำแหน่ง' });
    }

    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'ดึงข้อมูลตำแหน่งไม่สำเร็จ', error: err.message });
  }
};

exports.createPosition = async (req, res) => {
  try {
    const { company_id, title_th, LEVEL } = req.body;

    const [result] = await db.query(
      'INSERT INTO positions (company_id, title_th, LEVEL) VALUES (?, ?, ?)',
      [company_id, title_th, LEVEL || 1]
    );

    res.status(201).json({ message: 'สร้างตำแหน่งสำเร็จ', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: 'บันทึกตำแหน่งไม่สำเร็จ', error: err.message });
  }
};

exports.updatePosition = async (req, res) => {
  try {
    const { id } = req.params;
    const { title_th, LEVEL } = req.body;

    await db.query(
      'UPDATE positions SET title_th = ?, LEVEL = ? WHERE id = ?',
      [title_th, LEVEL || 1, id]
    );

    res.json({ message: 'แก้ไขตำแหน่งสำเร็จ' });
  } catch (err) {
    res.status(500).json({ message: 'แก้ไขตำแหน่งไม่สำเร็จ', error: err.message });
  }
};

exports.deletePosition = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM positions WHERE id = ?', [id]);
    res.json({ message: 'ลบตำแหน่งสำเร็จ' });
  } catch (err) {
    res.status(500).json({ message: 'ลบตำแหน่งไม่สำเร็จ', error: err.message });
  }
};