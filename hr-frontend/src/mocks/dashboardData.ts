export const todayStr = new Date().toISOString().split("T")[0];

const generateMockEmployees = () => {
  const depts = [
    { name: "IT", count: 8500 },
    { name: "Marketing", count: 12000 },
    { name: "Human Resources", count: 3500 },
    { name: "Finance", count: 6000 },
    { name: "Operations", count: 120000 },
  ];
  let id = 1;
  let emps: any[] = [];
  depts.forEach((d) => {
    for (let i = 0; i < d.count; i++) {
      emps.push({
        id: id,
        user_id: id === 1 ? 4 : 100 + id,
        company_id: 1,
        firstname_th: id === 1 ? "สมชาย" : `พนักงานที่${id}`,
        lastname_th: id === 1 ? "มั่นคง" : `นามสกุล${id}`,
        department_name: d.name,
        position_name: id === 1 ? "Senior Developer" : "Staff",
        employee_code: `${d.name.substring(0, 2).toUpperCase()}-${String(i + 1).padStart(6, "0")}`,
        hire_date: "2020-05-15",
        STATUS: "active",
        // gender สำหรับคำนวณสัดส่วนลาคลอด/ลาฝากครรภ์
        gender: Math.random() > 0.45 ? "female" : "male",
      });
      id++;
    }
  });
  return emps;
};

export const MOCK_EMPLOYEES = generateMockEmployees();

const generateMockAttendance = () => {
  const atts: any[] = [];
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();

  for (let i = 1; i <= today; i++) {
    const d = new Date(year, month, i);
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      const dateStr = d.toISOString().split("T")[0];
      const isLate = Math.random() > 0.8;
      atts.push({
        id: 100 + i,
        employee_id: 1,
        company_id: 1,
        DATE: dateStr,
        check_in_time: isLate ? "09:15:00" : "08:14:00",
        check_out_time: i === today ? "" : "17:30:00",
        STATUS: isLate ? "late" : "present",
      });
    }
  }

  MOCK_EMPLOYEES.forEach((emp) => {
    if (emp.id === 1) return;
    const rand = Math.random();
    let status = "present";
    let checkIn = "08:15:00";
    if (rand > 0.97) { status = "absent"; checkIn = ""; }
    else if (rand > 0.85) { status = "late"; checkIn = "09:20:00"; }
    atts.push({
      id: 200 + emp.id,
      employee_id: emp.id,
      company_id: 1,
      DATE: todayStr,
      check_in_time: checkIn,
      check_out_time: status === "absent" ? "" : "17:30:00",
      STATUS: status,
    });
  });

  return atts;
};

export const MOCK_ATTENDANCE = generateMockAttendance();


export const LEAVE_TYPES = ["sick", "personal", "annual", "maternity", "paternity"] as const;
export type LeaveType = typeof LEAVE_TYPES[number];

const generateMockLeaves = () => {
  const total = 3500;
  return Array.from({ length: total }).map((_, i) => {
    const empId = Math.floor(Math.random() * 150000) + 1;
    const emp = MOCK_EMPLOYEES.find((e) => e.id === empId);
    const gender = emp?.gender ?? (Math.random() > 0.45 ? "female" : "male");


    let leaveType: LeaveType;
    const r = Math.random();
    if (gender === "female") {
      if (r < 0.42)       leaveType = "sick";
      else if (r < 0.62)  leaveType = "personal";
      else if (r < 0.80)  leaveType = "annual";
      else if (r < 0.97)  leaveType = "maternity";
      else                leaveType = "paternity";
    } else {
      if (r < 0.50)       leaveType = "sick";
      else if (r < 0.77)  leaveType = "personal";
      else if (r < 0.95)  leaveType = "annual";
      else                leaveType = "paternity";
    }

    // ลาคลอด/ลาฝากครรภ์ใช้วันลาหลายวัน (98 วันตาม กฎหมายแรงงาน)
    const isLongLeave = leaveType === "maternity" || leaveType === "paternity";
    const leaveDays = isLongLeave
      ? leaveType === "maternity" ? 98 : 15
      : Math.floor(Math.random() * 3) + 1;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 30));
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + leaveDays - 1);

    return {
      id: i + 1,
      employee_id: empId,
      company_id: 1,
      leave_type: leaveType,
      start_date: startDate.toISOString().split("T")[0],
      end_date: endDate.toISOString().split("T")[0],
      leave_days: leaveDays,
      gender,
      // pending = รอ อนุมัติ, approved = อนุมัติแล้ว
      status: i < 3000 ? "approved" : "pending",
    };
  });
};

export const MOCK_LEAVES = generateMockLeaves();

// ── สรุปสถิติลาคลอด/ลาฝากครรภ์ สำหรับใช้ใน dashboard ──
export const MATERNITY_STATS = (() => {
  const approved = MOCK_LEAVES.filter((l) => l.status === "approved");
  const maternity = approved.filter((l) => l.leave_type === "maternity");
  const paternity = approved.filter((l) => l.leave_type === "paternity");

  // รวมวันทั้งหมด
  const totalMaternityDays = maternity.reduce((s, l) => s + l.leave_days, 0);

  // จำนวนคน (unique employee_id)
  const maternityEmpCount = new Set(maternity.map((l) => l.employee_id)).size;
  const paternityEmpCount = new Set(paternity.map((l) => l.employee_id)).size;

  // breakdown by department (ใช้ 5 แผนกหลัก)
  const depts = ["IT", "Marketing", "Human Resources", "Finance", "Operations"];
  const byDept = depts.map((dept) => {
    const deptEmps = MOCK_EMPLOYEES.filter((e) => e.department_name === dept).map((e) => e.id);
    const deptSetMaternity = maternity.filter((l) => deptEmps.includes(l.employee_id)).length;
    const deptSetPaternity = paternity.filter((l) => deptEmps.includes(l.employee_id)).length;
    return { dept, maternity: deptSetMaternity, paternity: deptSetPaternity };
  });

  // trend 12 เดือน (ข้อมูลสังเคราะห์)
  const months12 = ["เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.", "ม.ค.", "ก.พ.", "มี.ค."];
  const trend = months12.map((month) => ({
    month,
    maternity: Math.floor(20 + Math.random() * 30),
    paternity: Math.floor(5 + Math.random() * 15),
  }));

  return {
    maternityCount: maternity.length,     
    paternityCount: paternity.length,        
    maternityEmpCount,                      
    paternityEmpCount,                       
    totalMaternityDays,                     
    pendingMaternity: MOCK_LEAVES.filter(   
      (l) => l.leave_type === "maternity" && l.status === "pending"
    ).length,
    byDept,
    trend,
  };
})();

export const MOCK_OTS = Array.from({ length: 4200 }).map((_, i) => ({
  id: i + 1,
  employee_id: Math.floor(Math.random() * 150000) + 1,
  company_id: 1,
  date: todayStr,
  hours: Math.floor(Math.random() * 4) + 1,
  minutes: [0, 15, 30, 45][Math.floor(Math.random() * 4)],
  log_status: i < 3500 ? "approved" : "pending",
}));
MOCK_OTS.push(
  { id: 99998, employee_id: 1, company_id: 1, date: new Date(Date.now() - 86400000).toISOString(), hours: 2, minutes: 30, log_status: "approved" },
  { id: 99999, employee_id: 1, company_id: 1, date: new Date(Date.now() - 172800000).toISOString(), hours: 3, minutes: 45, log_status: "approved" },
);