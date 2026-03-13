const db = require('../config/db');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- ตั้งค่า Multer สำหรับตาราง employee_documents ---
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/documents/'; // เปลี่ยน path ให้สื่อถึงเอกสารพนักงาน
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // ตั้งชื่อไฟล์ให้รู้ว่าเป็นเอกสารการลา
    cb(null, `leave-doc-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } 
}).single('attachment');

// 1. ดึงรายการใบลา (JOIN ตารางเอกสารมาโชว์ด้วย)
exports.getAllLeaves = async (req, res) => {
  try {
    const query = `
      SELECT l.*, e.firstname_th, e.lastname_th, d.file_path as attachment_file
      FROM leave_requests l
      JOIN employees e ON l.employee_id = e.id
      LEFT JOIN employee_documents d ON l.employee_id = d.employee_id 
           AND d.document_type = 'leave_evidence'
           AND d.uploaded_at >= l.created_at -- ดึงไฟล์ที่สัมพันธ์กับเวลานั้นๆ
      ORDER BY l.id DESC
    `;
    const [rows] = await db.query(query);
    res.status(200).json(rows);
  } catch (err) {
    res.status(500).json({ message: 'ดึงข้อมูลการลาไม่สำเร็จ', error: err.message });
  }
};

// 2. ยื่นคำขอลา และ บันทึกไฟล์ลง employee_documents
exports.requestLeave = (req, res) => {
  // ✅ ต้องครอบด้วย upload(req, res, ...) เพื่อให้ FormData ถูกแปลงเป็น req.body
  upload(req, res, async (err) => {
    if (err) {
      console.log("Upload Error:", err);
      return res.status(500).json({ message: 'Upload failed' });
    }

    // 🔥 บรรทัดนี้สำคัญมากสำหรับการ Debug: เช็คดูใน Terminal ว่า Body มาหรือยัง
    console.log("Received Body:", req.body); 

    try {
      const { employee_id, company_id, leave_type, start_date, end_date, reason } = req.body;

      // ❌ ถ้าไม่มี upload ครอบอยู่ บรรทัดนี้จะพัง (500) เพราะ employee_id จะเป็น null
      if (!employee_id) {
        return res.status(400).json({ message: 'Data is missing' });
      }

      // ... ส่วน SQL INSERT ...
    } catch (dbErr) {
      console.error("SQL Error:", dbErr); // เช็ค Error ใน Terminal
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
};

// 3. อัปเดตสถานะ (คงเดิม)
exports.updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params; 
    const { STATUS, reject_reason } = req.body;
    const [result] = await db.query(
      'UPDATE leave_requests SET STATUS = ?, reject_reason = ? WHERE id = ?', 
      [STATUS, reject_reason || null, id]
    );
    res.status(200).json({ message: `อัปเดตเป็น ${STATUS} สำเร็จ` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};