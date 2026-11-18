# Employee Management and Leave Management Portal

An enterprise-grade, full-stack **MERN** (MongoDB, Express.js, React.js, Node.js) web application architected for modern workforce administration, departmental organization, attendance tracking, and automated leave lifecycle management.

---

## 🚀 Key Highlights & Capabilities

- **Strict Role-Based Access Control (RBAC)**: Complete separation of privileges for **Super Admin**, **HR Manager**, and **Employee** enforced at both backend API middleware and frontend React Router guard levels.
- **Automated Leave Computation Engine**: Calculates exact requested working days automatically excluding Saturdays and Sundays, enforces non-overlapping application windows, and automatically deducts remaining balances only upon manager approval.
- **Daily Attendance Clock**: Real-time biometric simulator with check-in, check-out, working hours calculation, and automated shift status determination:
  - **Present**: Shifts exceeding 6 hours
  - **Half Day**: Shifts between 3 to 6 hours
  - **Absent**: Shifts under 3 hours or unmarked
  - **On Leave**: Automatically marked when approved leaves are active
- **Real-Time MongoDB Analytics**: Dedicated dashboards for all three roles powered directly by MongoDB aggregations with Chart.js visual visualizations (Department Headcount Bar Chart, Monthly Attendance Line Trends, and Leave Type Doughnut Distribution).
- **Comprehensive Reporting & Exporting**: Instant CSV downloads and print-optimized PDF generation for Employee Directory, Monthly Attendance, Leave Summary, and Department Cost reports.
- **Modern Enterprise SaaS UI/UX**: Designed following contemporary standards (inspired by Linear, Zoho People) using Tailwind CSS 3, Lucide icons, glassmorphic touches, and full responsiveness across mobile, tablet, and desktop devices.

---

## 🛠️ Technology Stack

| Domain | Technology / Framework | Version / Notes |
| :--- | :--- | :--- |
| **Frontend** | React.js | 18.2.0 |
| | Vite | 5.2.8 |
| | Tailwind CSS | 3.4.3 |
| | React Router DOM | 6.23.0 |
| | Chart.js & react-chartjs-2 | 4.4.2 / 5.2.0 |
| | Axios | 1.6.8 |
| | Lucide React | 0.378.0 |
| | date-fns | 3.6.0 |
| **Backend** | Node.js | v24+ |
| | Express.js | 4.19.2 |
| | MongoDB & Mongoose | 8.3.1 (MongoDB v8.2.5) |
| | JWT (jsonwebtoken) | 9.0.2 |
| | bcryptjs | 2.4.3 (10 salt rounds) |
| | cors & dotenv | 2.8.5 / 16.4.5 |

---

## 📂 Project Structure

