const Department = require('../models/Department');
const User = require('../models/User');
const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');

// @desc    Get lightweight department list for registration/public forms
// @route   GET /api/departments/public
// @access  Public
exports.getPublicDepartments = async (req, res, next) => {
  try {
    const query = {};
    if (req.query.organization) {
      query.organization = req.query.organization;
    }
    const departments = await Department.find(query, '_id name description organization').sort({ name: 1 });
    res.status(200).json({
      success: true,
      departments,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all departments with employee counts and heads
// @route   GET /api/departments
// @access  Private
exports.getDepartments = async (req, res, next) => {
  try {
    const query = {};
    if (req.user.role !== 'master' && req.user.organization) {
      query.organization = req.user.organization;
    }

    const departments = await Department.find(query)
      .populate('head', 'name email designation profileImage')
      .sort({ name: 1 });

    // Aggregate employee count per department
    const departmentsWithStats = await Promise.all(
      departments.map(async (dept) => {
        const employeeCount = await User.countDocuments({
          department: dept._id,
          status: 'active',
        });
        const totalEmployees = await User.countDocuments({
          department: dept._id,
        });

        return {
          ...dept.toObject(),
          activeEmployeeCount: employeeCount,
          totalEmployeeCount: totalEmployees,
        };
      })
    );

    res.status(200).json({
      success: true,
      count: departmentsWithStats.length,
      departments: departmentsWithStats,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single department with its employees and stats
// @route   GET /api/departments/:id
// @access  Private
exports.getDepartmentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const department = await Department.findById(id).populate(
      'head',
      'name email designation phone profileImage'
    );

    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found',
      });
    }

    // Get all employees in this department
    const employees = await User.find({ department: id })
      .select('name email designation role status phone salary profileImage')
      .sort({ name: 1 });

    const activeCount = employees.filter((e) => e.status === 'active').length;
    const empIds = employees.map((e) => e._id);

    // Leaves in department
    const pendingLeaves = await Leave.countDocuments({
      employee: { $in: empIds },
      status: 'Pending',
    });

    res.status(200).json({
      success: true,
      department,
      stats: {
        totalEmployees: employees.length,
        activeEmployees: activeCount,
        pendingLeaves,
      },
      employees,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new department
// @route   POST /api/departments
// @access  Private (Admin only)
exports.createDepartment = async (req, res, next) => {
  try {
    const { name, head, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Department name is required',
      });
    }

    const existing = await Department.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      organization: req.user.organization || null,
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A department with this name already exists in your organization',
      });
    }

    // If head specified, verify employee exists
    if (head) {
      const headUser = await User.findById(head);
      if (!headUser) {
        return res.status(400).json({
          success: false,
          message: 'Selected department head does not exist',
        });
      }
    }

    const department = await Department.create({
      name: name.trim(),
      head: head || null,
      description: description ? description.trim() : '',
      organization: req.user.organization || null,
    });

    const populated = await Department.findById(department._id).populate(
      'head',
      'name email designation'
    );

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      department: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update department
// @route   PUT /api/departments/:id
// @access  Private (Admin only)
exports.updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, head, description } = req.body;

    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found',
      });
    }

    if (name && name.trim() !== department.name) {
      const existing = await Department.findOne({
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
        _id: { $ne: id },
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'A department with this name already exists',
        });
      }
      department.name = name.trim();
    }

    if (head !== undefined) {
      if (head) {
        const headUser = await User.findById(head);
        if (!headUser) {
          return res.status(400).json({
            success: false,
            message: 'Selected department head does not exist',
          });
        }
      }
      department.head = head || null;
    }

    if (description !== undefined) {
      department.description = description ? description.trim() : '';
    }

    await department.save();

    const updated = await Department.findById(id).populate(
      'head',
      'name email designation'
    );

    res.status(200).json({
      success: true,
      message: 'Department updated successfully',
      department: updated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete department with dependency check
// @route   DELETE /api/departments/:id
// @access  Private (Admin only)
exports.deleteDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;

    const department = await Department.findById(id);
    if (!department) {
      return res.status(404).json({
        success: false,
        message: 'Department not found',
      });
    }

    // Dependency check: check if any employees belong to this department
    const employeeCount = await User.countDocuments({ department: id });

    if (employeeCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete department: There are currently ${employeeCount} employee(s) assigned to ${department.name}. Please reassign them before deleting this department.`,
      });
    }

    await Department.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: `Department "${department.name}" deleted successfully`,
    });
  } catch (error) {
    next(error);
  }
};
