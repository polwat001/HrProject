const db = require('../config/db');

// ==========================================
// 🕒 1. ดึงประวัติการเข้า-ออกงานทั้งหมด
// ==========================================
exports.getAttendanceLogs = async (req, res) => {
  try {
    // 1. รับค่าวันที่จาก Query String (ที่หน้าบ้านส่งมา)
    const { startDate, endDate } = req.query;

    let query = `
      SELECT a.*, e.firstname_th, e.lastname_th, e.employee_code 
      FROM attendance_logs a
      JOIN employees e ON a.employee_id = e.id
    `;

    const queryParams = [];

    // 2. ถ้ามีการส่งวันที่มา ให้เพิ่มเงื่อนไข WHERE
    if (startDate && endDate) {
      query += ` WHERE a.\`DATE\` BETWEEN ? AND ? `;
      queryParams.push(startDate, endDate);
    }

    query += ` ORDER BY a.\`DATE\` DESC, a.check_in_time DESC`;

    const [rows] = await db.query(query, queryParams);
    res.status(200).json(rows);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'ดึงข้อมูลเวลาเข้างานไม่สำเร็จ', error: err.message });
  }
};

// ==========================================
// ⏱️ 2. บันทึกเวลาเข้างาน (Check-in)
// ==========================================
exports.recordAttendance = async (req, res) => {
  try {
    const { employee_id, company_id, DATE, check_in_time, STATUS, late_minutes } = req.body;

    // เช็คข้อมูลบังคับตามตารางจริงของคุณ
    if (!employee_id || !company_id || !DATE) {
      return res.status(400).json({ message: 'กรุณาส่ง employee_id, company_id และ DATE ให้ครบ' });
    }

    const [result] = await db.query(
      `INSERT INTO attendance_logs 
      (employee_id, company_id, \`DATE\`, check_in_time, STATUS, late_minutes) 
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        employee_id, 
        company_id, 
        DATE, 
        check_in_time || null, 
        STATUS || 'present', 
        late_minutes || 0
      ]
    );

    res.status(201).json({
      message: 'บันทึกเวลาเข้างานสำเร็จ!',
      logId: result.insertId
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'บันทึกเวลาไม่สำเร็จ', error: err.message });
  }
};

// ==========================================
// ⏱️ 3. บันทึกเวลาออกงาน (Check-out)
// ==========================================
exports.checkOut = async (req, res) => {
  try {
    const { id, employee_id, company_id, DATE, check_out_time, STATUS, ot_hours } = req.body;

    if (!id && (!employee_id || !company_id || !DATE)) {
      return res.status(400).json({
        message: 'กรุณาส่ง id หรือ (employee_id, company_id, DATE) สำหรับระบุแถวที่จะอัปเดต'
      });
    }

    const fieldsToUpdate = [];
    const values = [];

    if (check_out_time !== undefined) {
      fieldsToUpdate.push('check_out_time = ?');
      values.push(check_out_time);
    }

    if (STATUS !== undefined) {
      fieldsToUpdate.push('STATUS = ?');
      values.push(STATUS);
    }

    if (ot_hours !== undefined) {
      fieldsToUpdate.push('ot_hours = ?');
      values.push(ot_hours);
    }

    if (fieldsToUpdate.length === 0) {
      return res.status(400).json({
        message: 'กรุณาส่งข้อมูลที่ต้องการอัปเดตอย่างน้อย 1 ฟิลด์ (เช่น check_out_time, STATUS, ot_hours)'
      });
    }

    let whereClause = '';
    const whereValues = [];

    if (id) {
      whereClause = 'id = ?';
      whereValues.push(id);
    } else {
      whereClause = 'employee_id = ? AND company_id = ? AND `DATE` = ?';
      whereValues.push(employee_id, company_id, DATE);
    }

    const sql = `UPDATE attendance_logs SET ${fieldsToUpdate.join(', ')} WHERE ${whereClause}`;
    const [result] = await db.query(sql, [...values, ...whereValues]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'ไม่พบข้อมูลที่ต้องการอัปเดตเวลาออกงาน' });
    }

    res.status(200).json({ message: 'บันทึกเวลาออกงานสำเร็จ!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'บันทึกเวลาออกงานไม่สำเร็จ', error: err.message });
  }
};

// ==========================================
// 🚀 ดึงรายการขอ OT จากตาราง ot_requests
// ==========================================
exports.getOTRecords = async (req, res) => {
  try {
    const { company_id, status } = req.query;
    
    // ✅ เปลี่ยนชื่อตารางเป็น ot_requests และจับคู่คอลัมน์ให้ตรงกับ Frontend
    let query = `
      SELECT 
        o.id, 
        o.date, 
        o.total_hours as hours,  /* แปลงชื่อให้ตรงกับหน้าบ้านที่รอรับ hours */
        o.reason as remarks,     /* แปลงชื่อให้ตรงกับหน้าบ้านที่รอรับ remarks */
        o.status as log_status,  /* แปลงชื่อให้ตรงกับหน้าบ้านที่รอรับ log_status */
        e.firstname_th, e.lastname_th, e.employee_code 
      FROM ot_requests o
      JOIN employees e ON o.employee_id = e.id
      WHERE 1=1
    `;
    
    const params = [];

    // กรองตามบริษัท
    if (company_id) {
      query += ` AND e.company_id = ? `;
      params.push(company_id);
    }

    // กรองตามสถานะ (ถ้ามีการส่งมา)
    if (status) {
      query += ` AND o.status = ? `;
      params.push(status);
    }
    
    // ✅ แก้ไขการเรียงลำดับให้ใช้ o.date
    query += ` ORDER BY o.date DESC`;

    const [rows] = await db.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error("Get OT Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// 🚀 อัปเดตสถานะ OT (อัปเดตไปที่ ot_requests)
// ==========================================
exports.updateOTStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'approved' หรือ 'rejected'

    // ✅ เปลี่ยนจาก attendance_logs เป็น ot_requests
    await db.query(
      `UPDATE ot_requests SET status = ? WHERE id = ?`,
      [status, id]
    );

    res.json({ message: "OT Status updated successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};