```text
employee-management-portal/
├── client/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js                 # Axios instance with JWT bearer interceptors
│   │   ├── components/
│   │   │   ├── charts/
│   │   │   │   ├── BarChart.jsx         # Department headcount bar chart
│   │   │   │   ├── LineChart.jsx        # Attendance monthly trend chart
│   │   │   │   └── PieChart.jsx         # Leave type doughnut distribution
│   │   │   └── common/
│   │   │       ├── Badge.jsx            # Dynamic status badges with status styling
│   │   │       ├── Breadcrumb.jsx       # Navigation hierarchy trail
│   │   │       ├── ConfirmDialog.jsx    # Modal dialog for critical actions
│   │   │       ├── EmptyState.jsx       # Clean illustration & action for empty views
│   │   │       ├── LoadingSpinner.jsx   # Animated spinner & full-page loader
│   │   │       ├── Modal.jsx            # Accessible overlay modal
│   │   │       ├── Navbar.jsx           # Live clock, notifications, profile menu
│   │   │       ├── Sidebar.jsx          # Role-filtered responsive enterprise sidebar
│   │   │       └── StatCard.jsx         # Metric stat cards with trend badges
│   │   ├── context/
│   │   │   └── AuthContext.jsx          # React Context for session, user, and tokens
│   │   ├── layouts/
│   │   │   ├── AuthLayout.jsx           # Auth wrapper
│   │   │   └── DashboardLayout.jsx      # Master responsive dashboard container
│   │   ├── pages/
│   │   │   ├── attendance/
│   │   │   │   ├── AttendanceHistory.jsx # Organization attendance audit log
│   │   │   │   └── AttendanceTracker.jsx # Daily check in/out & monthly summary
│   │   │   ├── auth/
│   │   │   │   └── Login.jsx            # Split-screen login with quick role presets
│   │   │   ├── dashboard/
│   │   │   │   ├── Dashboard.jsx        # Role-based dashboard orchestrator
│   │   │   │   ├── EmployeeDashboard.jsx # Self-service employee dashboard
│   │   │   │   ├── HRDashboard.jsx      # People operations dashboard
│   │   │   │   └── SuperAdminDashboard.jsx # Executive command center & charts
│   │   │   ├── departments/
│   │   │   │   └── DepartmentManagement.jsx # Department CRUD & dependency protection
│   │   │   ├── employees/
│   │   │   │   ├── AddEmployee.jsx      # Employee onboarding form with quota setup
│   │   │   │   ├── EditEmployee.jsx     # Profile, job details, and quota editor
│   │   │   │   ├── EmployeeDetails.jsx  # Complete employee dossier
│   │   │   │   └── EmployeeList.jsx     # Directory with search, filters & pagination
│   │   │   ├── leaves/
│   │   │   │   ├── LeaveApplication.jsx # Leave request form (weekend exclusion)
│   │   │   │   ├── LeaveApproval.jsx    # HR decision queue & reject remarks modal
│   │   │   │   └── LeaveHistory.jsx     # Leave history & cancellation management
│   │   │   ├── payroll/
│   │   │   │   └── PayrollOverview.jsx  # Compensation breakdown & printable payslip
│   │   │   ├── profile/
│   │   │   │   └── MyProfile.jsx        # Profile update & password reset
│   │   │   ├── reports/
│   │   │   │   └── ReportsAnalytics.jsx # 4 report suites, CSV & Print/PDF export
│   │   │   ├── settings/
│   │   │   │   └── SystemSettings.jsx   # Global leave policies & shift thresholds
│   │   │   └── NotFound.jsx             # Custom 404 page
│   │   ├── utils/
│   │   │   ├── exportUtils.js           # CSV download & print helper
│   │   │   └── formatters.js            # Date, currency, badge, and calendar logic
│   │   ├── App.jsx                      # Route definitions with ProtectedRoute guards
│   │   ├── index.css                    # Tailwind directives & print media styles
│   │   └── main.jsx                     # Application bootstrap
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js                   # Vite config with /api reverse proxy
├── server/
│   ├── config/
│   │   └── db.js                        # Mongoose MongoDB connection handler
│   ├── controllers/
│   │   ├── attendanceController.js      # Check-in, checkout, shift calculation
│   │   ├── authController.js            # Login, current user, profile, password
│   │   ├── departmentController.js      # Department CRUD & dependency validation
│   │   ├── employeeController.js        # Full employee CRUD, filters, pagination
│   │   ├── leaveController.js           # Working days calc, balance deduction, approval
│   │   └── reportController.js          # Aggregated dashboard analytics & reports
│   ├── middleware/
│   │   ├── auth.js                      # JWT verification & role authorization (RBAC)
│   │   └── errorHandler.js              # Centralized error handler & status codes
│   ├── models/
│   │   ├── Attendance.js                # Attendance schema with compound unique index
│   │   ├── Department.js                # Department schema with head reference
│   │   ├── Leave.js                     # Leave schema with approval & remarks
│   │   └── User.js                      # User schema with bcrypt & leave quotas
│   ├── routes/
│   │   ├── attendanceRoutes.js
│   │   ├── authRoutes.js
│   │   ├── departmentRoutes.js
│   │   ├── employeeRoutes.js
│   │   ├── leaveRoutes.js
│   │   └── reportRoutes.js
│   ├── seed/
│   │   └── seed.js                      # Seed script initializing admin, HR, staff & data
│   ├── utils/
│   │   └── dateUtils.js                 # Weekend exclusion, hours calc, shift states
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   ├── run-tests.js                     # Automated E2E test runner launcher
│   ├── server.js                        # Express server entry point
│   └── test-runner.js                   # Full 16-point integration test suite
├── package.json                         # Root package with concurrently scripts
└── README.md
```

