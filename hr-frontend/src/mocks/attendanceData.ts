export const MOCK_ATTENDANCE_LOGS = [
  { id: 1, employee_id: 1, user_id: 4, employee_code: "EMP001", firstname_th: "สมชาย", lastname_th: "มั่นคง", date: "2026-03-19", check_in_time: "08:15:00", check_out_time: "17:30:00", late_minutes: 0, STATUS: "present", company_id: 1 },
  { id: 2, employee_id: 2, user_id: 102, employee_code: "EMP002", firstname_th: "สมหญิง", lastname_th: "ใจดี", date: "2026-03-19", check_in_time: "09:20:00", check_out_time: "18:00:00", late_minutes: 20, STATUS: "late", company_id: 1 },
  { id: 3, employee_id: 3, user_id: 103, employee_code: "EMP003", firstname_th: "วิชัย", lastname_th: "รักงาน", date: "2026-03-19", check_in_time: "", check_out_time: "", late_minutes: 0, STATUS: "absent", company_id: 1 },
  { id: 4, employee_id: 1, user_id: 4, employee_code: "EMP001", firstname_th: "สมชาย", lastname_th: "มั่นคง", date: "2026-03-18", check_in_time: "08:35:00", check_out_time: "17:30:00", late_minutes: 5, STATUS: "late", company_id: 1 },
  { id: 5, employee_id: 4, user_id: 104, employee_code: "EMP004", firstname_th: "นลิน", lastname_th: "ขยัน", date: "2026-03-18", check_in_time: "08:00:00", check_out_time: "17:45:00", late_minutes: 0, STATUS: "present", company_id: 2 },
];

export function getStatusStyle(status: string) {
  const s = status?.toLowerCase();
  if (s === 'present' || s === 'on_time') return 'bg-green-100 text-green-700 border-green-200';
  if (s === 'late') return 'bg-orange-100 text-orange-700 border-orange-200';
  if (s === 'absent') return 'bg-red-100 text-red-700 border-red-200';
  return 'bg-slate-100 text-slate-700 border-slate-200';
}

export function translateStatus(status: string, t: any) {
  const s = status?.toLowerCase();
  if (s === 'present') return t.statusPresent || "PRESENT";
  if (s === 'late') return t.statusLate || "LATE";
  if (s === 'absent') return t.statusAbsent || "ABSENT";
  if (s === 'on_time') return t.statusOnTime || "ON TIME";
  return status; 
}

export function formatTime(timeStr: string) {
  if (!timeStr) return '--:--';
  return timeStr.split('.')[0].slice(0, 5); 
}