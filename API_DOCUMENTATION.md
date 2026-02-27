# 📚 HR System API Documentation

**Base URL:** `http://localhost:5000/api`

---

## 🔐 Authentication APIs
**Base Route:** `/api/auth`

| Method | Endpoint | Auth Required | Description |
|--------|----------|:-:|-----------|
| `POST` | `/login` | ❌ | เข้าสู่ระบบด้วย username + password |

### POST /login
```json
Request Body:
{
  "username": "admin",
  "password": "123456"
}

Response (200 OK):
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "login successful"
}
```

---

## 👤 User APIs
**Base Route:** `/api/users`

| Method | Endpoint | Auth Required | Description |
|--------|----------|:-:|-----------|
| `GET` | `/current` | ✅ | ดึงข้อมูลผู้ใช้ปัจจุบัน ⭐ NEW |
| `GET` | `/` | ✅ | ดึงข้อมูลผู้ใช้ทั้งหมด |

### GET /current
```json
Response (200 OK):
{
  "id": 1,
  "username": "admin",
  "email": "admin@example.com",
  "role": "Administrator"
}
```

### GET /
```json
Response (200 OK):
[
  {
    "id": 1,
    "username": "admin",
    "email": "admin@example.com",
    "role_name": "Administrator"
  },
  ...
]
```

---

## 🏢 Company APIs
**Base Route:** `/api/companies`

| Method | Endpoint | Auth Required | Description |
|--------|----------|:-:|-----------|
| `GET` | `/` | ✅ | ดึงข้อมูลบริษัททั้งหมด |

### GET /
```json
Response (200 OK):
[
  {
    "id": 1,
    "CODE": "TT",
    "name_th": "บริษัท ทีที",
    "name_en": "TT Company",
    "parent_id": null,
    "children": [...]
  },
  ...
]
```

---

## 👨‍💼 Employee APIs
**Base Route:** `/api/employees`

| Method | Endpoint | Auth Required | Description |
|--------|----------|:-:|-----------|
| `GET` | `/` | ✅ | ดึงข้อมูลพนักงานทั้งหมด |
| `POST` | `/` | ✅ | สร้างพนักงานใหม่ |
| `GET` | `/:id` | ✅ | ดึงข้อมูลพนักงานตามรหัส |
| `PUT` | `/:id` | ✅ | อัปเดตข้อมูลพนักงาน |

### GET /
```json
Response (200 OK):
[
  {
    "id": 1,
    "firstName": "สมชาย",
    "lastName": "วิวัฒน์",
    "email": "somchai@example.com",
    "department": "HR",
    "position": "HR Manager",
    "companyId": 1,
    "hireDate": "2023-01-15"
  },
  ...
]
```

### POST /
```json
Request Body:
{
  "firstName": "สมชาย",
  "lastName": "วิวัฒน์",
  "email": "somchai@example.com",
  "department": "HR",
  "position": "HR Manager",
  "companyId": 1,
  "hireDate": "2023-01-15"
}

Response (201 Created):
{
  "id": 1,
  "message": "Employee created successfully"
}
```

### GET /:id
```json
Response (200 OK):
{
  "id": 1,
  "firstName": "สมชาย",
  "lastName": "วิวัฒน์",
  "email": "somchai@example.com",
  "department": "HR",
  "position": "HR Manager",
  "companyId": 1,
  "hireDate": "2023-01-15"
}
```

### PUT /:id
```json
Request Body:
{
  "firstName": "สมชาย",
  "lastName": "วิวัฒน์",
  "email": "somchai@example.com",
  "department": "Sales",
  "position": "Sales Manager"
}

Response (200 OK):
{
  "message": "Employee updated successfully"
}
```

---

## 📋 Attendance APIs
**Base Route:** `/api/attendance`

| Method | Endpoint | Auth Required | Description |
|--------|----------|:-:|-----------|
| `GET` | `/` | ✅ | ดึงข้อมูลบันทึกการเข้างานทั้งหมด |
| `POST` | `/record` | ✅ | บันทึกเข้างาน |
| `PUT` | `/check-out` | ✅ | บันทึกออกงาน |