---

## 🔐 Multi-Panel Gateways & Access Clearance

The portal is architected with strict multi-panel isolation. Each domain has its own dedicated portal gateway with server-enforced clearance checks:

| Portal | Gateway URL | Required Role | Permitted Access Scope |
| :--- | :--- | :--- | :--- |
| **Super Admin Gateway** | `/login?portal=admin` (or `/admin/login`) | `admin` | Full executive command, company policy, reports, user approvals |
| **HR Operations Portal** | `/login?portal=hr` (or `/hr/login`) | `hr` or `admin` | Employee directory, leave queue decisions, attendance audits |
| **Employee Self-Service** | `/login?portal=employee` (or `/employee/login`) | `employee` | Daily attendance clock, leave applications, payslips |

---

## 🛡️ Zero-Access Architecture for Public Account Creation

To guarantee enterprise compliance and prevent unauthorized access:
1. **Quarantined Registration**: When any new user signs up via `/register` (for Employee, HR, or Admin panels), their account is immediately isolated in **`status: 'pending'`** with **Zero System Access**.
2. **Access Blockade**: Pending accounts are strictly barred from logging into dashboards or querying internal API routes (HTTP 403 `ACCOUNT_PENDING`).
3. **Pending Approval Dossier**: Users can track their clearance status at `/pending-approval`.
4. **Administrative Activation**: A Super Admin or HR Manager reviews the pending applicant in the **Employee Directory**, assigns their department and designation, and clicks **Approve & Activate** to unlock the account.
5. **Security Registration Key (Optional)**: Organizations can distribute `ADMIN_REGISTER_KEY` to internal staff to bypass the queue during setup.

---

## 🔑 Initial Corporate System Accounts

For initial deployment and administration, the following pre-configured accounts are available:

