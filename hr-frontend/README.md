# HR Core System - Frontend

ระบบบริหารทุนมนุษย์ (Human Resource Management System) ขั้นสูง

## 📋 ข้อกำหนดเบื้องต้น

- Node.js v18 ขึ้นไป
- npm หรือ yarn

## 🚀 การติดตั้งและเปิดระบบ

### 1. ติดตั้ง Dependencies

```bash
npm install
# หรือ
yarn install
```

### 2. รัน Development Server

```bash
npm run dev
# หรือ
yarn dev
```

เปิดเบราว์เซอร์ไปที่ [http://localhost:3000](http://localhost:3000)

### 3. Build สำหรับ Production

```bash
npm run build
npm start
```

## 📁 โครงสร้างโปรเจค

```
hr-frontend/
├── public/                 # ไฟล์สาธารณะ
├── src/
│   ├── components/        # React Components
│   ├── pages/             # Next.js Pages
│   ├── routes/            # Route Components
│   ├── contexts/          # React Contexts
│   ├── hooks/             # Custom Hooks
│   ├── lib/               # Utility Functions
│   ├── data/              # Mock Data
│   ├── App.tsx            # Main App Component
│   ├── index.css          # Global Styles
│   ├── globals.css        # Tailwind Styles
│   └── layout.tsx         # Root Layout
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

## 🛠 เทคโนโลยีที่ใช้

- **Next.js 16** - React Framework
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **React Router** - Client-side Routing
- **React Query** - Data Fetching
- **Recharts** - Charts & Graphs
- **Radix UI** - UI Components

## 📦 Scripts ที่มี

| Command | účel |
|---------|------|
| `npm run dev` | เปิด development server |
| `npm run build` | Build สำหรับ production |
| `npm start` | รัน production server |
| `npm run lint` | ตรวจสอบ code style |

## 🔌 Backend API

Frontend นี้เชื่อมต่อกับ Backend API ที่ทำงานใน `http://localhost:5000`

### เปิด Backend:
```bash
cd ../hr-backend-api
npm install
npm start
```

## 📝 Features หลัก

- ✅ Dashboard - สรุปข้อมูล HR
- ✅ Employee Management - จัดการข้อมูลพนักงาน
- ✅ Organization Structure - โครงสร้างองค์กร
- ✅ Time & Attendance - บันทึกการเข้างาน
- ✅ Leave Management - บริหารการลา
- ✅ Contracts - จัดการสัญญาจ้าง
- ✅ Reports - รายงาน HR
- ✅ Permissions - สิทธิ์ในการใช้ระบบ

## 🎨 Customization

### เปลี่ยนสีและ Theme
ดูไฟล์ `src/index.css` ในส่วน `:root` CSS variables

### เปลี่ยน Tailwind Config
ดูไฟล์ `tailwind.config.ts`

## 📖 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript Handbook](https://www.typescriptlang.org/docs)

## 📧 Support

หากมีปัญหา กรุณาติดต่อทีม Development

---

**HR Core System v1.0** | Created with ❤️
