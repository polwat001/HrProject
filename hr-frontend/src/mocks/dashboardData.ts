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
    atts.push({ id: 200 + emp.id, employee_id: emp.id, company_id: 1, DATE: todayStr, check_in_time: checkIn, check_out_time: status === "absent" ? "" : "17:30:00", STATUS: status });
  });

  return atts;
};

export const MOCK_ATTENDANCE = generateMockAttendance();

export const MOCK_LEAVES = Array.from({ length: 3500 }).map((_, i) => ({
  id: i + 1, employee_id: Math.floor(Math.random() * 150000) + 1, company_id: 1, start_date: todayStr, end_date: todayStr, status: i < 3000 ? "approved" : "pending",
}));

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