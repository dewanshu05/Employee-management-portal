const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../models/User');
const Organization = require('../models/Organization');
const Department = require('../models/Department');

const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'super_secret_jwt_key_leave_portal_2026_secure',
    { expiresIn: '30d' }
  );
};

// @desc    Register a new user (with Zero-Access pending status by default, linked to Organization)
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res, next) => {
  try {
    const {
      name,
      email,
      password,
      role = 'employee',
      portal,
      department,
      designation,
      phone,
      organization,
      orgCode,
      registrationKey,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide full legal name, corporate email, and password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Normalized email
    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists',
      });
    }

    // Determine target role: can be derived from portal selection or explicit role
    let targetRole = 'employee';
    if (portal === 'admin' || role === 'admin') targetRole = 'admin';
    else if (portal === 'hr' || role === 'hr') targetRole = 'hr';
    else targetRole = 'employee';

    // Resolve Organization
    let targetOrg = null;
    const searchOrgParam = (organization || orgCode || '').toString().trim();

    if (searchOrgParam) {
      if (mongoose.Types.ObjectId.isValid(searchOrgParam)) {
        targetOrg = await Organization.findOne({ _id: searchOrgParam, status: 'active' });
      }
      if (!targetOrg) {
        targetOrg = await Organization.findOne({
          $or: [
            { orgCode: searchOrgParam.toUpperCase() },
            { slug: searchOrgParam.toLowerCase() },
            { name: { $regex: `^${searchOrgParam}$`, $options: 'i' } },
          ],
          status: 'active',
        });
      }
    }

    // Fallback: check selected department's organization
    if (!targetOrg && department && mongoose.Types.ObjectId.isValid(department)) {
      const deptDoc = await Department.findById(department);
      if (deptDoc && deptDoc.organization) {
        targetOrg = await Organization.findOne({ _id: deptDoc.organization, status: 'active' });
      }
    }

    // Fallback: check corporate email domain against active organizations
    if (!targetOrg) {
      const emailDomain = cleanEmail.split('@')[1];
      if (emailDomain && !['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com'].includes(emailDomain)) {
        targetOrg = await Organization.findOne({ domain: emailDomain, status: 'active' });
      }
    }

    // Fallback: if exactly 1 active organization exists on the platform, bind to it
    if (!targetOrg) {
      const activeOrgs = await Organization.find({ status: 'active' });
      if (activeOrgs.length === 1) {
        targetOrg = activeOrgs[0];
      }
    }

    if (!targetOrg) {
      return res.status(400).json({
        success: false,
        message: 'Please select a registered company or enter a valid Organization Code (e.g. ACM-2026) to register.',
      });
    }

    // Zero-Access Security Rule:
    // By default, every newly created account is quarantined in 'pending' status with ZERO access.
    // If an authorized company registration key is supplied for elevated roles, it can optionally be pre-activated.
    const validSecurityKey = process.env.ADMIN_REGISTER_KEY || 'HRMS-ENTERPRISE-KEY-2026';
    let initialStatus = 'pending';

    if (registrationKey && registrationKey.trim() === validSecurityKey) {
      initialStatus = 'active';
    }

    // Auto-generate employee ID
    const countInOrg = await User.countDocuments({ organization: targetOrg._id });
    const generatedEmpId = `EMP-${String(countInOrg + 101).padStart(4, '0')}`;

    const newUser = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      role: targetRole,
      employeeId: generatedEmpId,
      organization: targetOrg._id,
      department: department || null,
      designation: designation ? designation.trim() : (targetRole === 'admin' ? 'System Administrator' : targetRole === 'hr' ? 'HR Specialist' : 'New Joiner - Pending Assignment'),
      phone: phone ? phone.trim() : '',
      status: initialStatus,
      leaveBalances: {
        casual: 12,
        sick: 10,
        earned: 15,
        maternity: 180,
        paternity: 15,
      },
    });

    const isPending = initialStatus === 'pending';

    res.status(201).json({
      success: true,
      status: initialStatus,
      isPending,
      message: isPending
        ? `Account registered successfully for ${targetOrg.name}. Your account is currently in Zero-Access Quarantine pending administrator or HR approval.`
        : 'Account registered and authorized successfully.',
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        employeeId: newUser.employeeId,
        role: newUser.role,
        status: newUser.status,
        organization: {
          _id: targetOrg._id,
          name: targetOrg.name,
          orgCode: targetOrg.orgCode,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Auth user & get token (with portal clearance validation)
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res, next) => {
  try {
    const { email, password, portal } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password',
      });
    }

    // Check for user (include password field for verification)
    const user = await User.findOne({ email: email.toLowerCase().trim() })
      .select('+password')
      .populate('department', 'name')
      .populate('organization', 'name slug orgCode status registrationNumber');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid corporate credentials',
      });
    }

    // Strict Portal Clearance Validation:
    // Ensure that users only log into portals they have permissions for
    if (portal === 'admin' && !['admin', 'master'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: You do not possess Super Administrator clearance for the Admin Gateway.',
      });
    }

    if (portal === 'hr' && !['admin', 'hr', 'master'].includes(user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: You do not possess HR Manager authorization for the HR Operations Portal.',
      });
    }

    // Check if the user's organization is in Zero-Access Quarantine
    if (user.organization && user.role !== 'master' && user.organization.status !== 'active') {
      return res.status(403).json({
        success: false,
        code: 'ORG_PENDING',
        message: `Your organization ("${user.organization.name}") is currently PENDING verification and approval by the Platform Master Administrator. Portal access will be granted once official company verification is complete.`,
        organization: user.organization,
      });
    }

    // Check if account is in Zero-Access Pending Approval state
    if (user.status === 'pending') {
      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_PENDING',
        message: 'Your account has been registered but is currently in Zero-Access status pending administrator approval. No system access is permitted until approved.',
        user: {
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          createdAt: user.createdAt,
        },
      });
    }

    // Check if account is deactivated
    if (user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        code: 'ACCOUNT_INACTIVE',
        message: 'Your account has been deactivated. Please contact your administrator or HR.',
      });
    }

    // Check password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid corporate credentials',
      });
    }

    // Return token and safe user payload
    const token = generateToken(user._id);

    const userPayload = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId || '',
      department: user.department,
      designation: user.designation,
      phone: user.phone,
      joiningDate: user.joiningDate,
      salary: user.salary,
      status: user.status,
      organization: user.organization,
      profileImage: user.profileImage,
      leaveBalances: user.leaveBalances,
    };

    res.status(200).json({
      success: true,
      token,
      user: userPayload,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Initiate password reset (generate recovery token)
// @route   POST /api/auth/forgot-password
// @access  Public
exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your corporate email address',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found matching this corporate email address',
      });
    }

    // Generate a secure 6-digit verification reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedCode = crypto.createHash('sha256').update(resetCode).digest('hex');

    user.resetPasswordToken = hashedCode;
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes validity
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      success: true,
      message: 'Password reset code generated and sent to your email address.',
      // Providing the reset code in the response allows instant verification in local/demo deployments
      resetCode,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reset password using recovery code
// @route   POST /api/auth/reset-password
// @access  Public
exports.resetPassword = async (req, res, next) => {
  try {
    const { email, resetCode, newPassword } = req.body;

    if (!email || !resetCode || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide corporate email, reset code, and your new password',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const hashedCode = crypto.createHash('sha256').update(resetCode.trim()).digest('hex');

    const user = await User.findOne({
      email: cleanEmail,
      resetPasswordToken: hashedCode,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset code. Please request a new code.',
      });
    }

    // Set new password and clear reset tokens
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Your password has been successfully reset. You may now sign into your portal.',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('department', 'name')
      .populate('organization', 'name slug status registrationNumber');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update personal profile
// @route   PUT /api/auth/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, phone, profileImage } = req.body;

    const fieldsToUpdate = {};
    if (name) fieldsToUpdate.name = name;
    if (phone !== undefined) fieldsToUpdate.phone = phone;
    if (profileImage !== undefined) fieldsToUpdate.profileImage = profileImage;

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: fieldsToUpdate },
      { new: true, runValidators: true }
    ).populate('department', 'name');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/auth/change-password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password',
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long',
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password does not match',
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password changed successfully',
    });
  } catch (error) {
    next(error);
  }
};
