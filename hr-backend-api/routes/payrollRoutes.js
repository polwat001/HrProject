const express = require("express");
const router = express.Router();
const payrollController = require("../controllers/payrollController");

// ✅ ลำดับนี้สำคัญมาก: เอา Path ที่เฉพาะเจาะจงไว้บนสุด
router.get("/filters/months", payrollController.getAvailableMonths); 
router.get("/", payrollController.getPayrolls);
router.get("/:id", payrollController.getPayrollById); // <-- ฟังก์ชันนี้ต้องมีใน Controller
router.post("/", payrollController.createPayroll);

module.exports = router;