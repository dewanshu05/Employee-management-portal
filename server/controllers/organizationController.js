const Organization = require('../models/Organization');
const User = require('../models/User');
const Department = require('../models/Department');

// Utility to create a URL-safe slug from company name
const generateSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// Generate a clean official Indian Organization Code (e.g., ACM-2026 or ACM-4821)
const generateOrgCode = async (name) => {
  const letters = name.replace(/[^a-zA-Z]/g, '').toUpperCase();
  const prefix = (letters.length >= 3 ? letters.substring(0, 3) : 'ORG').toUpperCase();
  let code = '';
  let isUnique = false;
  let attempts = 0;
  while (!isUnique && attempts < 25) {
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    code = `${prefix}-${randomDigits}`;
    const exists = await Organization.findOne({ orgCode: code });
    if (!exists) isUnique = true;
    attempts++;
  }
  return code || `${prefix}-${Date.now().toString().slice(-4)}`;
};

// @desc    Get active organizations for public registration dropdown & employee lookup
// @route   GET /api/organizations/public
// @access  Public
exports.getPublicOrganizations = async (req, res, next) => {
  try {
    const organizations = await Organization.find(
      { status: 'active' },
      '_id name orgCode slug domain legalEntityType city state'
    ).sort({ name: 1 });

    res.status(200).json({
      success: true,
      count: organizations.length,
      organizations,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Register a new Organization with official business verification data
// @route   POST /api/organizations/register
// @access  Public
exports.registerOrganization = async (req, res, next) => {
  try {
    const companyName = req.body.companyName || req.body.name;
    const {
      registrationNumber,
      cin,
      gstin,
      pan,
      tan,
      legalEntityType,
      city,
      state,
      pincode,
      businessEmail,
      phone,
      domain,
      website,
      industry,
      companySize,
      address,
      adminName,
      adminEmail,
      adminPassword,
    } = req.body;

    const cleanRegNo = (registrationNumber || cin || '').trim().toUpperCase();
    const cleanCin = (cin || registrationNumber || '').trim().toUpperCase();
    const cleanGstin = (gstin || '').trim().toUpperCase();
    const cleanPan = (pan || '').trim().toUpperCase();

    if (!companyName || !cleanRegNo || !businessEmail || !adminName || !adminEmail || !adminPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide company name, official registration number / CIN, business email, and admin credentials.',
      });
    }

    if (adminPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Admin password must be at least 6 characters long.',
      });
    }

    const cleanCompanyEmail = businessEmail.toLowerCase().trim();
    const cleanAdminEmail = adminEmail.toLowerCase().trim();

    // Check if an account already exists with admin email
    const existingUser = await User.findOne({ email: cleanAdminEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'A user account with this administrator email address already exists.',
      });
    }

    // Check if organization already exists
    const duplicateOrConditions = [
      { registrationNumber: cleanRegNo },
      { businessEmail: cleanCompanyEmail },
    ];
    if (cleanCin) duplicateOrConditions.push({ cin: cleanCin });
    if (cleanGstin) duplicateOrConditions.push({ gstin: cleanGstin });

    const existingOrg = await Organization.findOne({ $or: duplicateOrConditions });
    if (existingOrg) {
      return res.status(400).json({
        success: false,
        message: 'An organization with this official registration number (CIN), GSTIN, or business email is already registered.',
      });
    }

    // Generate slug and organization code
    let baseSlug = generateSlug(companyName);
    let slug = baseSlug;
    let counter = 1;
    while (await Organization.findOne({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }
    const orgCode = await generateOrgCode(companyName);

    // 1. Create Organization in Quarantined Pending state
    const organization = await Organization.create({
      name: companyName.trim(),
      slug,
      orgCode,
      businessEmail: cleanCompanyEmail,
      phone: phone ? phone.trim() : '',
      domain: domain ? domain.toLowerCase().trim() : '',
      website: website ? website.trim() : '',
      industry: industry || 'Information Technology & Services',
      legalEntityType: legalEntityType || 'Private Limited (Pvt Ltd)',
      cin: cleanCin,
      gstin: cleanGstin,
      pan: cleanPan,
      tan: tan ? tan.trim().toUpperCase() : '',
      city: city ? city.trim() : '',
      state: state || 'Maharashtra',
      pincode: pincode ? pincode.trim() : '',
      country: 'India',
      registrationNumber: cleanRegNo,
      companySize: companySize || '11-50',
      address: address ? address.trim() : '',
      status: 'pending', // Zero-Access quarantine pending Platform Maker approval
    });

    // 2. Create the Organization Super Admin in Quarantined Pending state
    const adminUser = await User.create({
      name: adminName.trim(),
      email: cleanAdminEmail,
      password: adminPassword,
      role: 'admin',
      organization: organization._id,
      designation: 'Managing Director / Organization Admin',
      phone: phone ? phone.trim() : '',
      status: 'pending', // Blocked until Platform Maker approves Organization
      leaveBalances: {
        casual: 12,
        sick: 10,
        earned: 15,
        maternity: 180,
        paternity: 15,
      },
    });

    organization.owner = adminUser._id;
    await organization.save();

    res.status(201).json({
      success: true,
      status: 'pending',
      message:
        'Organization registration submitted successfully with official business verification details. In accordance with platform governance, your organization is currently in Zero-Access Quarantine pending verification and approval by the Platform Master Administrator.',
      organization: {
        _id: organization._id,
        name: organization.name,
        orgCode: organization.orgCode,
        registrationNumber: organization.registrationNumber,
        businessEmail: organization.businessEmail,
        status: organization.status,
        createdAt: organization.createdAt,
      },
      admin: {
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        status: adminUser.status,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all organizations (Platform Maker only)
// @route   GET /api/organizations
// @access  Private (Master Maker only)
exports.getOrganizations = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { businessEmail: { $regex: search, $options: 'i' } },
        { registrationNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const total = await Organization.countDocuments(query);
    const organizations = await Organization.find(query)
      .populate('owner', 'name email designation phone createdAt')
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Attach workforce count per organization
    const orgsWithCounts = await Promise.all(
      organizations.map(async (org) => {
        const memberCount = await User.countDocuments({ organization: org._id });
        return {
          ...org.toObject(),
          memberCount,
        };
      })
    );

    res.status(200).json({
      success: true,
      total,
      count: orgsWithCounts.length,
      totalPages: Math.ceil(total / limitNum) || 1,
      currentPage: pageNum,
      organizations: orgsWithCounts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Approve an organization (Platform Maker only)
// @route   PATCH /api/organizations/:id/approve
// @access  Private (Master Maker only)
exports.approveOrganization = async (req, res, next) => {
  try {
    const { id } = req.params;
    const organization = await Organization.findById(id);

    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found.',
      });
    }

    if (!organization.orgCode) {
      organization.orgCode = await generateOrgCode(organization.name);
    }

    organization.status = 'active';
    organization.approvedBy = req.user._id;
    organization.approvedAt = new Date();
    await organization.save();

    // Activate the Organization's Super Admin
    if (organization.owner) {
      await User.findByIdAndUpdate(organization.owner, { status: 'active' });
    }

    // Initialize clean starter departments for this organization if none exist
    const existingDepts = await Department.countDocuments({ organization: organization._id });
    if (existingDepts === 0) {
      await Department.create([
        {
          name: 'Engineering',
          organization: organization._id,
          description: 'Software development, architecture, and technology',
        },
        {
          name: 'Human Resources',
          organization: organization._id,
          description: 'Workforce management, recruitment, and culture',
        },
        {
          name: 'Executive & Leadership',
          organization: organization._id,
          description: 'Company executive leadership and strategic management',
        },
        {
          name: 'Operations & General',
          organization: organization._id,
          description: 'Core operations and administrative logistics',
        },
      ]);
    }

    res.status(200).json({
      success: true,
      message: `Organization "${organization.name}" has been officially verified and approved. Organization Super Admin access is now activated.`,
      organization,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reject or Suspend an organization (Platform Maker only)
// @route   PATCH /api/organizations/:id/reject
// @access  Private (Master Maker only)
exports.rejectOrganization = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body || {};

    const organization = await Organization.findById(id);
    if (!organization) {
      return res.status(404).json({
        success: false,
        message: 'Organization not found.',
      });
    }

    organization.status = 'rejected';
    organization.remarks = remarks || 'Registration rejected by Platform Administrator.';
    await organization.save();

    // Deactivate owner
    if (organization.owner) {
      await User.findByIdAndUpdate(organization.owner, { status: 'inactive' });
    }

    res.status(200).json({
      success: true,
      message: `Organization "${organization.name}" marked as rejected.`,
      organization,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get master platform metrics (Platform Maker only)
// @route   GET /api/organizations/master/metrics
// @access  Private (Master Maker only)
exports.getMasterMetrics = async (req, res, next) => {
  try {
    const totalOrganizations = await Organization.countDocuments();
    const pendingOrganizations = await Organization.countDocuments({ status: 'pending' });
    const activeOrganizations = await Organization.countDocuments({ status: 'active' });
    const totalPlatformUsers = await User.countDocuments({ role: { $ne: 'master' } });

    res.status(200).json({
      success: true,
      metrics: {
        totalOrganizations,
        pendingOrganizations,
        activeOrganizations,
        totalPlatformUsers,
      },
    });
  } catch (error) {
    next(error);
  }
};
