const User = require('../models/User');
const Organization = require('../models/Organization');
const Department = require('../models/Department');
const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');
const { normalizeDate } = require('../utils/dateUtils');

// @desc    Get dashboard metrics tailored by user role
// @route   GET /api/reports/dashboard
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    const userRole = req.user.role;
    const userId = req.user._id;
    const today = normalizeDate(new Date());
    const orgFilter = (userRole === 'master' || !req.user.organization) ? {} : { organization: req.user.organization };

    if (userRole === 'master') {
      // Platform Maker / Master Governance Metrics
      const totalOrganizations = await Organization.countDocuments();
      const pendingOrganizations = await Organization.countDocuments({ status: 'pending' });
      const activeOrganizations = await Organization.countDocuments({ status: 'active' });
      const totalPlatformUsers = await User.countDocuments({ role: { $ne: 'master' } });

      return res.status(200).json({
        success: true,
        role: 'master',
        metrics: {
          totalOrganizations,
          pendingOrganizations,
          activeOrganizations,
          totalPlatformUsers,
        },
      });
    }

    if (userRole === 'admin') {
      // Super Admin Dashboard Metrics
      const totalEmployees = await User.countDocuments(orgFilter);
      const activeEmployees = await User.countDocuments({ ...orgFilter, status: 'active' });
      const pendingEmployees = await User.countDocuments({ ...orgFilter, status: 'pending' });
      const totalDepartments = await Department.countDocuments(orgFilter);
      const pendingLeaves = await Leave.countDocuments({ ...orgFilter, status: 'Pending' });

      // Today's attendance
      const presentToday = await Attendance.countDocuments({
        ...orgFilter,
        date: today,
        status: { $in: ['Present', 'Half Day'] },
      });

      const onLeaveToday = await Leave.countDocuments({
        ...orgFilter,
        status: 'Approved',
        startDate: { $lte: today },
        endDate: { $gte: today },
      });

      // Chart 1: Department-wise employee distribution
      const departments = await Department.find(orgFilter);
      const deptDistribution = await Promise.all(
        departments.map(async (dept) => {
          const count = await User.countDocuments({
            ...orgFilter,
            department: dept._id,
            status: 'active',
          });
          return {
            name: dept.name,
            count,
          };
        })
      );

      // Also count unassigned if any
      const unassignedCount = await User.countDocuments({
        ...orgFilter,
        department: null,
        status: 'active',
      });
      if (unassignedCount > 0) {
        deptDistribution.push({ name: 'Unassigned', count: unassignedCount });
      }

      // Chart 2: Monthly attendance trends (last 6 months)
      const now = new Date();
      const monthlyTrends = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const start = new Date(Date.UTC(d.getFullYear(), d.getMonth(), 1));
        const end = new Date(Date.UTC(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999));
        const monthLabel = d.toLocaleString('en-US', { month: 'short' });

        const present = await Attendance.countDocuments({
          ...orgFilter,
          date: { $gte: start, $lte: end },
          status: { $in: ['Present', 'Half Day'] },
        });

        const leaves = await Attendance.countDocuments({
          ...orgFilter,
          date: { $gte: start, $lte: end },
          status: 'On Leave',
        });

        monthlyTrends.push({
          month: monthLabel,
          present,
          leaves,
        });
      }

      // Chart 3: Leave type distribution
      const leaveTypeCounts = await Leave.aggregate([
        { $match: { ...orgFilter, status: 'Approved' } },
        { $group: { _id: '$leaveType', count: { $sum: 1 } } },
      ]);

      const leaveDistribution = {
        'Casual Leave': 0,
        'Sick Leave': 0,
        'Earned Leave': 0,
        'Maternity Leave': 0,
        'Paternity Leave': 0,
      };

      leaveTypeCounts.forEach((item) => {
        if (leaveDistribution[item._id] !== undefined) {
          leaveDistribution[item._id] = item.count;
        }
      });

      // Recent 5 leave requests
      const recentLeaves = await Leave.find(orgFilter)
        .populate('employee', 'name email department profileImage')
        .sort({ createdAt: -1 })
        .limit(5);

      // Recent pending employee registrations (Action required)
      const recentPendingEmployees = await User.find({ ...orgFilter, status: 'pending' })
        .populate('department', 'name')
        .sort({ createdAt: -1 })
        .limit(6);

      return res.status(200).json({
        success: true,
        role: 'admin',
        metrics: {
          totalEmployees,
          activeEmployees,
          pendingEmployees,
          totalDepartments,
          pendingLeaves,
          presentToday,
          onLeaveToday,
        },
        charts: {
          departmentDistribution: deptDistribution,
          monthlyTrends,
          leaveDistribution,
        },
        recentLeaves,
        recentPendingEmployees,
      });
    }

    if (userRole === 'hr') {
      // HR Manager Dashboard Metrics
      const totalEmployees = await User.countDocuments(orgFilter);
      const activeEmployees = await User.countDocuments({ ...orgFilter, status: 'active' });
      const pendingEmployees = await User.countDocuments({ ...orgFilter, status: 'pending' });
      const pendingLeaves = await Leave.countDocuments({ ...orgFilter, status: 'Pending' });

      // Today's attendance
      const presentToday = await Attendance.countDocuments({
        ...orgFilter,
        date: today,
        status: { $in: ['Present', 'Half Day'] },
      });

      const onLeaveToday = await Leave.countDocuments({
        ...orgFilter,
        status: 'Approved',
        startDate: { $lte: today },
        endDate: { $gte: today },
      });

      const absentToday = Math.max(0, activeEmployees - presentToday - onLeaveToday);

      // Department statistics
      const departments = await Department.find(orgFilter);
      const departmentStats = await Promise.all(
        departments.map(async (dept) => {
          const count = await User.countDocuments({ ...orgFilter, department: dept._id });
          return {
            id: dept._id,
            name: dept.name,
            totalEmployees: count,
          };
        })
      );

      // Recent pending leaves
      const recentLeaves = await Leave.find(orgFilter)
        .populate('employee', 'name email designation department profileImage')
        .sort({ createdAt: -1 })
        .limit(6);

      // Recent pending employee registrations
      const recentPendingEmployees = await User.find({ ...orgFilter, status: 'pending' })
        .populate('department', 'name')
        .sort({ createdAt: -1 })
        .limit(6);

      return res.status(200).json({
        success: true,
        role: 'hr',
        metrics: {
          totalEmployees,
          activeEmployees,
          pendingEmployees,
          pendingLeaves,
          presentToday,
          absentToday,
          onLeaveToday,
        },
        departmentStats,
        recentLeaves,
        recentPendingEmployees,
      });
    }

    if (userRole === 'employee') {
      // Employee Personal Dashboard
      const employee = await User.findById(userId).populate('department', 'name');

      // Today attendance
      const todayAttendance = await Attendance.findOne({
        employee: userId,
        date: today,
      });

      // Check if on leave today
      const todayLeave = await Leave.findOne({
        employee: userId,
        status: 'Approved',
        startDate: { $lte: today },
        endDate: { $gte: today },
      });

      // Pending leaves
      const pendingLeaves = await Leave.countDocuments({
        employee: userId,
        status: 'Pending',
      });

      // Recent leaves
      const recentLeaves = await Leave.find({ employee: userId })
        .sort({ createdAt: -1 })
        .limit(5);

      // Monthly attendance summary (current month)
      const now = new Date();
      const startOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
      const endOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999));

      const monthlyRecords = await Attendance.find({
        employee: userId,
        date: { $gte: startOfMonth, $lte: endOfMonth },
      });

      let presentCount = 0;
      let halfDayCount = 0;
      let absentCount = 0;
      let onLeaveCount = 0;
      let totalHours = 0;

      monthlyRecords.forEach((rec) => {
        if (rec.status === 'Present') presentCount++;
        else if (rec.status === 'Half Day') halfDayCount++;
        else if (rec.status === 'Absent') absentCount++;
        else if (rec.status === 'On Leave') onLeaveCount++;
        totalHours += rec.hoursWorked || 0;
      });

      return res.status(200).json({
        success: true,
        role: 'employee',
        employee: {
          name: employee.name,
          email: employee.email,
          designation: employee.designation,
          department: employee.department?.name || 'General',
          leaveBalances: employee.leaveBalances,
        },
        todayAttendance: {
          record: todayAttendance,
          onLeave: !!todayLeave,
          leaveDetails: todayLeave,
        },
        pendingLeaves,
        recentLeaves,
        monthlySummary: {
          present: presentCount,
          halfDay: halfDayCount,
          absent: absentCount,
          onLeave: onLeaveCount,
          totalHours: Math.round(totalHours * 100) / 100,
          currentMonthName: now.toLocaleString('en-US', { month: 'long' }),
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get attendance report with filters
// @route   GET /api/reports/attendance
// @access  Private (Admin & HR)
exports.getAttendanceReport = async (req, res, next) => {
  try {
    const { startDate, endDate, department, employee } = req.query;
    const orgFilter = (req.user.role === 'master' || !req.user.organization) ? {} : { organization: req.user.organization };
    const query = { ...orgFilter };

    if (startDate && endDate) {
      query.date = {
        $gte: normalizeDate(new Date(startDate)),
        $lte: normalizeDate(new Date(endDate)),
      };
    }

    if (employee && employee !== 'all') {
      query.employee = employee;
    }

    if (department && department !== 'all') {
      const deptEmployees = await User.find({ ...orgFilter, department }).select('_id');
      const deptEmpIds = deptEmployees.map((e) => e._id);
      query.employee = { $in: deptEmpIds };
    }

    const records = await Attendance.find(query)
      .populate({
        path: 'employee',
        select: 'name email designation department',
        populate: { path: 'department', select: 'name' },
      })
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      records,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get leave report with filters
// @route   GET /api/reports/leaves
// @access  Private (Admin & HR)
exports.getLeaveReport = async (req, res, next) => {
  try {
    const { startDate, endDate, department, status, leaveType } = req.query;
    const orgFilter = (req.user.role === 'master' || !req.user.organization) ? {} : { organization: req.user.organization };
    const query = { ...orgFilter };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (leaveType && leaveType !== 'all') {
      query.leaveType = leaveType;
    }

    if (startDate && endDate) {
      query.startDate = { $gte: new Date(startDate) };
      query.endDate = { $lte: new Date(endDate) };
    }

    if (department && department !== 'all') {
      const deptEmployees = await User.find({ ...orgFilter, department }).select('_id');
      const deptEmpIds = deptEmployees.map((e) => e._id);
      query.employee = { $in: deptEmpIds };
    }

    const leaves = await Leave.find(query)
      .populate({
        path: 'employee',
        select: 'name email designation department',
        populate: { path: 'department', select: 'name' },
      })
      .populate('approvedBy', 'name designation')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leaves.length,
      leaves,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get employee directory report
// @route   GET /api/reports/employees
// @access  Private (Admin & HR)
exports.getEmployeeReport = async (req, res, next) => {
  try {
    const { department, status, role } = req.query;
    const orgFilter = (req.user.role === 'master' || !req.user.organization) ? {} : { organization: req.user.organization };
    const query = { ...orgFilter };

    if (department && department !== 'all') {
      query.department = department;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (role && role !== 'all') {
      query.role = role;
    }

    const employees = await User.find(query)
      .populate('department', 'name')
      .sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: employees.length,
      employees,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get department headcount report
// @route   GET /api/reports/departments
// @access  Private (Admin & HR)
exports.getDepartmentReport = async (req, res, next) => {
  try {
    const orgFilter = (req.user.role === 'master' || !req.user.organization) ? {} : { organization: req.user.organization };
    const departments = await Department.find(orgFilter)
      .populate('head', 'name email designation')
      .sort({ name: 1 });

    const report = await Promise.all(
      departments.map(async (dept) => {
        const total = await User.countDocuments({ ...orgFilter, department: dept._id });
        const active = await User.countDocuments({
          ...orgFilter,
          department: dept._id,
          status: 'active',
        });
        const inactive = total - active;

        // Total salary expense in dept
        const salaryAgg = await User.aggregate([
          { $match: { ...orgFilter, department: dept._id } },
          { $group: { _id: null, totalSalary: { $sum: '$salary' } } },
        ]);
        const totalSalary = salaryAgg[0]?.totalSalary || 0;

        return {
          _id: dept._id,
          name: dept.name,
          head: dept.head ? dept.head.name : 'Unassigned',
          description: dept.description,
          totalEmployees: total,
          activeEmployees: active,
          inactiveEmployees: inactive,
          totalSalary,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: report.length,
      departments: report,
    });
  } catch (error) {
    next(error);
  }
};
