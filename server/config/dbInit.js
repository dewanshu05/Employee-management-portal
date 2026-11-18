const User = require('../models/User');
const Organization = require('../models/Organization');

const initDatabase = async () => {
  try {
    // 1. Ensure active organization has an orgCode
    const orgs = await Organization.find({});
    for (const org of orgs) {
      if (!org.orgCode) {
        const letters = org.name.replace(/[^a-zA-Z]/g, '').toUpperCase();
        const prefix = (letters.length >= 3 ? letters.substring(0, 3) : 'ORG').toUpperCase();
        org.orgCode = `${prefix}-2026`;
        await org.save();
        console.log(`[DB Init] Assigned Organization Code ${org.orgCode} to ${org.name}`);
      }
    }

    // 2. Find primary active organization
    const primaryOrg = await Organization.findOne({ status: 'active' });
    if (primaryOrg) {
      // Link any orphan pending or unlinked users to primary organization
      const orphans = await User.find({
        role: { $in: ['employee', 'hr', 'admin'] },
        $or: [{ organization: null }, { organization: { $exists: false } }],
      });

      for (const orphan of orphans) {
        orphan.organization = primaryOrg._id;
        if (!orphan.employeeId) {
          const count = await User.countDocuments({ organization: primaryOrg._id });
          orphan.employeeId = `EMP-${String(count + 101).padStart(4, '0')}`;
        }
        await orphan.save();
        console.log(`[DB Init] Linked orphan user ${orphan.email} (${orphan.name}) to organization ${primaryOrg.name}`);
      }
    }

    // 3. Assign employeeId to any user missing it
    const usersWithoutEmpId = await User.find({
      employeeId: { $in: ['', null] },
      role: { $ne: 'master' },
    });

    let counter = 101;
    for (const u of usersWithoutEmpId) {
      u.employeeId = `EMP-${String(counter++).padStart(4, '0')}`;
      await u.save();
    }
  } catch (err) {
    console.error('[DB Init Error]:', err.message);
  }
};

module.exports = initDatabase;
