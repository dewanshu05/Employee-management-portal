const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide employee name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide email address'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ['master', 'admin', 'hr', 'employee'],
      default: 'employee',
    },
    employeeId: {
      type: String,
      trim: true,
      uppercase: true,
      default: '',
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: false,
    },
    designation: {
      type: String,
      default: 'Pending Assignment',
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    salary: {
      type: Number,
      default: 0,
    },
    pan: {
      type: String,
      trim: true,
      uppercase: true,
      default: '',
    },
    aadhaar: {
      type: String,
      trim: true,
      default: '',
    },
    uan: {
      type: String,
      trim: true,
      default: '',
    },
    bankAccount: {
      type: String,
      trim: true,
      default: '',
    },
    ifsc: {
      type: String,
      trim: true,
      uppercase: true,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'active',
    },
    profileImage: {
      type: String,
      default: '',
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
    leaveBalances: {
      casual: { type: Number, default: 12 },
      sick: { type: Number, default: 10 },
      earned: { type: Number, default: 15 },
      maternity: { type: Number, default: 180 },
      paternity: { type: Number, default: 15 },
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
