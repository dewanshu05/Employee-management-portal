const Leave = require('../models/Leave');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const { calculateWorkingDays, normalizeDate } = require('../utils/dateUtils');

const LEAVE_TYPE_MAP = {
  'Casual Leave': 'casual',
  'Sick Leave': 'sick',
  'Earned Leave': 'earned',
  'Maternity Leave': 'maternity',
  'Paternity Leave': 'paternity',
};

// @desc    Apply for leave
// @route   POST /api/leaves
// @access  Private (Employee, HR, Admin)
exports.applyLeave = async (req, res, next) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    const employeeId = req.user._id;

    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide leave type, start date, end date, and reason',
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be earlier than start date',
      });
    }

    // Calculate working days excluding Saturdays and Sundays
    const totalDays = calculateWorkingDays(start, end);

    if (totalDays <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Selected date range contains 0 working days (weekends only)',
      });
    }

    // Check employee's current leave balance
    const employee = await User.findById(employeeId);
    const balanceKey = LEAVE_TYPE_MAP[leaveType];

    if (!balanceKey) {
      return res.status(400).json({
        success: false,
        message: 'Invalid leave type selected',
      });
    }

    const availableBalance = employee.leaveBalances?.[balanceKey] ?? 0;

    if (totalDays > availableBalance) {
      return res.status(400).json({
        success: false,
        message: `Insufficient leave balance. Requested: ${totalDays} day(s), Available: ${availableBalance} day(s) for ${leaveType}`,
      });
    }

    // Prevent overlapping leave applications
    // An overlap exists if an existing application (Pending or Approved) has:
    // (existing.startDate <= new.endDate) && (existing.endDate >= new.startDate)
    const overlapping = await Leave.findOne({
      employee: employeeId,
      status: { $in: ['Pending', 'Approved'] },
      startDate: { $lte: end },
      endDate: { $gte: start },
    });

    if (overlapping) {
      return res.status(400).json({
        success: false,
        message: `Overlapping leave request found from ${new Date(overlapping.startDate).toLocaleDateString()} to ${new Date(overlapping.endDate).toLocaleDateString()} with status "${overlapping.status}"`,
      });
    }

    const leave = await Leave.create({
      organization: req.user.organization || null,
      employee: employeeId,
      leaveType,
      startDate: start,
      endDate: end,
      totalDays,
      reason: reason.trim(),
      status: 'Pending',
    });

    const populated = await Leave.findById(leave._id).populate('employee', 'name email department');

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully',
      leave: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current employee's leaves
