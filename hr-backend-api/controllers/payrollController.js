const db = require("../config/db");

// ดึง payroll ทั้งหมด
exports.getPayrolls = async (req, res) => {
  try {

    const [rows] = await db.query(`
      SELECT 
        p.*,
        e.employee_code,
        e.firstname_th,
        e.lastname_th
      FROM payrolls p
      LEFT JOIN employees e
      ON p.employee_id = e.id
      ORDER BY p.id DESC
    `);

    res.json(rows);

  } catch (error) {

    console.error("Payroll Error:", error);

    res.status(500).json({
      message: "Error fetching payroll",
      error: error.message
    });

  }
};


// ดึง payroll รายตัว
exports.getPayrollById = async (req, res) => {
  try {

    const { id } = req.params;

    const [rows] = await db.query(
      `SELECT * FROM payrolls WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        message: "Payroll not found"
      });
    }

    res.json(rows[0]);

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Error fetching payroll"
    });

  }
};


// create payroll
exports.createPayroll = async (req, res) => {
  try {

    const {
      employee_id,
      base_salary,
      ot_amount,
      allowance,
      deduction,
      payroll_month,
      payroll_year
    } = req.body;

    const net_pay =
      Number(base_salary) +
      Number(ot_amount || 0) +
      Number(allowance || 0) -
      Number(deduction || 0);

    const [result] = await db.query(
      `INSERT INTO payrolls
      (employee_id, base_salary, ot_amount, allowance, deduction, net_pay, payroll_month, payroll_year)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        employee_id,
        base_salary,
        ot_amount,
        allowance,
        deduction,
        net_pay,
        payroll_month,
        payroll_year
      ]
    );

    res.json({
      message: "Payroll created",
      id: result.insertId
    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Error creating payroll"
    });

  }
};