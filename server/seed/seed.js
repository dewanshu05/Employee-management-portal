require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Department = require('../models/Department');
const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');
const { normalizeDate } = require('../utils/dateUtils');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/emp-portal';

async function seedDatabase() {
  try {
    console.log('Connecting to MongoDB at:', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('Connected to database. Clearing existing data...');

    await Promise.all([
      User.deleteMany({}),
      Department.deleteMany({}),
      Leave.deleteMany({}),
      Attendance.deleteMany({}),
    ]);
    console.log('Old collections purged.');

    // 1. Create Departments
    console.log('Creating Departments...');
    const deptDocs = await Department.create([
      {
        name: 'Engineering',
        description: 'Software development, cloud architecture, and technical infrastructure',
      },
      {
        name: 'Human Resources',
        description: 'People operations, talent acquisition, culture, and employee welfare',
      },
      {
        name: 'Finance & Accounts',
        description: 'Financial planning, accounting, payroll management, and compliance',
      },
      {
        name: 'Marketing & Growth',
        description: 'Brand strategy, digital marketing, demand generation, and communications',
      },
      {
        name: 'Product & Design',
        description: 'Product strategy, UI/UX research, design systems, and roadmapping',
      },
      {
        name: 'Operations & Support',
        description: 'Business operations, client support, IT helpdesk, and facility management',
      },
    ]);

    const deptMap = {};
    deptDocs.forEach((d) => {
      deptMap[d.name] = d._id;
    });

    // 2. Create Users
    console.log('Creating Super Admin, HR Managers, and Employees...');

    // Super Admin
    const adminUser = await User.create({
      name: 'Alexander Wright',
      email: 'admin@company.com',
      password: 'Admin@123',
      role: 'admin',
      department: deptMap['Engineering'],
      designation: 'Chief Technology Officer / Administrator',
      phone: '+1 (555) 019-2831',
      joiningDate: new Date('2021-01-15'),
      salary: 165000,
      status: 'active',
      profileImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      leaveBalances: {
        casual: 12,
        sick: 10,
        earned: 15,
        maternity: 180,
        paternity: 15,
      },
    });

    // HR Managers
    const hrSarah = await User.create({
      name: 'Sarah Jenkins',
      email: 'sarah.hr@company.com',
      password: 'Hr@123',
      role: 'hr',
      department: deptMap['Human Resources'],
      designation: 'Head of People Operations',
      phone: '+1 (555) 014-9921',
      joiningDate: new Date('2021-06-01'),
      salary: 95000,
      status: 'active',
      profileImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
      leaveBalances: { casual: 10, sick: 9, earned: 14, maternity: 180, paternity: 15 },
    });

    const hrDavid = await User.create({
      name: 'David Miller',
      email: 'david.hr@company.com',
      password: 'Hr@123',
      role: 'hr',
      department: deptMap['Human Resources'],
      designation: 'Senior HR & Talent Partner',
      phone: '+1 (555) 017-3382',
      joiningDate: new Date('2022-03-10'),
      salary: 82000,
      status: 'active',
      profileImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      leaveBalances: { casual: 11, sick: 10, earned: 15, maternity: 180, paternity: 15 },
    });

    // Employees
    const employeeData = [
      {
        name: 'Michael Chen',
        email: 'michael.chen@company.com',
        password: 'Emp@123',
        role: 'employee',
        department: deptMap['Engineering'],
        designation: 'Staff Frontend Engineer',
        phone: '+1 (555) 012-4411',
        joiningDate: new Date('2022-01-10'),
        salary: 115000,
        status: 'active',
        profileImage: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        leaveBalances: { casual: 8, sick: 9, earned: 12, maternity: 180, paternity: 15 },
      },
      {
        name: 'Emily Davis',
        email: 'emily.davis@company.com',
        password: 'Emp@123',
        role: 'employee',
        department: deptMap['Engineering'],
        designation: 'Lead Systems Architect',
        phone: '+1 (555) 018-7722',
        joiningDate: new Date('2021-04-18'),
        salary: 130000,
        status: 'active',
        profileImage: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150',
        leaveBalances: { casual: 9, sick: 10, earned: 13, maternity: 180, paternity: 15 },
      },
      {
        name: 'James Wilson',
        email: 'james.wilson@company.com',
        password: 'Emp@123',
        role: 'employee',
        department: deptMap['Engineering'],
        designation: 'Senior DevOps & SRE',
        phone: '+1 (555) 019-3311',
        joiningDate: new Date('2022-08-01'),
        salary: 105000,
        status: 'active',
        profileImage: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
        leaveBalances: { casual: 10, sick: 8, earned: 15, maternity: 180, paternity: 15 },
      },
      {
        name: 'Olivia Taylor',
        email: 'olivia.taylor@company.com',
        password: 'Emp@123',
        role: 'employee',
        department: deptMap['Product & Design'],
        designation: 'Principal UX Designer',
        phone: '+1 (555) 016-5544',
        joiningDate: new Date('2022-02-15'),
        salary: 110000,
        status: 'active',
        profileImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
        leaveBalances: { casual: 11, sick: 10, earned: 14, maternity: 180, paternity: 15 },
      },
      {
        name: 'Daniel Brown',
        email: 'daniel.brown@company.com',
        password: 'Emp@123',
        role: 'employee',
        department: deptMap['Product & Design'],
        designation: 'Director of Product',
        phone: '+1 (555) 013-8899',
        joiningDate: new Date('2021-09-01'),
        salary: 125000,
        status: 'active',
        profileImage: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
        leaveBalances: { casual: 7, sick: 8, earned: 10, maternity: 180, paternity: 15 },
      },
      {
        name: 'Sophia Martinez',
        email: 'sophia.martinez@company.com',
        password: 'Emp@123',
        role: 'employee',
        department: deptMap['Finance & Accounts'],
        designation: 'Senior Financial Analyst',
        phone: '+1 (555) 011-2266',
        joiningDate: new Date('2022-05-12'),
        salary: 92000,
        status: 'active',
        profileImage: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150',
        leaveBalances: { casual: 12, sick: 10, earned: 15, maternity: 180, paternity: 15 },
      },
      {
        name: 'Lucas Anderson',
        email: 'lucas.anderson@company.com',
        password: 'Emp@123',
        role: 'employee',
        department: deptMap['Marketing & Growth'],
        designation: 'Growth Marketing Lead',
        phone: '+1 (555) 015-4433',
        joiningDate: new Date('2022-11-01'),
        salary: 88000,
        status: 'active',
        profileImage: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
        leaveBalances: { casual: 10, sick: 9, earned: 15, maternity: 180, paternity: 15 },
      },
      {
        name: 'Ava Thomas',
        email: 'ava.thomas@company.com',
        password: 'Emp@123',
        role: 'employee',
        department: deptMap['Marketing & Growth'],
        designation: 'Content Marketing Manager',
        phone: '+1 (555) 018-9900',
        joiningDate: new Date('2023-01-16'),
        salary: 75000,
        status: 'active',
        profileImage: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150',
        leaveBalances: { casual: 11, sick: 10, earned: 13, maternity: 180, paternity: 15 },
      },
      {
        name: 'William Garcia',
        email: 'william.garcia@company.com',
        password: 'Emp@123',
        role: 'employee',
        department: deptMap['Operations & Support'],
        designation: 'Operations Director',
        phone: '+1 (555) 017-7711',
        joiningDate: new Date('2021-08-20'),
        salary: 98000,
        status: 'active',
        profileImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
        leaveBalances: { casual: 12, sick: 10, earned: 15, maternity: 180, paternity: 15 },
      },
      {
        name: 'Isabella Robinson',
        email: 'isabella.robinson@company.com',
        password: 'Emp@123',
        role: 'employee',
        department: deptMap['Operations & Support'],
        designation: 'Customer Success Manager',
        phone: '+1 (555) 012-6655',
        joiningDate: new Date('2023-03-01'),
        salary: 70000,
        status: 'active',
        profileImage: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
        leaveBalances: { casual: 10, sick: 10, earned: 14, maternity: 180, paternity: 15 },
      },
      {
        name: 'Ethan Clark',
        email: 'ethan.clark@company.com',
        password: 'Emp@123',
        role: 'employee',
        department: deptMap['Engineering'],
        designation: 'Junior Full Stack Developer',
        phone: '+1 (555) 019-8877',
        joiningDate: new Date('2023-06-15'),
        salary: 68000,
        status: 'active',
        profileImage: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150',
        leaveBalances: { casual: 12, sick: 10, earned: 15, maternity: 180, paternity: 15 },
      },
      {
        name: 'Mia Lewis',
        email: 'mia.lewis@company.com',
        password: 'Emp@123',
        role: 'employee',
        department: deptMap['Human Resources'],
        designation: 'HR Coordinator & Recruiter',
        phone: '+1 (555) 013-1122',
        joiningDate: new Date('2023-04-10'),
        salary: 62000,
        status: 'active',
        profileImage: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150',
        leaveBalances: { casual: 11, sick: 10, earned: 15, maternity: 180, paternity: 15 },
      },
      {
        name: 'Robert Vance',
        email: 'robert.vance@company.com',
        password: 'Emp@123',
        role: 'employee',
        department: deptMap['Finance & Accounts'],
        designation: 'Junior Accountant',
        phone: '+1 (555) 014-4455',
        joiningDate: new Date('2022-10-01'),
        salary: 58000,
        status: 'inactive', // Sample inactive employee
        profileImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
        leaveBalances: { casual: 12, sick: 10, earned: 15, maternity: 180, paternity: 15 },
      },
    ];

    const createdEmployees = await User.create(employeeData);
    const allUsers = [adminUser, hrSarah, hrDavid, ...createdEmployees];

    // 3. Assign Department Heads
    console.log('Assigning Department Heads...');
    await Department.findByIdAndUpdate(deptMap['Engineering'], { head: createdEmployees[1]._id }); // Emily
    await Department.findByIdAndUpdate(deptMap['Human Resources'], { head: hrSarah._id });
    await Department.findByIdAndUpdate(deptMap['Finance & Accounts'], { head: createdEmployees[5]._id }); // Sophia
    await Department.findByIdAndUpdate(deptMap['Marketing & Growth'], { head: createdEmployees[6]._id }); // Lucas
    await Department.findByIdAndUpdate(deptMap['Product & Design'], { head: createdEmployees[4]._id }); // Daniel
    await Department.findByIdAndUpdate(deptMap['Operations & Support'], { head: createdEmployees[8]._id }); // William

    // 4. Create Sample Leaves
    console.log('Creating Sample Leave Applications...');
    await Leave.create([
      {
        employee: createdEmployees[0]._id, // Michael Chen
        leaveType: 'Casual Leave',
        startDate: new Date('2026-11-20'),
        endDate: new Date('2026-11-24'),
        totalDays: 3,
        reason: 'Family wedding ceremony and travel out of city.',
        status: 'Pending',
      },
      {
        employee: createdEmployees[2]._id, // James Wilson
        leaveType: 'Sick Leave',
        startDate: new Date('2026-11-18'),
        endDate: new Date('2026-11-19'),
        totalDays: 2,
        reason: 'Severe seasonal flu and medical consultation.',
        status: 'Pending',
      },
      {
        employee: createdEmployees[3]._id, // Olivia Taylor
        leaveType: 'Earned Leave',
        startDate: new Date('2026-12-01'),
        endDate: new Date('2026-12-08'),
        totalDays: 6,
        reason: 'Annual family vacation overseas.',
        status: 'Pending',
      },
      {
        employee: createdEmployees[0]._id, // Michael Chen
        leaveType: 'Casual Leave',
        startDate: new Date('2026-10-14'),
        endDate: new Date('2026-10-15'),
        totalDays: 2,
        reason: 'Personal urgent bank paperwork and relocation assistance.',
        status: 'Approved',
        approvedBy: hrSarah._id,
        remarks: 'Approved as requested. Keep the team notified on Slack.',
      },
      {
        employee: createdEmployees[4]._id, // Daniel Brown
        leaveType: 'Sick Leave',
        startDate: new Date('2026-10-22'),
        endDate: new Date('2026-10-23'),
        totalDays: 2,
        reason: 'Dental surgery and prescribed bed rest.',
        status: 'Approved',
        approvedBy: hrDavid._id,
        remarks: 'Approved. Take care and get well soon!',
      },
      {
        employee: createdEmployees[6]._id, // Lucas Anderson
        leaveType: 'Earned Leave',
        startDate: new Date('2026-10-05'),
        endDate: new Date('2026-10-07'),
        totalDays: 3,
        reason: 'Short vacation trip with college alumni.',
        status: 'Rejected',
        approvedBy: hrSarah._id,
        remarks: 'Q4 Product Launch week requires marketing all-hands presence. Please reschedule for late November.',
      },
      {
        employee: createdEmployees[1]._id, // Emily Davis
        leaveType: 'Casual Leave',
        startDate: new Date('2026-11-13'),
        endDate: new Date('2026-11-13'),
        totalDays: 1,
        reason: 'Child immunization appointment.',
        status: 'Approved',
        approvedBy: hrSarah._id,
        remarks: 'Approved. Enjoy the day!',
      },
    ]);

    // 5. Create Realistic Attendance for past 20 business days
    console.log('Generating Attendance Records...');
    const attendanceRecords = [];
    const now = new Date();

    // Iterate backwards 20 working days
    let dayOffset = 0;
    let daysRecorded = 0;

    while (daysRecorded < 20) {
      const d = new Date(now);
      d.setDate(d.getDate() - dayOffset);
      const dayOfWeek = d.getDay();
      dayOffset++;

      // Skip weekend
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        continue;
      }

      daysRecorded++;
      const dateNorm = normalizeDate(d);
      const isToday = daysRecorded === 1;

      // Populate for active users
      for (const user of allUsers.filter((u) => u.status === 'active')) {
        // Leave check for Emily Davis on Nov 13
        if (
          user._id.toString() === createdEmployees[1]._id.toString() &&
          d.getDate() === 13 &&
          d.getMonth() === 10
        ) {
          attendanceRecords.push({
            employee: user._id,
            date: dateNorm,
            checkIn: null,
            checkOut: null,
            hoursWorked: 0,
            status: 'On Leave',
            remarks: 'Approved Casual Leave',
          });
          continue;
        }

        // For today: check in most users, some checked out, some in progress
        if (isToday) {
          const checkInHour = 9;
          const checkInMinute = Math.floor(Math.random() * 25);
          const checkInDate = new Date(d);
          checkInDate.setHours(checkInHour, checkInMinute, 0, 0);

          // 70% of people have checked in today
          if (Math.random() > 0.25) {
            attendanceRecords.push({
              employee: user._id,
              date: dateNorm,
              checkIn: checkInDate,
              checkOut: null,
              hoursWorked: 0,
              status: 'Present',
              remarks: 'Checked in for the day',
            });
          }
          continue;
        }

        // For past days
        const rand = Math.random();
        if (rand < 0.88) {
          // Full day present
          const inH = 9;
          const inM = Math.floor(Math.random() * 30);
          const outH = 17 + Math.floor(Math.random() * 2);
          const outM = Math.floor(Math.random() * 45);

          const checkIn = new Date(d);
          checkIn.setHours(inH, inM, 0, 0);
          const checkOut = new Date(d);
          checkOut.setHours(outH, outM, 0, 0);

          const hours = Math.round(((checkOut - checkIn) / (1000 * 60 * 60)) * 100) / 100;

          attendanceRecords.push({
            employee: user._id,
            date: dateNorm,
            checkIn,
            checkOut,
            hoursWorked: hours,
            status: 'Present',
            remarks: '',
          });
        } else if (rand < 0.94) {
          // Half day
          const checkIn = new Date(d);
          checkIn.setHours(9, 30, 0, 0);
          const checkOut = new Date(d);
          checkOut.setHours(13, 45, 0, 0);
          const hours = 4.25;

          attendanceRecords.push({
            employee: user._id,
            date: dateNorm,
            checkIn,
            checkOut,
            hoursWorked: hours,
            status: 'Half Day',
            remarks: 'Half day afternoon permission',
          });
        } else {
          // Absent
          attendanceRecords.push({
            employee: user._id,
            date: dateNorm,
            checkIn: null,
            checkOut: null,
            hoursWorked: 0,
            status: 'Absent',
            remarks: 'Unplanned absence',
          });
        }
      }
    }

    await Attendance.insertMany(attendanceRecords);
    console.log(`Inserted ${attendanceRecords.length} attendance records.`);

    console.log('\n======================================================');
    console.log('✅ DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    console.log('======================================================');
    console.log('Credentials Summary:');
    console.log('👑 Super Admin:');
    console.log('   Email:    admin@company.com');
    console.log('   Password: Admin@123\n');
    console.log('💼 HR Managers:');
    console.log('   Email:    sarah.hr@company.com  |  david.hr@company.com');
    console.log('   Password: Hr@123\n');
    console.log('👨‍💻 Sample Employees:');
    console.log('   Email:    michael.chen@company.com');
    console.log('   Email:    emily.davis@company.com');
    console.log('   Email:    olivia.taylor@company.com');
    console.log('   Password: Emp@123 (for all sample employees)');
    console.log('======================================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
}

seedDatabase();