// @route   GET /api/leaves/my
// @access  Private
exports.getMyLeaves = async (req, res, next) => {
  try {
    const { status, year } = req.query;
    const query = { employee: req.user._id };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (year) {
      const startOfYear = new Date(`${year}-01-01T00:00:00.000Z`);
      const endOfYear = new Date(`${year}-12-31T23:59:59.999Z`);
      query.startDate = { $gte: startOfYear, $lte: endOfYear };
    }

    const leaves = await Leave.find(query)
      .populate('approvedBy', 'name designation')
      .sort({ createdAt: -1 });

    const user = await User.findById(req.user._id).select('leaveBalances');

    res.status(200).json({
      success: true,
      count: leaves.length,
      balances: user.leaveBalances,
      leaves,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all leave applications (Admin & HR)
// @route   GET /api/leaves
// @access  Private (Admin & HR)
exports.getAllLeaves = async (req, res, next) => {
  try {
    const {
      status,
      leaveType,
      department,
      employee,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = req.query;

    const query = {};

    if (req.user.role !== 'master' && req.user.organization) {
      query.organization = req.user.organization;
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    if (leaveType && leaveType !== 'all') {
      query.leaveType = leaveType;
    }

    if (employee) {
      query.employee = employee;
    }

    if (startDate && endDate) {
      query.startDate = { $gte: new Date(startDate) };
      query.endDate = { $lte: new Date(endDate) };
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // If filtering by department, first find employee IDs in that department
    if (department && department !== 'all') {
      const deptFilter = { department };
      if (req.user.role !== 'master' && req.user.organization) {
        deptFilter.organization = req.user.organization;
      }
      const deptEmployees = await User.find(deptFilter).select('_id');
      const deptEmpIds = deptEmployees.map((e) => e._id);
      query.employee = { $in: deptEmpIds };
    }

    const total = await Leave.countDocuments(query);
    const leaves = await Leave.find(query)
      .populate('employee', 'name email designation department profileImage')
      .populate('approvedBy', 'name designation')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: leaves.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      leaves,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve leave application
// @route   PUT /api/leaves/:id/approve
// @access  Private (Admin & HR)
exports.approveLeave = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const leave = await Leave.findById(id).populate('employee');

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave application not found',
      });
    }

    if (req.user.role !== 'master' && req.user.organization && leave.organization && leave.organization.toString() !== req.user.organization.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Leave belongs to another organization',
      });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Leave application is already ${leave.status.toLowerCase()}`,
      });
    }

    const employee = await User.findById(leave.employee._id);
    const balanceKey = LEAVE_TYPE_MAP[leave.leaveType];

    if (!balanceKey) {
      return res.status(400).json({
        success: false,
        message: 'Invalid leave type',
      });
    }

    const currentBalance = employee.leaveBalances?.[balanceKey] ?? 0;

    if (leave.totalDays > currentBalance) {
      return res.status(400).json({
        success: false,
        message: `Cannot approve: Requested ${leave.totalDays} day(s) exceeds employee's remaining ${leave.leaveType} balance (${currentBalance} days)`,
      });
    }

    // Deduct leave balance
    employee.leaveBalances[balanceKey] = Math.max(0, currentBalance - leave.totalDays);
    await employee.save();

    // Update leave application
    leave.status = 'Approved';
    leave.approvedBy = req.user._id;
    if (remarks) leave.remarks = remarks.trim();
    await leave.save();

    // Mark attendance records as 'On Leave' for working days in range
    const current = new Date(leave.startDate);
    const end = new Date(leave.endDate);

    while (current <= end) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const dateNorm = normalizeDate(current);
        await Attendance.findOneAndUpdate(
          { employee: leave.employee._id, date: dateNorm },
          {
            $set: {
              status: 'On Leave',
              remarks: `Approved leave: ${leave.leaveType}`,
            },
          },
          { upsert: true, new: true }
        );
      }
      current.setDate(current.getDate() + 1);
    }

    const updatedLeave = await Leave.findById(id)
      .populate('employee', 'name email department leaveBalances')
      .populate('approvedBy', 'name designation');

    res.status(200).json({
      success: true,
      message: 'Leave approved successfully and balance deducted',
      leave: updatedLeave,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject leave application
// @route   PUT /api/leaves/:id/reject
// @access  Private (Admin & HR)
exports.rejectLeave = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    if (!remarks || !remarks.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide remarks explaining why the leave is rejected',
      });
    }

    const leave = await Leave.findById(id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave application not found',
      });
    }

    if (req.user.role !== 'master' && req.user.organization && leave.organization && leave.organization.toString() !== req.user.organization.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Leave belongs to another organization',
      });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Leave application is already ${leave.status.toLowerCase()}`,
      });
    }

    leave.status = 'Rejected';
    leave.approvedBy = req.user._id;
    leave.remarks = remarks.trim();
    await leave.save();

    const updated = await Leave.findById(id)
      .populate('employee', 'name email department')
      .populate('approvedBy', 'name designation');

    res.status(200).json({
      success: true,
      message: 'Leave application rejected',
      leave: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel leave application (by employee)
// @route   PUT /api/leaves/:id/cancel
// @access  Private
exports.cancelLeave = async (req, res, next) => {
  try {
    const { id } = req.params;
    const leave = await Leave.findById(id);

    if (!leave) {
      return res.status(404).json({
        success: false,
        message: 'Leave application not found',
      });
    }

    if (req.user.role !== 'master' && req.user.organization && leave.organization && leave.organization.toString() !== req.user.organization.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: Leave belongs to another organization',
      });
    }

    // Only owner can cancel, and only if still pending
    if (leave.employee.toString() !== req.user._id.toString() && req.user.role === 'employee') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this leave application',
      });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel a leave application that is already ${leave.status.toLowerCase()}`,
      });
    }

    leave.status = 'Cancelled';
    await leave.save();

    res.status(200).json({
      success: true,
      message: 'Leave application cancelled successfully',
      leave,
    });
  } catch (error) {
    next(error);
  }
};
