require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const http = require('http');
const mongoose = require('mongoose');
const User = require('./models/User');
const Organization = require('./models/Organization');
const Department = require('./models/Department');
const Leave = require('./models/Leave');
const Attendance = require('./models/Attendance');

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/emp-portal';

function request(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, headers: res.headers, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, raw: body });
        }
      });
    });

    req.on('error', (err) => reject(err));

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function cleanupTestData() {
  const testOrgs = await Organization.find({
    $or: [
      { slug: { $regex: /^(acme-global|beta-logistics)/i } },
      { businessEmail: { $in: ['contact@acmeglobal.com', 'ops@betacorp.com'] } },
      { registrationNumber: { $in: ['US-EIN-987654321', 'US-EIN-112233445', 'U72200MH2021PTC123456', 'U60200WA2022PTC654321'] } },
      { cin: { $in: ['U72200MH2021PTC123456', 'U60200WA2022PTC654321'] } },
    ],
  });
  const testOrgIds = testOrgs.map((o) => o._id);

  await Attendance.deleteMany({
    $or: [{ organization: { $in: testOrgIds } }],
  });
  await Leave.deleteMany({
    $or: [{ organization: { $in: testOrgIds } }],
  });
  await Department.deleteMany({
    $or: [{ organization: { $in: testOrgIds } }],
  });
  await User.deleteMany({
    $or: [
      { organization: { $in: testOrgIds } },
      {
        email: {
          $in: [
            'admin@acmeglobal.com',
            'hr@acmeglobal.com',
            'bob@acmeglobal.com',
            'staff.pending@acmeglobal.com',
            'admin@betacorp.com',
          ],
        },
      },
    ],
  });
  await Organization.deleteMany({ _id: { $in: testOrgIds } });
}