### GET /
```json
Response (200 OK):
[
  {
    "id": 1,
    "employeeId": 1,
    "date": "2026-02-27",
    "checkInTime": "08:00:00",
    "checkOutTime": "17:00:00",
    "status": "present"
  },
  ...
]
```

### POST /record
```json
Request Body:
{
  "employeeId": 1,
  "date": "2026-02-27"
}

Response (201 Created):
{
  "id": 1,
  "message": "Check-in recorded successfully"
}
```

### PUT /check-out
```json
Request Body:
{
  "employeeId": 1,
  "date": "2026-02-27"
}

Response (200 OK):
{
  "message": "Check-out recorded successfully"
}
```

---

## 📄 Leave APIs
**Base Route:** `/api/leaves`

| Method | Endpoint | Auth Required | Description |
|--------|----------|:-:|-----------|
| `GET` | `/requests` | ✅ | ดึงรายการใบลาทั้งหมด |
| `POST` | `/request` | ✅ | ส่งคำขอใบลาใหม่ |
| `PUT` | `/:id/status` | ✅ | อัปเดตสถานะใบลา (อนุมัติ/ปฏิเสธ) |

### GET /requests
```json
Response (200 OK):
[
  {
    "id": 1,
    "employeeId": 1,
    "leaveType": "sick",
    "startDate": "2026-02-28",
    "endDate": "2026-02-28",
    "reason": "ป่วย",
    "status": "pending",
    "createdAt": "2026-02-27"
  },
  ...
]
```

### POST /request
```json
Request Body:
{
  "employeeId": 1,
  "leaveType": "sick",
  "startDate": "2026-02-28",
  "endDate": "2026-02-28",
  "reason": "ป่วย"
}

Response (201 Created):
{
  "id": 1,
  "message": "Leave request created successfully"
}
```

### PUT /:id/status
```json
Request Body:
{
  "status": "approved"
}

Response (200 OK):
{
  "message": "Leave status updated successfully"
}
```

---

## 📝 Contract APIs
**Base Route:** `/api/contracts`

| Method | Endpoint | Auth Required | Description |
|--------|----------|:-:|-----------|
| `GET` | `/` | ✅ | ดึงสัญญาทั้งหมด |
| `POST` | `/` | ✅ | สร้างสัญญาใหม่ |

### GET /
```json
Response (200 OK):
[
  {
    "id": 1,
    "employeeId": 1,
    "contractType": "permanent",
    "startDate": "2023-01-15",
    "endDate": "2025-01-15",
    "status": "active"
  },
  ...
]
```

### POST /
```json
Request Body:
{
  "employeeId": 1,
  "contractType": "permanent",
  "startDate": "2023-01-15",
  "endDate": "2025-01-15"
}

Response (201 Created):
{
  "id": 1,
  "message": "Contract created successfully"
}
```

---

## 🔄 Shift APIs
**Base Route:** `/api/shifts`

| Method | Endpoint | Auth Required | Description |
|--------|----------|:-:|-----------|
| `GET` | `/` | ✅ | ดึงข้อมูลยามทั้งหมด |
| `POST` | `/` | ✅ | สร้างยามใหม่ |

### GET /
```json
Response (200 OK):
[
  {
    "id": 1,
    "NAME": "Morning Shift",
    "start_time": "08:00:00",
    "end_time": "16:00:00",
    "company_id": 1
  },
  ...
]
```

### POST /
```json
Request Body:
{
  "company_id": 1,
  "shift_name": "Morning Shift",
  "start_time": "08:00:00",
  "end_time": "16:00:00"
}

Response (201 Created):
{
  "id": 1,
  "message": "Shift created successfully"
}
```

---

## 📅 Schedule APIs
**Base Route:** `/api/schedules`

| Method | Endpoint | Auth Required | Description |
|--------|----------|:-:|-----------|
| `GET` | `/` | ✅ | ดึงตารางงานทั้งหมด |
| `POST` | `/` | ✅ | จัดตารางงานใหม่ |

### GET /
```json
Response (200 OK):
[
  {
    "id": 1,
    "employeeId": 1,
    "shiftId": 1,
    "date": "2026-02-27",
    "status": "scheduled"
  },
  ...
]
```

### POST /
```json
Request Body:
{
  "employeeId": 1,
  "shiftId": 1,
  "date": "2026-02-27"
}

Response (201 Created):
{
  "id": 1,
  "message": "Schedule created successfully"
}
```

