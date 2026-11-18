const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Leave = require('../models/Leave');
const {
  normalizeDate,
  calculateHoursWorked,
  determineAttendanceStatus,
} = require('../utils/dateUtils');

// @desc    Employee daily check in
// @route   POST /api/attendance/checkin
// @access  Private (Employee, HR, Admin)
exports.checkIn = async (req, res, next) => {
  try {
    const employeeId = req.user._id;
    const now = new Date();
    const today = normalizeDate(now);

    // Check if already checked in today
    let record = await Attendance.findOne({
      employee: employeeId,
      date: today,
    });

    if (record && record.checkIn) {
      return res.status(400).json({
        success: false,
        message: `Already checked in today at ${new Date(record.checkIn).toLocaleTimeString()}`,
        attendance: record,
      });
    }

    // Check if employee has approved leave today
    const onLeave = await Leave.findOne({
      employee: employeeId,
      status: 'Approved',
      startDate: { $lte: today },
      endDate: { $gte: today },
    });

    if (record) {
      record.checkIn = now;
      record.status = onLeave ? 'On Leave' : 'Present';
      await record.save();
    } else {
      record = await Attendance.create({
        organization: req.user.organization || null,
        employee: employeeId,
        date: today,
        checkIn: now,
        status: onLeave ? 'On Leave' : 'Present',
        remarks: onLeave ? 'Checked in while on approved leave' : '',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Check-in successful!',
      attendance: record,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Employee daily check out
// @route   PUT /api/attendance/checkout
// @access  Private (Employee, HR, Admin)
exports.checkOut = async (req, res, next) => {
  try {
    const employeeId = req.user._id;
    const now = new Date();
    const today = normalizeDate(now);

    const record = await Attendance.findOne({
      employee: employeeId,
      date: today,
    });

    // Prevent checkout without checkin
    if (!record || !record.checkIn) {
      return res.status(400).json({
        success: false,
        message: 'Cannot check out without checking in first today',
      });
    }

    // Prevent duplicate checkout
    if (record.checkOut) {
      return res.status(400).json({
        success: false,
        message: `Already checked out today at ${new Date(record.checkOut).toLocaleTimeString()}`,
        attendance: record,
      });
    }

    record.checkOut = now;
    const hours = calculateHoursWorked(record.checkIn, now);
    record.hoursWorked = hours;

    // Check if approved leave exists
    const onLeave = await Leave.findOne({
      employee: employeeId,
      status: 'Approved',
      startDate: { $lte: today },
      endDate: { $gte: today },
    });

    record.status = determineAttendanceStatus(hours, !!onLeave);
    await record.save();

    res.status(200).json({
      success: true,
      message: `Check-out successful! Total time: ${hours} hour(s). Status: ${record.status}`,
      attendance: record,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's today attendance status
// @route   GET /api/attendance/today
// @access  Private
exports.getTodayAttendance = async (req, res, next) => {
  try {
    const today = normalizeDate(new Date());
    const record = await Attendance.findOne({
      employee: req.user._id,
      date: today,
    });

    // Check if on leave today
    const onLeave = await Leave.findOne({
      employee: req.user._id,
      status: 'Approved',
      startDate: { $lte: today },
      endDate: { $gte: today },
    });

    res.status(200).json({
      success: true,
      attendance: record || null,
      onLeave: !!onLeave,
      leaveDetails: onLeave || null,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's attendance history
// @route   GET /api/attendance/my
// @access  Private
exports.getMyAttendance = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const query = { employee: req.user._id };

    if (month && year) {
      const m = parseInt(month, 10) - 1; // 0-indexed
      const y = parseInt(year, 10);
      const startOfMonth = new Date(Date.UTC(y, m, 1, 0, 0, 0, 0));
      const endOfMonth = new Date(Date.UTC(y, m + 1, 0, 23, 59, 59, 999));
      query.date = { $gte: startOfMonth, $lte: endOfMonth };
    }

    const attendanceRecords = await Attendance.find(query).sort({ date: -1 });

    // Summary calculations
    let presentCount = 0;
    let halfDayCount = 0;
    let absentCount = 0;
    let onLeaveCount = 0;
    let totalHours = 0;

    attendanceRecords.forEach((rec) => {
      if (rec.status === 'Present') presentCount++;
      else if (rec.status === 'Half Day') halfDayCount++;
      else if (rec.status === 'Absent') absentCount++;
      else if (rec.status === 'On Leave') onLeaveCount++;

      totalHours += rec.hoursWorked || 0;
    });

    res.status(200).json({
      success: true,
      count: attendanceRecords.length,
      summary: {
        present: presentCount,
        halfDay: halfDayCount,
        absent: absentCount,
        onLeave: onLeaveCount,
        totalHours: Math.round(totalHours * 100) / 100,
      },
      records: attendanceRecords,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all attendance records (Admin & HR)
// @route   GET /api/attendance
// @access  Private (Admin & HR)
exports.getAllAttendance = async (req, res, next) => {
  try {
    const {
      employee,
      department,
      date,
      startDate,
      endDate,
      status,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (req.user.role !== 'master' && req.user.organization) {
      query.organization = req.user.organization;
    }

    if (employee) {
      query.employee = employee;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (date) {
      const d = normalizeDate(new Date(date));
      query.date = d;
    } else if (startDate && endDate) {
      query.date = {
        $gte: normalizeDate(new Date(startDate)),
        $lte: normalizeDate(new Date(endDate)),
      };
    }

    // Filter by department
    if (department && department !== 'all') {
      const deptFilter = { department };
      if (req.user.role !== 'master' && req.user.organization) {
        deptFilter.organization = req.user.organization;
      }
      const deptEmployees = await User.find(deptFilter).select('_id');
      const deptEmpIds = deptEmployees.map((e) => e._id);
      query.employee = { $in: deptEmpIds };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Attendance.countDocuments(query);
    const records = await Attendance.find(query)
      .populate('employee', 'name email designation department')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: records.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      records,
    });
  } catch (error) {
    next(error);
  }
};
