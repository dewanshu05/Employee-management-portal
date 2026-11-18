require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Organization = require('../models/Organization');
const Department = require('../models/Department');
const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/emp-portal';

async function initProduction() {
  try {
    console.log('Connecting to MongoDB at:', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('Connected.');

    console.log('🧹 Purging all demo data and legacy test collections...');
    await Attendance.deleteMany({});
    await Leave.deleteMany({});
    await Department.deleteMany({});
    await User.deleteMany({});
    await Organization.deleteMany({});
    console.log('✅ All dummy demo records purged.');

    console.log('👑 Initializing Master Platform Maker Account...');
    const masterMaker = await User.create({
      name: 'Platform Founder & Master Administrator',
      email: 'maker@hrms.com',
      password: 'Maker@2026',
      role: 'master',
      designation: 'Platform Creator & Master Controller',
      status: 'active',
      phone: '+1 800-HRMS-MASTER',
      leaveBalances: {
        casual: 99,
        sick: 99,
        earned: 99,
        maternity: 99,
        paternity: 99,
      },
    });

    console.log('\n======================================================');
    console.log('🎉 PRODUCTION INITIALIZATION COMPLETE!');
    console.log('======================================================');
    console.log('All dummy employees, demo leaves, and demo logs removed.');
    console.log('\n👑 YOUR PLATFORM MAKER (MASTER) CREDENTIALS:');
    console.log('   Email:    maker@hrms.com');
    console.log('   Password: Maker@2026');
    console.log('   Role:     Platform Master (Full Universal Authority)');
    console.log('\n🏢 ORGANIZATIONS: Clean slate (0 registered organizations).');
    console.log('   Clients register their official company data at /register-organization');
    console.log('   They appear in your Master Console for review & approval.');
    console.log('======================================================\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error during production initialization:', err);
    process.exit(1);
  }
}

initProduction();
