const db = require("../config/db");

// 1. ดึงรายการเดือนและปีที่มีข้อมูล (สำหรับ Select Filter)
exports.getAvailableMonths = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT DISTINCT payroll_month, payroll_year 
      FROM payrolls 
      ORDER BY payroll_year DESC, payroll_month DESC
    `);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error", error: error.message });
  }
};

// 2. ดึงข้อมูล Payroll ทั้งหมดตามเดือน/ปี
exports.getPayrolls = async (req, res) => {
  try {
    const { month, year } = req.query;
    let query = `
      SELECT 
        p.*,
        e.employee_code, e.firstname_th, e.lastname_th,
        d.name as department_name
      FROM payrolls p
      LEFT JOIN employees e ON p.employee_id = e.id
      LEFT JOIN departments d ON e.department_id = d.id
    `;
    
    const params = [];
    if (month && year) {
      query += ` WHERE p.payroll_month = ? AND p.payroll_year = ? `;
      params.push(month, year);
    }
    query += ` ORDER BY p.id DESC`;

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error fetching payroll", error: error.message });
  }
};

// 3.  เพิ่มฟังก์ชันนี้กลับเข้าไป (ตัวการที่ทำให้ Error)
exports.getPayrollById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await db.query(`SELECT * FROM payrolls WHERE id = ?`, [id]);
    
    if (rows.length === 0) {
      return res.status(404).json({ message: "Payroll not found" });
    }
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ message: "Error", error: error.message });
  }
};

// 4. สร้าง Payroll
exports.createPayroll = async (req, res) => {
  try {
    const {
      employee_id, company_id, base_salary, position_allowance, 
      ot_amount, other_income, sso_amount, tax_amount, other_deduction,
      payroll_month, payroll_year
    } = req.body;

    const total_income = Number(base_salary) + Number(position_allowance || 0) + Number(ot_amount || 0) + Number(other_income || 0);
    const total_deduction = Number(sso_amount || 0) + Number(tax_amount || 0) + Number(other_deduction || 0);
    const net_pay = total_income - total_deduction;

    const [result] = await db.query(`
      INSERT INTO payrolls
      (employee_id, company_id, base_salary, position_allowance, ot_amount, other_income, 
       total_income, sso_amount, tax_amount, other_deduction, total_deduction, 
       net_pay, payroll_month, payroll_year, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')
    `, [employee_id, company_id, base_salary, position_allowance, ot_amount, other_income, total_income, sso_amount, tax_amount, other_deduction, total_deduction, net_pay, payroll_month, payroll_year]);

    res.json({ message: "Success", id: result.insertId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};