| Role | Corporate Email | Password | Clearance |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@company.com` | `Admin@123` | Full Master Administration |
| **HR Manager** | `sarah.hr@company.com` | `Hr@123` | HR Operations & Approvals |
| **Staff Engineer** | `michael.chen@company.com` | `Emp@123` | Employee Self-Service |

---

## 🧪 Comprehensive Integration Test Suite (23 Points)

Run the full end-to-end integration test suite validating role isolation, zero-access quarantine, leave rules, and APIs:
```bash
cd server
node run-tests.js
```
The test suite validates:
1. Health check endpoint responsiveness
2. Authentication & JWT generation for all 3 roles
3. Multi-Panel Guard: Employee strictly blocked from Super Admin Gateway
4. Multi-Panel Guard: Employee strictly blocked from HR Operations Portal
5. Zero-Access Architecture: New public registration created in quarantined pending state
6. Zero-Access Enforced: Pending account rejected from login with ACCOUNT_PENDING
7. Admin Clearance: Super Admin successfully approved and activated pending account
8. Password Recovery: Secure verification code generated for account
9. Password Recovery: Password reset verified and updated successfully
10. Strict RBAC blocking employees from restricted routes (HTTP 403 Forbidden)
11. Super Admin dashboard real metrics and Chart.js datasets
12. HR dashboard metrics and department stats
13. Employee dashboard personal quotas and monthly summaries
14. Employee CRUD (Creation, Update, Status toggle, Deletion)
15. Leave calculation with automated weekend exclusion
16. Overlap prevention rejecting colliding leave windows
17. Automated leave balance deduction upon HR approval
18. Department dependency protection preventing deletion of departments with active staff
11. Department dependency protection preventing deletion of departments with active staff

---

## 📋 Implemented Features Matrix

### 1. Authentication & Security
- [x] JWT token-based authentication with expiration handling
- [x] Passwords hashed with bcryptjs (10 salt rounds)
- [x] Password field excluded by default (`select: false`) in Mongoose schema
- [x] Role-Based Access Control (`protect`, `authorize('admin', 'hr')`)
- [x] Protected frontend routes redirecting unauthorized users to `/dashboard`
- [x] Secure password change and personal profile updates
- [x] Preset demo buttons on login for seamless evaluation

### 2. Employee Management
- [x] Full CRUD operations (Create, Read, Update, Delete)
- [x] Profile details view with full employee dossier
- [x] Account status toggling (Active / Inactive)
- [x] Live search by name, email, or designation
- [x] Multi-criteria filtering by department, designation, role, and status
- [x] Pagination controls (Page navigation, limit per page)
- [x] Duplicate email validation and Department foreign key validation

### 3. Leave Management
- [x] 5 Leave Categories with standard quotas:
  - Casual Leave (12 days)
  - Sick Leave (10 days)
  - Earned Leave (15 days)
  - Maternity Leave (180 days)
  - Paternity Leave (15 days)
- [x] Automated calculation of requested days **excluding Saturdays & Sundays**
- [x] Real-time quota check preventing applications exceeding available balance
- [x] Anti-overlap algorithm preventing duplicate or overlapping leave dates
- [x] Dedicated HR Approval Queue with instant Approve and Reject modals
- [x] Mandatory rejection remarks recorded in leave history
- [x] Leave balance deduction executed **only upon approval**
- [x] Employee leave cancellation for pending applications

### 4. Attendance Management
- [x] Interactive Daily Check-In and Check-Out clock
- [x] Real-time digital clock display
- [x] Multiple check-in prevention on the same calendar day
- [x] Checkout validation preventing checkout without prior check-in
- [x] Automated working hours calculation with 2 decimal precision
- [x] Dynamic shift status determination:
  - `Present`: > 6 hours
  - `Half Day`: 3 to 6 hours
  - `Absent`: < 3 hours
  - `On Leave`: Automatically set when an approved leave matches today
- [x] Full organization attendance log with department and date filters
- [x] CSV export of attendance logs

### 5. Department Management
- [x] Department creation, editing, and deletion
- [x] Assignment of Department Heads from staff roster
- [x] Dependency check: blocks deletion if any active employees belong to the department
- [x] Roster inspection modal showing staff assigned to each department

### 6. Dashboards & Analytics
- [x] **Super Admin Dashboard**:
  - Key metrics: Total Employees, Active Employees, Total Departments, Pending Leaves, Present Today, On Leave Today
  - Department Headcount Bar Chart
  - Monthly Attendance Trends Line Chart
  - Leave Distribution Doughnut Chart
- [x] **HR Manager Dashboard**:
  - Key metrics: Total Employees, Pending Leaves, Present Today, Absent Today
  - Department headcount overview
  - Recent leave applications table with inline approval actions
- [x] **Employee Dashboard**:
  - Welcome greeting with job designation
  - Today's shift clock status
  - Leave balance remaining cards
  - Monthly attendance summary breakdown

### 7. Reports & Payroll
- [x] Employee Directory Report with filtering
- [x] Monthly Attendance Audit Report
- [x] Leave Summary Report with status filters
- [x] Department Headcount & Payroll Expense Report
- [x] CSV export for all report suites
- [x] Printable PDF-formatted payslip with salary breakdown (Base, HRA, Allowances, PF, Tax, Net Pay)

---

## 📌 Notes & Limitations
- **Local MongoDB**: Configured for local MongoDB instance at `mongodb://127.0.0.1:27017/emp-portal`. A cloud MongoDB Atlas URI can easily be provided in `server/.env` under `MONGO_URI`.
- **Avatar Storage**: Uses image URLs (such as Unsplash CDN links or standard avatar generators). For production deployment, integration with cloud storage (e.g. AWS S3, Cloudinary, or Vercel Blob) can be plugged into the profile image upload handler.