async function runTests() {
  console.log('🧪 STARTING COMPREHENSIVE PRODUCTION E2E SUITE\n');
  let passCount = 0;
  let failCount = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passCount++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failCount++;
    }
  }

  try {
    // 0. Ensure Database Connection & Cleanup any test artifacts
    await mongoose.connect(MONGO_URI);
    await cleanupTestData();

    // 1. Health check
    const health = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/health',
      method: 'GET',
    });
    assert(health.status === 200 && health.data.status === 'ok', 'Health Check endpoint responding (status: 200)');

    // 2. Master Platform Maker Login
    const masterLogin = await request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'maker@hrms.com', password: 'Maker@2026', portal: 'admin' }
    );
    assert(
      masterLogin.status === 200 && masterLogin.data.user.role === 'master',
      'Platform Maker Login: Master credentials authorized with role: "master"'
    );
    const masterToken = masterLogin.data.token;

    // 2b. Master Dashboard Metrics Verification
    const masterDashRes = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/reports/dashboard',
      method: 'GET',
      headers: { Authorization: `Bearer ${masterToken}` },
    });
    assert(
      masterDashRes.status === 200 && masterDashRes.data.role === 'master' && masterDashRes.data.metrics !== undefined,
      'Master Dashboard: /api/reports/dashboard responds immediately with 200 and master metrics'
    );

    // 3. Official Indian Organization Registration (MCA CIN / GSTIN Onboarding)
    const orgRegisterRes = await request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/organizations/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        companyName: 'Acme Global Technologies Private Limited',
        legalEntityType: 'Private Limited (Pvt Ltd)',
        cin: 'U72200MH2021PTC123456',
        gstin: '27AAPFU0939F1ZV',
        pan: 'AABCB1234F',
        businessEmail: 'contact@acmeglobal.com',
        phone: '+91 98765 01199',
        domain: 'acmeglobal.com',
        website: 'https://acmeglobal.com',
        industry: 'Information Technology & Services',
        companySize: '51-200',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        country: 'India',
        address: 'Bandra Kurla Complex, Bandra East, Mumbai, Maharashtra',
        adminName: 'Alice Vance',
        adminEmail: 'admin@acmeglobal.com',
        adminPassword: 'Admin@2026',
      }
    );
    assert(
      orgRegisterRes.status === 201 &&
        orgRegisterRes.data.success &&
        orgRegisterRes.data.organization.status === 'pending',
      'Organization Registration: Indian business dossier registered with CIN & GSTIN in status: "pending"'
    );
    const acmeOrgId = orgRegisterRes.data.organization._id;

    // 4. Zero-Access Quarantine Enforcement: Org Admin Login Rejected Before Approval
    const unapprovedAdminLogin = await request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'admin@acmeglobal.com', password: 'Admin@2026', portal: 'admin' }
    );
    assert(
      unapprovedAdminLogin.status === 403 && unapprovedAdminLogin.data.code === 'ORG_PENDING',
      'Zero-Access Quarantine Enforced: Unapproved organization admin rejected with 403 ORG_PENDING'
    );

    // 5. Master Platform Console: Query Organizations & Metrics
    const masterMetrics = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/organizations/master/metrics',
      method: 'GET',
      headers: { Authorization: `Bearer ${masterToken}` },
    });
    assert(
      masterMetrics.status === 200 && masterMetrics.data.metrics.pendingOrganizations >= 1,
      'Master Console Metrics: Global dashboard tracks pending organization verifications'
    );

    const masterOrgList = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/organizations?status=pending',
      method: 'GET',
      headers: { Authorization: `Bearer ${masterToken}` },
    });
    const foundAcme = masterOrgList.data.organizations.find((o) => o._id === acmeOrgId);
    assert(
      masterOrgList.status === 200 && foundAcme && (foundAcme.cin === 'U72200MH2021PTC123456' || foundAcme.registrationNumber === 'U72200MH2021PTC123456'),
      'Master Console Dossier: Maker can inspect official registration credentials (CIN, GSTIN, State)'
    );

    // 6. Master Approves Organization
    const approveOrgRes = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: `/api/organizations/${acmeOrgId}/approve`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${masterToken}`,
      },
    });
    assert(
      approveOrgRes.status === 200 && approveOrgRes.data.organization.status === 'active',
      'Master Approval: Organization activated and clean department slate seeded'
    );

    // 7. Organization Super Admin Login Allowed Post-Approval
    const approvedAdminLogin = await request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'admin@acmeglobal.com', password: 'Admin@2026', portal: 'admin' }
    );
    assert(
      approvedAdminLogin.status === 200 &&
        approvedAdminLogin.data.user.role === 'admin' &&
        approvedAdminLogin.data.user.organization.name === 'Acme Global Technologies Private Limited',
      'Organization Admin Access: Admin authorized post-approval with tenant scoping'
    );
    const acmeAdminToken = approvedAdminLogin.data.token;

    // 8. Verify Auto-Seeded Clean Departments
    const deptsRes = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/departments',
      method: 'GET',
      headers: { Authorization: `Bearer ${acmeAdminToken}` },
    });
    assert(
      deptsRes.status === 200 && deptsRes.data.departments.length === 4,
      'Tenant Scoping: Newly approved organization has clean default departments (count: 4)'
    );
    const engDept = deptsRes.data.departments.find((d) => d.name === 'Engineering');
    const hrDept = deptsRes.data.departments.find((d) => d.name === 'Human Resources');

    // 9. Admin Creates HR Manager and Employee
    const hrCreateRes = await request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/employees',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${acmeAdminToken}`,
        },
      },
      {
        name: 'Sarah HR',
        email: 'hr@acmeglobal.com',
        password: 'Password@123',
        role: 'hr',
        designation: 'Head of Human Resources',
        department: hrDept._id,
        salary: 75000,
      }
    );
    assert(
      hrCreateRes.status === 201 && hrCreateRes.data.employee.role === 'hr',
      'Workforce Management: Admin created HR Manager'
    );

    const empCreateRes = await request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/employees',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${acmeAdminToken}`,
        },
      },
      {
        name: 'Bob Developer',
        email: 'bob@acmeglobal.com',
        password: 'Password@123',
        role: 'employee',
        designation: 'Full Stack Engineer',
        department: engDept._id,
        salary: 950000,
        pan: 'ABCDE1234F',
        aadhaar: '987654321098',
        uan: '101234567890',
        bankAccount: '50100234891234',
        ifsc: 'HDFC0001234',
      }
    );
    assert(
      empCreateRes.status === 201 && empCreateRes.data.employee.role === 'employee' && empCreateRes.data.employee.pan === 'ABCDE1234F',
      'Workforce Management: Admin created Employee with Indian statutory details (PAN, EPFO UAN, IFSC)'
    );
    const empId = empCreateRes.data.employee._id;

    // 10. HR Manager Login
    const hrLogin = await request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'hr@acmeglobal.com', password: 'Password@123', portal: 'hr' }
    );
    assert(hrLogin.status === 200 && hrLogin.data.user.role === 'hr', 'HR Manager Login successful');
    const acmeHrToken = hrLogin.data.token;

    // 11. Employee Login
    const empLogin = await request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'bob@acmeglobal.com', password: 'Password@123', portal: 'employee' }
    );
    assert(empLogin.status === 200 && empLogin.data.user.role === 'employee', 'Employee Login successful');
    const acmeEmpToken = empLogin.data.token;

    // 12. Dedicated Portal Clearance Isolation (Least Privilege Protection)
    const empAsAdminCheck = await request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'bob@acmeglobal.com', password: 'Password@123', portal: 'admin' }
    );
    assert(
      empAsAdminCheck.status === 403,
      'Portal Clearance Protection: Regular employee blocked from Super Admin Gateway'
    );

    const empAsHrCheck = await request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'bob@acmeglobal.com', password: 'Password@123', portal: 'hr' }
    );
    assert(
      empAsHrCheck.status === 403,
      'Portal Clearance Protection: Regular employee blocked from HR Operations Portal'
    );

    // 13. Public Staff Self-Registration & Quarantine Approval Flow
    const publicStaffReg = await request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/auth/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        name: 'Pending Staff Applicant',
        email: 'staff.pending@acmeglobal.com',
        password: 'Password@123',
        portal: 'employee',
      }
    );
    assert(
      publicStaffReg.status === 201 && publicStaffReg.data.status === 'pending',
      'Zero-Access Architecture: Self-registered employee placed in quarantined "pending" status'
    );
    const pendingStaffId = publicStaffReg.data.user._id;

    const pendingLoginCheck = await request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'staff.pending@acmeglobal.com', password: 'Password@123' }
    );
    assert(
      pendingLoginCheck.status === 403 && pendingLoginCheck.data.code === 'ACCOUNT_PENDING',
      'Zero-Access Enforced: Pending employee blocked from login with ACCOUNT_PENDING'
    );

    const approveStaffRes = await request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: `/api/employees/${pendingStaffId}/approve`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${acmeAdminToken}`,
        },
      },
      { designation: 'Junior QA Engineer', department: engDept._id }
    );
    assert(
      approveStaffRes.status === 200 && approveStaffRes.data.employee.status === 'active',
      'Admin Clearance: Super Admin successfully activated pending employee'
    );

    // 14. Password Recovery Lifecycle
    const forgotRes = await request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/auth/forgot-password',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'staff.pending@acmeglobal.com' }
    );
    assert(
      forgotRes.status === 200 && forgotRes.data.resetCode !== undefined,
      'Password Recovery: Verification code generated for account'
    );

    const resetRes = await request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/auth/reset-password',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        email: 'staff.pending@acmeglobal.com',
        resetCode: forgotRes.data.resetCode,
        newPassword: 'UpdatedSecurePass@2026',
      }
    );
    assert(resetRes.status === 200 && resetRes.data.success, 'Password Recovery: Password updated with new hash');

    // 15. Employee Leave Application & Overlap Validation
    // A. Apply for leave (Monday 2026-12-14 to Wednesday 2026-12-16 = 3 working days)
    const leaveApplyRes = await request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/leaves',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${acmeEmpToken}`,
        },
      },
      {
        leaveType: 'Casual Leave',
        startDate: '2026-12-14',
        endDate: '2026-12-16',
        reason: 'Family event',
      }
    );
    assert(
      leaveApplyRes.status === 201 && leaveApplyRes.data.leave.totalDays === 3,
      'Leave Management: Leave applied with 3 working days computed'
    );
    const leaveId = leaveApplyRes.data.leave._id;

    // B. Overlap Prevention (2026-12-15 to 2026-12-17)
    const overlapRes = await request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/leaves',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${acmeEmpToken}`,
        },
      },
      {
        leaveType: 'Casual Leave',
        startDate: '2026-12-15',
        endDate: '2026-12-17',
        reason: 'Overlapping request',
      }
    );
    assert(overlapRes.status === 400, 'Overlap Prevention: Conflicting leave rejected with 400 Bad Request');

    // C. HR Approves Leave and verifies balance deduction
    const initialBal = empLogin.data.user.leaveBalances.casual;
    const approveLeaveRes = await request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: `/api/leaves/${leaveId}/approve`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${acmeHrToken}`,
        },
      },
      { remarks: 'Approved by HR Lead' }
    );
    assert(
      approveLeaveRes.status === 200 &&
        approveLeaveRes.data.leave.status === 'Approved' &&
        approveLeaveRes.data.leave.employee.leaveBalances.casual === initialBal - 3,
      `Leave Approved & Balance Deducted: ${initialBal} -> ${approveLeaveRes.data.leave.employee.leaveBalances.casual} days`
    );

    // 16. Employee Attendance Check-in & Check-out
    const checkinRes = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/attendance/checkin',
      method: 'POST',
      headers: { Authorization: `Bearer ${acmeEmpToken}` },
    });
    assert(
      checkinRes.status === 200 && checkinRes.data.attendance.status === 'Present',
      'Attendance Tracking: Daily check-in successful'
    );

    const dupCheckinRes = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/attendance/checkin',
      method: 'POST',
      headers: { Authorization: `Bearer ${acmeEmpToken}` },
    });
    assert(dupCheckinRes.status === 400, 'Attendance Protection: Duplicate check-in blocked');

    const checkoutRes = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/attendance/checkout',
      method: 'PUT',
      headers: { Authorization: `Bearer ${acmeEmpToken}` },
    });
    assert(
      checkoutRes.status === 200 && checkoutRes.data.attendance.checkOut !== undefined,
      'Attendance Tracking: Daily check-out recorded with hours worked'
    );

    // 17. Multi-Tenant Cross-Organization Isolation Verification
    // Register Organization 2: "Beta Logistics Corp"
    const betaReg = await request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/organizations/register',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      {
        companyName: 'Beta Logistics India Private Limited',
        legalEntityType: 'Private Limited (Pvt Ltd)',
        cin: 'U60200WA2022PTC654321',
        gstin: '29AABCB1234F1Z5',
        pan: 'AABCB5678K',
        businessEmail: 'ops@betacorp.com',
        phone: '+91 98765 02200',
        domain: 'betacorp.com',
        website: 'https://betacorp.com',
        industry: 'Transportation & Logistics',
        companySize: '11-50',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincode: '560001',
        country: 'India',
        address: '200 Outer Ring Road, Bellandur, Bengaluru',
        adminName: 'Bob Beta',
        adminEmail: 'admin@betacorp.com',
        adminPassword: 'BetaAdmin@2026',
      }
    );
    const betaOrgId = betaReg.data.organization._id;

    // Master Approves Beta Corp
    await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: `/api/organizations/${betaOrgId}/approve`,
      method: 'PATCH',
      headers: { Authorization: `Bearer ${masterToken}` },
    });

    // Beta Admin Login
    const betaLogin = await request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: '/api/auth/login',
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      },
      { email: 'admin@betacorp.com', password: 'BetaAdmin@2026', portal: 'admin' }
    );
    const betaAdminToken = betaLogin.data.token;

    // Verify Beta Admin CANNOT see Acme's employees
    const betaEmployeesRes = await request({
      hostname: '127.0.0.1',
      port: PORT,
      path: '/api/employees',
      method: 'GET',
      headers: { Authorization: `Bearer ${betaAdminToken}` },
    });
    const hasAcmeEmployees = betaEmployeesRes.data.employees?.some(
      (e) => e.email === 'bob@acmeglobal.com' || e.email === 'admin@acmeglobal.com'
    );
    assert(
      betaEmployeesRes.status === 200 && !hasAcmeEmployees,
      'Multi-Tenant Isolation: Beta Corp cannot see Acme Global employees'
    );

    // Verify Beta Admin CANNOT approve Acme's leaves
    const crossOrgApproveRes = await request(
      {
        hostname: '127.0.0.1',
        port: PORT,
        path: `/api/leaves/${leaveId}/approve`,
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${betaAdminToken}`,
        },
      },
      { remarks: 'Illegal cross-org approval attempt' }
    );
    assert(
      crossOrgApproveRes.status === 403,
      'Multi-Tenant Boundary Security: Cross-organization action strictly blocked with 403 Forbidden'
    );

    console.log(`\n======================================================`);
    console.log(`TEST SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
    console.log(`======================================================\n`);

    // Cleanup test artifacts
    await cleanupTestData();

    await mongoose.disconnect();
    process.exit(failCount === 0 ? 0 : 1);
  } catch (err) {
    console.error('Test Execution Error:', err);
    try { await mongoose.disconnect(); } catch (_) {}
    process.exit(1);
  }
}

runTests();
