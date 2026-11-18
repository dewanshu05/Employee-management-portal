const User = require('../models/User');
const Department = require('../models/Department');
const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');

// @desc    Get all employees with search, filter & pagination
// @route   GET /api/employees
// @access  Private (Admin & HR)
exports.getEmployees = async (req, res, next) => {
  try {
    const {
      search,
      department,
      designation,
      status,
      role,
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc',
    } = req.query;

    const conditions = [];

    // Search by name, email, employeeId, or designation
    if (search && search.trim()) {
      const s = search.trim();
      conditions.push({
        $or: [
          { name: { $regex: s, $options: 'i' } },
          { email: { $regex: s, $options: 'i' } },
          { designation: { $regex: s, $options: 'i' } },
          { employeeId: { $regex: s, $options: 'i' } },
        ],
      });
    }

    // Filter by department
    if (department && department !== 'all') {
      conditions.push({ department });
    }

    // Filter by designation
    if (designation && designation !== 'all') {
      conditions.push({ designation: { $regex: designation, $options: 'i' } });
    }

    // Filter by status
    if (status && status !== 'all') {
      conditions.push({ status });
    }

    // Filter by role
    if (role && role !== 'all') {
      conditions.push({ role });
    }

    // Multi-tenant organization isolation
    if (req.user.role !== 'master' && req.user.organization) {
      if (status === 'pending') {
        // Allow seeing pending users assigned to this org OR unassigned pending users
        conditions.push({
          $or: [
            { organization: req.user.organization },
            { organization: null },
          ],
        });
      } else {
        conditions.push({ organization: req.user.organization });
      }
    }

    const query = conditions.length > 0 ? { $and: conditions } : {};

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await User.countDocuments(query);
    const employees = await User.find(query)
      .populate('department', 'name')
      .populate('organization', 'name orgCode')
      .sort({ [sortBy]: order === 'asc' ? 1 : -1 })
      .skip(skip)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      count: employees.length,
      total,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      employees,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single employee details
// @route   GET /api/employees/:id
// @access  Private (Admin, HR, or self)
exports.getEmployeeById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Non-admin/hr can only view their own profile
    if (req.user.role === 'employee' && req.user._id.toString() !== id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to other employee records',
      });
    }

    const employee = await User.findById(id).populate('department', 'name head');

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Get recent leave applications
    const recentLeaves = await Leave.find({ employee: id })
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recent attendance records
    const recentAttendance = await Attendance.find({ employee: id })
      .sort({ date: -1 })
      .limit(7);

    res.status(200).json({
      success: true,
      employee,
      recentLeaves,
      recentAttendance,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new employee
// @route   POST /api/employees
// @access  Private (Admin & HR)
exports.createEmployee = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role = 'employee',
      employeeId,
      department,
      designation,
      phone,
      joiningDate,
      salary,
      status = 'active',
      profileImage,
      leaveBalances,
      pan,
      aadhaar,
      uan,
      bankAccount,
      ifsc,
    } = req.body;

    // Role restrictions: HR cannot create Super Admin or change role to admin
    if (req.user.role === 'hr' && role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'HR managers cannot create Super Admin accounts',
      });
    }

    // Check duplicate email
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An employee with this email already exists',
      });
    }

    // If department supplied, verify it exists
    if (department) {
      const deptExists = await Department.findById(department);
      if (!deptExists) {
        return res.status(400).json({
          success: false,
          message: 'Selected department does not exist',
        });
      }
    }

    // Generate official Employee ID if not supplied
    let officialEmpId = (employeeId || '').trim().toUpperCase();
    if (!officialEmpId) {
      const orgFilter = req.user.organization ? { organization: req.user.organization } : {};
      const count = await User.countDocuments(orgFilter);
      officialEmpId = `EMP-${String(count + 101).padStart(4, '0')}`;
    }

    const tempPassword = password || 'Welcome@123';

    const newEmployee = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: tempPassword,
      role,
      employeeId: officialEmpId,
      organization: req.user.organization || null,
      department: department || null,
      designation: designation ? designation.trim() : 'Staff Member',
      phone: phone || '',
      joiningDate: joiningDate ? new Date(joiningDate) : new Date(),
      salary: Number(salary) || 0,
      pan: pan ? pan.trim().toUpperCase() : '',
      aadhaar: aadhaar ? aadhaar.trim() : '',
      uan: uan ? uan.trim() : '',
      bankAccount: bankAccount ? bankAccount.trim() : '',
      ifsc: ifsc ? ifsc.trim().toUpperCase() : '',
      status,
      profileImage: profileImage || '',
      leaveBalances: leaveBalances || {
        casual: 12,
        sick: 10,
        earned: 15,
        maternity: 180,
        paternity: 15,
      },
    });

    const populatedEmployee = await User.findById(newEmployee._id)
      .populate('department', 'name')
      .populate('organization', 'name orgCode');

    res.status(201).json({
      success: true,
      message: 'Employee account created successfully with generated credentials.',
      employee: populatedEmployee,
      credentials: {
        employeeId: officialEmpId,
        email: newEmployee.email,
        temporaryPassword: tempPassword,
        role: newEmployee.role,
        portal:
          newEmployee.role === 'admin'
            ? 'Super Admin Gateway'
            : newEmployee.role === 'hr'
            ? 'HR Operations Portal'
            : 'Employee Portal',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private (Admin & HR)
exports.updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      role,
      employeeId,
      department,
      designation,
      phone,
      joiningDate,
      salary,
      status,
      profileImage,
      leaveBalances,
      password,
      pan,
      aadhaar,
      uan,
      bankAccount,
      ifsc,
    } = req.body;

    const employee = await User.findById(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Role restrictions: HR cannot promote to or demote from admin
    if (req.user.role === 'hr') {
      if (employee.role === 'admin' || role === 'admin') {
        return res.status(403).json({
          success: false,
          message: 'HR managers cannot modify Super Admin accounts or roles',
        });
      }
    }

    // Email uniqueness check if changing email
    if (email && email.toLowerCase().trim() !== employee.email) {
      const emailExists = await User.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: id },
      });
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'An employee with this email already exists',
        });
      }
      employee.email = email.toLowerCase().trim();
    }

    if (name) employee.name = name.trim();
    if (employeeId !== undefined) employee.employeeId = employeeId.trim().toUpperCase();
    if (role && (req.user.role === 'admin' || (req.user.role === 'hr' && role !== 'admin'))) {
      employee.role = role;
    }
    if (department !== undefined) employee.department = department || null;
    if (designation) employee.designation = designation.trim();
    if (phone !== undefined) employee.phone = phone;
    if (joiningDate) employee.joiningDate = new Date(joiningDate);
    if (salary !== undefined) employee.salary = Number(salary);
    if (pan !== undefined) employee.pan = pan ? pan.trim().toUpperCase() : '';
    if (aadhaar !== undefined) employee.aadhaar = aadhaar ? aadhaar.trim() : '';
    if (uan !== undefined) employee.uan = uan ? uan.trim() : '';
    if (bankAccount !== undefined) employee.bankAccount = bankAccount ? bankAccount.trim() : '';
    if (ifsc !== undefined) employee.ifsc = ifsc ? ifsc.trim().toUpperCase() : '';
    if (status) employee.status = status;
    if (profileImage !== undefined) employee.profileImage = profileImage;
    if (leaveBalances) {
      employee.leaveBalances = {
        ...employee.leaveBalances,
        ...leaveBalances,
      };
    }
    if (password && password.trim().length >= 6) {
      employee.password = password;
    }

    await employee.save();

    const updated = await User.findById(id).populate('department', 'name');

    res.status(200).json({
      success: true,
      message: 'Employee updated successfully',
      employee: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete or deactivate employee
// @route   DELETE /api/employees/:id
// @access  Private (Admin & HR)
exports.deleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;

    const employee = await User.findById(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    // Cannot delete Super Admin
    if (employee.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete Super Admin account',
      });
    }

    // Check if employee is head of any department
    const isHead = await Department.findOne({ head: id });
    if (isHead) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete: this employee is the head of ${isHead.name} department. Reassign the department head first.`,
      });
    }

    // Delete associated leaves and attendance
    await Leave.deleteMany({ employee: id });
    await Attendance.deleteMany({ employee: id });
    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Employee and associated records deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle employee active/inactive status
// @route   PATCH /api/employees/:id/status
// @access  Private (Admin & HR)
exports.toggleEmployeeStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const employee = await User.findById(id);

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    if (employee.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot deactivate Super Admin account',
      });
    }

    employee.status = employee.status === 'active' ? 'inactive' : 'active';
    await employee.save();

    res.status(200).json({
      success: true,
      message: `Employee marked as ${employee.status}`,
      status: employee.status,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve pending employee account & assign quota/department
// @route   PATCH /api/employees/:id/approve
// @access  Private (Admin & HR)
exports.approveEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { department, designation, salary, role, employeeId } = req.body || {};

    const employee = await User.findById(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    if (department) employee.department = department;
    if (designation) employee.designation = designation.trim();
    if (salary !== undefined && salary !== null && salary !== '') employee.salary = Number(salary);
    if (employeeId && employeeId.trim()) employee.employeeId = employeeId.trim().toUpperCase();
    if (!employee.employeeId) {
      const orgFilter = employee.organization ? { organization: employee.organization } : (req.user.organization ? { organization: req.user.organization } : {});
      const count = await User.countDocuments(orgFilter);
      employee.employeeId = `EMP-${String(count + 101).padStart(4, '0')}`;
    }
    if (!employee.organization && req.user.organization) {
      employee.organization = req.user.organization;
    }
    if (role && (req.user.role === 'admin' || (req.user.role === 'hr' && role !== 'admin'))) {
      employee.role = role;
    }

    employee.status = 'active';
    await employee.save();

    const populated = await User.findById(id)
      .populate('department', 'name')
      .populate('organization', 'name orgCode');

    res.status(200).json({
      success: true,
      message: 'Account approved and activated successfully. Employee can now log in.',
      employee: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject pending employee registration
// @route   PATCH /api/employees/:id/reject
// @access  Private (Admin & HR)
exports.rejectEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    const employee = await User.findById(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Applicant not found',
      });
    }

    if (employee.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending registration applications can be rejected',
      });
    }

    await User.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Registration application has been rejected and removed.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update leave balance allocation
// @route   PUT /api/employees/:id/leave-balance
// @access  Private (Admin & HR)
exports.updateLeaveBalance = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { leaveBalances } = req.body;

    const employee = await User.findById(id);
    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found',
      });
    }

    employee.leaveBalances = {
      casual: Number(leaveBalances.casual) || 0,
      sick: Number(leaveBalances.sick) || 0,
      earned: Number(leaveBalances.earned) || 0,
      maternity: Number(leaveBalances.maternity) || 0,
      paternity: Number(leaveBalances.paternity) || 0,
    };

    await employee.save();

    res.status(200).json({
      success: true,
      message: 'Leave balances updated successfully',
      leaveBalances: employee.leaveBalances,
    });
  } catch (error) {
    next(error);
  }
};
