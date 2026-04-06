# 🎓 PlaceTrack — Placement Management System

A full-stack placement management system built with **React + Node.js + MongoDB**.

---

## 🗂️ Project Structure

```
placement-system/
├── backend/                  # Express + MongoDB API
│   ├── models/               # Mongoose schemas
│   │   ├── User.js           # Admin & Student model
│   │   ├── Company.js
│   │   ├── Job.js            # Includes eligibility criteria
│   │   ├── Drive.js          # Placement drive
│   │   ├── Application.js    # Student application (with duplicate prevention)
│   │   ├── Notification.js   # Auto-expiring notifications
│   │   └── Material.js       # Study materials
│   ├── routes/               # REST API endpoints
│   │   ├── auth.js           # Login, Register, /me
│   │   ├── companies.js
│   │   ├── jobs.js
│   │   ├── drives.js         # Includes /notify — eligibility check + send
│   │   ├── applications.js   # Apply, status update, my applications
│   │   ├── notifications.js  # Read, mark read, auto-expire
│   │   ├── students.js       # Profile update, resume upload
│   │   └── materials.js      # Upload, download, delete
│   ├── middleware/
│   │   ├── auth.js           # JWT protect, adminOnly, studentOnly
│   │   └── upload.js         # Multer config for resumes & materials
│   ├── seed.js               # Seed script with sample data
│   ├── server.js             # Express entry point
│   └── .env.example
│
├── frontend/                 # React SPA
│   └── src/
│       ├── context/
│       │   └── AuthContext.js  # JWT auth state
│       ├── utils/
│       │   └── api.js          # Axios with interceptors
│       ├── components/
│       │   ├── admin/AdminLayout.js
│       │   └── student/StudentLayout.js
│       ├── pages/
│       │   ├── Login.js
│       │   ├── Register.js
│       │   ├── admin/
│       │   │   ├── Dashboard.js
│       │   │   ├── Companies.js
│       │   │   ├── Jobs.js
│       │   │   ├── Drives.js       # 🔔 Notify eligible students button
│       │   │   ├── Applications.js # Status management per drive
│       │   │   ├── Students.js
│       │   │   └── Materials.js
│       │   └── student/
│       │       ├── Dashboard.js
│       │       ├── Profile.js      # CGPA, branch, resume upload
│       │       ├── Drives.js       # Eligible/Applied filter
│       │       ├── DriveDetail.js  # Apply Now with eligibility check
│       │       ├── Applications.js # Status timeline
│       │       └── Materials.js
│       ├── App.js                  # Routes
│       └── index.css               # Full design system (dark theme)
│
└── package.json              # Root scripts (runs both servers)
```

---

## ⚙️ Prerequisites

- **Node.js** v18+
- **MongoDB** — running locally on port 27017 OR a MongoDB Atlas URI
- **npm** v8+

---

## 🚀 Setup Instructions

### 1. Clone / Download the project

```bash
cd placement-system
```

### 2. Install all dependencies

```bash
# Root (concurrently)
npm install

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 3. Configure environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/placement_system
JWT_SECRET=change_this_to_a_long_random_string
```

> For MongoDB Atlas: `MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/placement_system`

### 4. Seed sample data (optional but recommended)

```bash
cd backend
node seed.js
```

This creates:
| Role | Email | Password |
|------|-------|----------|
| Admin | admin@college.edu | admin123 |
| Student (CSE, 8.5 CGPA) | rahul@college.edu | student123 |
| Student (ECE, 7.8 CGPA) | priya@college.edu | student123 |
| Student (CSE, 6.5 CGPA) | amit@college.edu | student123 |

### 5. Run the application

**Option A — Run both at once (from root):**
```bash
npm run dev
```

**Option B — Run separately:**
```bash
# Terminal 1 (backend)
cd backend && npm run dev

# Terminal 2 (frontend)
cd frontend && npm start
```

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api

---

## 🔁 Complete System Flow

```
1. Admin logs in → Adds Company → Creates Job (role, salary, CGPA, branches)
                                              ↓
                               Creates Drive (job + date + deadline)
                                              ↓
                               Clicks "🔔 Notify" on drive
                                              ↓
                    System checks: CGPA ≥ required AND branch in eligibleBranches
                                              ↓
                         Only eligible students get notification
                                              ↓
2. Student logs in → Sees notification in sidebar bell
                   → Clicks → Drive Details page
                   → Sees eligibility check (CGPA ✓/✗, Branch ✓/✗)
                   → Clicks "Apply Now"
                   → System prevents duplicate applications
                                              ↓
3. Admin → Applications page → Filter by drive → Updates status:
            Applied → Shortlisted → Selected / Rejected
                                              ↓
4. Student → My Applications → Sees status timeline + result
                                              ↓
5. After deadline → Notifications auto-hidden (MongoDB TTL index)
                  → Drive still visible but Apply button disabled
```

---

## 🔑 API Endpoints

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Student registration |
| POST | `/api/auth/login` | Public | Login (admin/student) |
| GET | `/api/auth/me` | Auth | Current user |
| GET/POST | `/api/companies` | Admin | List / create companies |
| GET/POST | `/api/jobs` | Admin | List / create jobs |
| GET | `/api/drives/active` | Student | Active (non-expired) drives |
| POST | `/api/drives/:id/notify` | Admin | Send to eligible students |
| GET | `/api/applications/my` | Student | My applications |
| POST | `/api/applications` | Student | Apply to drive |
| PATCH | `/api/applications/:id/status` | Admin | Update status |
| PUT | `/api/students/profile` | Student | Update profile |
| POST | `/api/students/resume` | Student | Upload resume |
| GET/POST | `/api/materials` | Auth/Admin | Study materials |
| GET | `/api/notifications` | Student | Active notifications |

---

## 🎨 Features Summary

### Admin
- ✅ Dashboard with key stats
- ✅ Company management (CRUD)
- ✅ Job management with eligibility criteria (CGPA, branches, skills)
- ✅ Drive scheduling with date + deadline
- ✅ One-click notification to all eligible students
- ✅ Application review with status dropdown (Applied → Shortlisted → Selected → Rejected)
- ✅ Filter applications by drive
- ✅ Student directory with profile completion status
- ✅ Study material upload (PDF, Word, PPT, ZIP)

### Student
- ✅ Registration + profile completion (CGPA, branch, skills)
- ✅ Resume upload
- ✅ Notification bell (only eligible, auto-expires after deadline)
- ✅ Drive listing with eligible/applied filters and countdown
- ✅ Drive detail page with real-time eligibility check
- ✅ Apply Now / Already Applied flow
- ✅ Application status timeline (Applied → Shortlisted → Selected)
- ✅ Study material download by category

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Axios |
| Styling | Pure CSS (custom dark design system) |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| File Uploads | Multer |
| Notifications | React Hot Toast |

---

## 📝 Notes for Viva

1. **Eligibility check** happens twice: once when admin sends notification (server filters students), and again when student clicks Apply (server re-validates before creating application).
2. **Duplicate prevention** is enforced by a unique compound index on `(student, drive)` in MongoDB.
3. **Notification expiry** uses MongoDB's TTL index (`expireAfterSeconds: 0` on `expiresAt` field) — no cron job needed.
4. **JWT tokens** are stored in `localStorage` and attached to every request via an Axios request interceptor.
5. **Role-based routing** in React redirects admin to `/admin` and students to `/student` automatically.
