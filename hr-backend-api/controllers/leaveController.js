const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- ตั้งค่า Multer เก็บไฟล์เข้าโฟลเดอร์ documents ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/documents/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, `leave-${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } 
}).single('attachment');

// 1. ดึงรายการใบลาทั้งหมด (JOIN เอาไฟล์จากตารางแยกมาโชว์)
exports.getAllLeaves = async (req, res) => {
  try {
    const query = `
      SELECT 
        l.*, 
        e.firstname_th, e.lastname_th,
        (SELECT file_path FROM employee_documents 
         WHERE employee_id = l.employee_id 
         AND document_type = 'leave_evidence' 
         ORDER BY id DESC LIMIT 1) as attachment_file
      FROM leave_requests l
      JOIN employees e ON l.employee_id = e.id
      ORDER BY l.id DESC
    `;
    const [rows] = await db.query(query);
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: 'Error', error: err.message });
  }
};

// 2. พนักงานยื่นขอลา (บันทึกลง 2 ตาราง)
exports.requestLeave = (req, res) => {
  upload(req, res, async (err) => {
    if (err) return res.status(400).json({ message: 'Upload fail', error: err.message });

    const connection = await db.getConnection();
    try {
      await connection.beginTransaction();

      const { employee_id, company_id, leave_type, start_date, end_date, reason } = req.body;

      // บันทึกลงตารางใบลา
      const [leaveResult] = await connection.query(
        'INSERT INTO leave_requests (employee_id, company_id, leave_type, start_date, end_date, reason, STATUS) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [employee_id, company_id, leave_type, start_date, end_date, reason || '', 'pending']
      );

      // ถ้ามีไฟล์ ให้บันทึกลงตาราง employee_documents
      if (req.file) {
        await connection.query(
          'INSERT INTO employee_documents (employee_id, document_type, file_path) VALUES (?, ?, ?)',
          [employee_id, 'leave_evidence', req.file.filename]
        );
      }

      await connection.commit();
      res.status(201).json({ message: 'Success' });
    } catch (error) {
      await connection.rollback();
      res.status(500).json({ message: 'Database error', error: error.message });
    } finally {
      connection.release();
    }
  });
};

// 3. อัปเดตสถานะใบลา
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params; 
    const { STATUS, reject_reason } = req.body;
    await db.query(
      'UPDATE leave_requests SET STATUS = ?, reject_reason = ? WHERE id = ?', 
      [STATUS, reject_reason || null, id]
    );
    res.status(200).json({ message: 'Updated' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};