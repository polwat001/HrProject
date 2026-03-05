const express = require("express");
const router = express.Router();
const payrollController = require("../controllers/payrollController");

router.get("/", payrollController.getPayrolls);
router.get("/:id", payrollController.getPayrollById);
router.post("/", payrollController.createPayroll);

module.exports = router;