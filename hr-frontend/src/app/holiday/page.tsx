"use client"

import React, { useState, useMemo } from "react";
import { 
  CalendarDays, Plus, ChevronLeft, ChevronRight, 
  FileText, Edit2, Trash2, X 
} from "lucide-react";
import { Card, CardTitle } from "@/components/ui/card";
import { title } from "process";

// ==========================================
// 📦 MOCK DATA & CONSTANTS
// ==========================================
const monthNamesTh = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม",
];

const INITIAL_HOLIDAYS = [
  { id: 1, title: "วันปีใหม่", startDate: "2026-01-01", endDate: "2026-01-01" },
  { id: 2, title: "วันจักรี", startDate: "2026-04-06", endDate: "2026-04-06" },
  { id: 3, title: "วันสงกรานต์", startDate: "2026-04-13", endDate: "2026-04-15" },
];

const EMPTY_HOLIDAY_FORM = { title: "", startDate: "", endDate: "" };

export default function CompanyCalendar() {
  // ==========================================
  // 📝 STATES
  // ==========================================
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [holidays, setHolidays] = useState(INITIAL_HOLIDAYS);
  
  // Modal States
  const [showHolidayModal, setShowHolidayModal] = useState(false);
  const [holidayForm, setHolidayForm] = useState(EMPTY_HOLIDAY_FORM);
  const [editingHolidayId, setEditingHolidayId] = useState<number | null>(null);

  // ==========================================
  // ⚙️ LOGIC & FUNCTIONS
  // ==========================================
  const prevMonth = () => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1));
  const nextMonth = () => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1));

  const handleOpenAddHoliday = () => {
    setHolidayForm(EMPTY_HOLIDAY_FORM);
    setEditingHolidayId(null);
    setShowHolidayModal(true);
  };

  const handleEditHoliday = (holiday: any) => {
    setHolidayForm({
      title: holiday.title,
      startDate: holiday.startDate,
      endDate: holiday.endDate || holiday.startDate,
    });
    setEditingHolidayId(holiday.id);
    setShowHolidayModal(true);
  };

  const handleDeleteHoliday = (id: number) => {
    if (confirm("คุณแน่ใจหรือไม่ว่าต้องการลบวันหยุดนี้?")) {
      setHolidays(holidays.filter(h => h.id !== id));
    }
  };

  const handleSaveHoliday = () => {
    if (!holidayForm.title || !holidayForm.startDate) {
      alert("กรุณากรอกชื่อและวันที่เริ่มต้นให้ครบถ้วน");
      return;
    }

    const newHolidayData = {
      id: editingHolidayId || Date.now(),
      title: holidayForm.title,
      startDate: holidayForm.startDate,
      // ถ้าไม่ได้ใส่วันสิ้นสุด ให้ใช้วันเดียวกับวันเริ่มต้น
      endDate: holidayForm.endDate || holidayForm.startDate, 
    };

    if (editingHolidayId) {
      setHolidays(holidays.map(h => h.id === editingHolidayId ? newHolidayData : h));
    } else {
      setHolidays([...holidays, newHolidayData]);
    }
    setShowHolidayModal(false);
  };

  // 1. หาข้อมูลวันหยุดในเดือนปัจจุบันที่แสดงบนปฏิทิน
  const currentMonthHolidays = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    
    return holidays.filter(h => {
      const start = new Date(h.startDate);
      const end = new Date(h.endDate || h.startDate);
      // เช็คว่าวันหยุดคาบเกี่ยวในเดือนที่กำลังเปิดดูอยู่หรือไม่
      return (start.getFullYear() === year && start.getMonth() === month) || 
             (end.getFullYear() === year && end.getMonth() === month);
    }).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());
  }, [holidays, calendarDate]);

  // 2. สร้างตารางปฏิทิน (Calendar Grid Data)
  const adminCalendarData = useMemo(() => {
    const year = calendarDate.getFullYear();
    const month = calendarDate.getMonth();
    const today = new Date();

    // หาวันแรกของเดือน (ปรับให้วันจันทร์เริ่มเป็นช่องแรก Index = 0)
    let firstDay = new Date(year, month, 1).getDay();
    firstDay = firstDay === 0 ? 6 : firstDay - 1; 

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];

    // ช่องว่างก่อนเริ่มวันที่ 1
    for (let i = 0; i < firstDay; i++) {
      cells.push({ day: 0 });
    }

    // วนลูปใส่วันที่และเช็คว่ามีวันหยุดไหม
    for (let d = 1; d <= daysInMonth; d++) {
      const currentDateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      const isToday = year === today.getFullYear() && month === today.getMonth() && d === today.getDate();
      
      // ค้นหาว่าวันนี้ตรงกับวันหยุดไหนบ้าง
      const holiday = holidays.find(h => {
        const cellTime = new Date(currentDateString).getTime();
        const startTime = new Date(h.startDate).getTime();
        const endTime = new Date(h.endDate || h.startDate).getTime();
        return cellTime >= startTime && cellTime <= endTime;
      });

      cells.push({ day: d, isToday, holiday });
    }

    return cells;
  }, [holidays, calendarDate]);

  return (
    
    <div className="lg:m-10">
        <div className="lg:mb-6">
            <h1>
                Holidays Setting
            </h1>
        </div>
    <Card className="rounded-xl border-2 border-slate-300 shadow-sm p-8 flex flex-col min-h-[600px] bg-white">
        
      
      <CardTitle className="text-xl font-black mb-8 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4 uppercase tracking-tight">
        <div className="flex items-center gap-3">
          <CalendarDays className="text-blue-500" size={28} /> 
          Company Calendar
        </div>
        <div className="flex items-center gap-3 w-full xl:w-auto">
          <button onClick={handleOpenAddHoliday} className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all px-4 py-2.5 rounded-xl border border-red-100 shadow-sm active:scale-95 flex-1 xl:flex-none">
            <Plus size={16} /> Add Holiday
          </button>
          <div className="flex items-center justify-between gap-3 bg-slate-50 border border-slate-100 rounded-xl px-2 py-1 shadow-sm flex-1 xl:flex-none">
            <button onClick={prevMonth} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all shadow-sm"><ChevronLeft size={16} /></button>
            <span className="w-32 xl:w-40 text-center text-sm font-black text-slate-700 tracking-wide">
              {monthNamesTh[calendarDate.getMonth()]} {calendarDate.getFullYear() + 543}
            </span>
            <button onClick={nextMonth} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all shadow-sm"><ChevronRight size={16} /></button>
          </div>
        </div>
      </CardTitle>

      <div className="flex flex-col lg:flex-row gap-8 h-full">
        
        <div className="w-full lg:w-1/3 flex flex-col border-b lg:border-b-0 lg:border-r border-slate-100 pb-6 lg:pb-0 lg:pr-8">
          <h5 className="font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2 text-sm">
            <FileText size={16} /> วันหยุดประจำเดือนนี้
          </h5>
          <div className="space-y-3 h-auto overflow-y-auto custom-scrollbar pr-2 flex-1">
            {currentMonthHolidays.length === 0 ? (
              <div className="text-center py-8 bg-slate-50/50 rounded-2xl border border-slate-100 border-dashed">
                <p className="text-xs font-bold text-slate-400 italic">ไม่มีวันหยุดในเดือนนี้</p>
              </div>
            ) : (
              currentMonthHolidays.map((h) => {
                const startD = parseInt(h.startDate.split("-")[2]);
                const endD = parseInt(h.endDate.split("-")[2]);
                const displayDate = h.startDate === h.endDate ? `${startD}` : `${startD}-${endD}`;
                return (
                  <div key={h.id} className="flex gap-3 bg-white px-4 py-3 justify-between rounded-2xl border border-slate-100 group hover:border-red-200 hover:shadow-sm transition-all items-center">
                    <div className="flex items-center gap-3">
                      <span className="min-w-[40px] text-center text-sm font-black text-red-600 bg-red-50 rounded-lg py-1 px-2 border border-red-100">
                        {displayDate}
                      </span>
                      <span className="text-sm font-bold text-slate-700 leading-tight">{h.title}</span>
                    </div>
                    <div className="flex self-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button onClick={() => handleEditHoliday(h)} className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="แก้ไข"><Edit2 size={14} /></button>
                      <button onClick={() => handleDeleteHoliday(h.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="ลบ"><Trash2 size={14} /></button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        
        <div className="w-full lg:w-2/3">
          <div className="grid grid-cols-7 gap-2 xl:gap-3">
            {["จ", "อ", "พ", "พฤ", "ศ", "ส", "อา"].map((d) => (
              <div key={d} className={`text-center text-base font-black uppercase tracking-widest mb-2 ${d === "ส" || d === "อา" ? "text-red-400" : "text-slate-400"}`}>
                {d}
              </div>
            ))}
            {adminCalendarData.map((cell, idx) => (
              <div 
                key={idx} 
                title={cell.holiday?.title} 
                className={`h-14 xl:h-16 rounded-2xl flex flex-col items-center justify-center border border-slate-100 relative transition-all ${
                  cell.day === 0 
                    ? "bg-transparent border-none" 
                    : cell.holiday 
                      ? "bg-red-50 border-red-200 hover:shadow-md cursor-pointer" 
                      : "bg-slate-50/50 hover:bg-white hover:border-blue-200 hover:shadow-sm cursor-pointer"
                }`}
              >
                <span className={`text-base font-black z-10 flex items-center justify-center w-5 h-5 rounded-xl ${
                  cell.isToday 
                    ? "text-white bg-blue-600 shadow-md shadow-blue-200" 
                    : cell.holiday 
                      ? "text-red-600" 
                      : "text-slate-600"
                }`}>
                  {cell.day || ""}
                </span>
                {cell.holiday && <div className="w-1.5 h-1.5 rounded-full mt-1 bg-red-500 absolute bottom-2 xl:bottom-3 shadow-sm" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      
      {showHolidayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowHolidayModal(false)} />
          <div className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-sm mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter flex items-center gap-2">
                {editingHolidayId ? <Edit2 className="text-blue-500"/> : <Plus className="text-red-500"/>} 
                {editingHolidayId ? "แก้ไขวันหยุด" : "ตั้งค่าวันหยุด"}
              </h3>
              <button onClick={() => setShowHolidayModal(false)} className="text-slate-400 hover:text-slate-900 bg-white p-2 rounded-xl shadow-sm transition-colors"><X size={20} /></button>
            </div>
            <div className="px-8 py-6 space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">ชื่อวันหยุด (Title) <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={holidayForm.title} 
                  onChange={(e) => setHolidayForm({ ...holidayForm, title: e.target.value })} 
                  placeholder="เช่น วันสงกรานต์" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all" 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">เริ่ม (Start) <span className="text-red-500">*</span></label>
                  <input 
                    type="date" 
                    value={holidayForm.startDate} 
                    onChange={(e) => setHolidayForm({ ...holidayForm, startDate: e.target.value })} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-bold outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">สิ้นสุด (End)</label>
                  <input 
                    type="date" 
                    value={holidayForm.endDate} 
                    min={holidayForm.startDate} 
                    onChange={(e) => setHolidayForm({ ...holidayForm, endDate: e.target.value })} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm font-bold outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all" 
                  />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-bold bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                * หากเป็นวันหยุดแค่วันเดียว ไม่จำเป็นต้องใส่วันที่สิ้นสุด
              </p>
            </div>
            <div className="flex items-center gap-3 px-8 py-5 border-t border-slate-100 bg-slate-50/50">
              <button onClick={() => setShowHolidayModal(false)} className="flex-1 py-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-700 hover:bg-white border border-transparent hover:border-slate-200 rounded-xl transition-all">ยกเลิก</button>
              <button onClick={handleSaveHoliday} className="flex-1 flex justify-center items-center gap-2 py-3 bg-red-600 hover:bg-red-700 text-white text-xs uppercase tracking-widest font-black rounded-xl shadow-lg shadow-red-200 transition-all active:scale-95">
                {editingHolidayId ? "บันทึกการแก้ไข" : "บันทึกวันหยุด"}
              </button>
            </div>
          </div>
        </div>
      )}
    </Card>
    </div>
  );
}