---

## 🏛️ Organization APIs
**Base Route:** `/api/org`

| Method | Endpoint | Auth Required | Description |
|--------|----------|:-:|-----------|
| `GET` | `/departments` | ✅ | ดึงข้อมูลแผนกทั้งหมด |
| `POST` | `/departments` | ✅ | สร้างแผนกใหม่ |
| `GET` | `/positions` | ✅ | ดึงข้อมูลตำแหน่งทั้งหมด |
| `POST` | `/positions` | ✅ | สร้างตำแหน่งใหม่ |

### GET /departments
```json
Response (200 OK):
[
  {
    "id": 1,
    "department_name": "Human Resources",
    "company_id": 1,
    "manager_id": 1
  },
  ...
]
```

### POST /departments
```json
Request Body:
{
  "department_name": "Human Resources",
  "company_id": 1,
  "manager_id": 1
}

Response (201 Created):
{
  "id": 1,
  "message": "Department created successfully"
}
```

### GET /positions
```json
Response (200 OK):
[
  {
    "id": 1,
    "position_name": "HR Manager",
    "department_id": 1,
    "salary_level": "level_5"
  },
  ...
]
```

### POST /positions
```json
Request Body:
{
  "position_name": "HR Manager",
  "department_id": 1,
  "salary_level": "level_5"
}

Response (201 Created):
{
  "id": 1,
  "message": "Position created successfully"
}
```

---

## 📊 Report APIs
**Base Route:** `/api/reports`

| Method | Endpoint | Auth Required | Description |
|--------|----------|:-:|-----------|
| `GET` | `/employee-summary` | ✅ | ดึงรายงานสรุปพนักงาน |
| `GET` | `/attendance-daily` | ✅ | ดึงรายงานการเข้างานรายวัน |

### GET /employee-summary
```json
Response (200 OK):
{
  "totalEmployees": 45,
  "byDepartment": [
    { "department": "HR", "count": 5 },
    { "department": "Sales", "count": 20 },
    { "department": "IT", "count": 20 }
  ],
  "byCompany": [
    { "company": "TT Company", "count": 45 }
  ]
}
```

### GET /attendance-daily
```json
Response (200 OK):
[
  {
    "date": "2026-02-27",
    "present": 40,
    "absent": 3,
    "late": 2,
    "wfh": 0
  },
  ...
]
```

---

## 🔑 Authentication Header

ทุก API endpoint ที่มี `✅` ต้องใส่ Token ใน Header:

```bash
curl -H "Authorization: Bearer {token}" \
     http://localhost:5000/api/employees
```

---

## ✅ Implementation Status

- ✅ Authentication APIs (POST /login)
- ✅ User APIs (GET /current, GET /)
- ✅ Company APIs (GET /)
- ✅ Employee APIs (GET /, POST /, GET /:id, PUT /:id)
- ✅ Attendance APIs (GET /, POST /record, PUT /check-out)
- ✅ Leave APIs (GET /requests, POST /request, PUT /:id/status)
- ✅ Contract APIs (GET /, POST /)
- ✅ Shift APIs (GET /, POST /)
- ✅ Schedule APIs (GET /, POST /)
- ✅ Organization APIs (GET /departments, POST /departments, GET /positions, POST /positions)
- ✅ Report APIs (GET /employee-summary, GET /attendance-daily)

---

## 🚀 Quick Start

1. **Ensure backend is running:**
   ```bash
   cd hr-backend-api
   npm start
   ```

2. **Ensure frontend is running:**
   ```bash
   cd hr-frontend
   npm run dev
   ```

3. **Login first to get token:**
   ```bash
   POST http://localhost:5000/api/auth/login
   Body: { "username": "admin", "password": "123456" }
   ```

4. **Use token in subsequent requests:**
   - Token is auto-stored in localStorage
   - Frontend API utility (`lib/api.ts`) automatically injects token in Authorization header

---

## 📝 Notes

- All timestamps are in ISO 8601 format
- Authentication uses JWT (JSON Web Tokens)
- Base response structure includes proper HTTP status codes
- Error responses include descriptive error messages
- All dates use format: `YYYY-MM-DD`
- All times use 24-hour format: `HH:MM:SS`
