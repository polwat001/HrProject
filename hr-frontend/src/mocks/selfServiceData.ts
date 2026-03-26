const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth();
const pad = (n: number) => String(n).padStart(2, "0");
const yyyy_mm = `${currentYear}-${pad(currentMonth + 1)}`;

export const MOCK_ATTENDANCE_RECORDS = [
  { date: `${yyyy_mm}-01`, STATUS: "present", check_in_time: "08:15:00" },
  { date: `${yyyy_mm}-02`, STATUS: "present", check_in_time: "08:20:00" },
  { date: `${yyyy_mm}-03`, STATUS: "late", check_in_time: "09:15:00" },
  { date: `${yyyy_mm}-04`, STATUS: "present", check_in_time: "08:25:00" },
  { date: `${yyyy_mm}-05`, STATUS: "absent", check_in_time: null },
  { date: `${yyyy_mm}-08`, STATUS: "present", check_in_time: "08:10:00" },
  { date: `${yyyy_mm}-09`, STATUS: "leave", check_in_time: null },
  { date: `${yyyy_mm}-10`, STATUS: "leave", check_in_time: null },
  { date: `${yyyy_mm}-11`, STATUS: "present", check_in_time: "08:05:00" },
  { date: `${yyyy_mm}-12`, STATUS: "present", check_in_time: "08:30:00" },
  { date: `${yyyy_mm}-15`, STATUS: "present", check_in_time: "08:22:00" },
  { date: `${yyyy_mm}-16`, STATUS: "late", check_in_time: "09:05:00" },
  { date: `${yyyy_mm}-17`, STATUS: "present", check_in_time: "08:18:00" },
];

export const MOCK_OT_RECORDS = [
  { id: 1, date: `${yyyy_mm}-02`, hours: 2, log_status: "approved" },
  { id: 2, date: `${yyyy_mm}-04`, hours: 1.5, log_status: "approved" },
  { id: 3, date: `${yyyy_mm}-11`, hours: 3, log_status: "pending" },
  { id: 4, date: `${yyyy_mm}-15`, hours: 2, log_status: "rejected" },
];