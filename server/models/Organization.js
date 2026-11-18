const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide legal organization name'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    orgCode: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
    },
    businessEmail: {
      type: String,
      required: [true, 'Please provide corporate business email'],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
      default: '',
    },
    domain: {
      type: String,
      lowercase: true,
      trim: true,
      default: '',
    },
    website: {
      type: String,
      trim: true,
      default: '',
    },
    industry: {
      type: String,
      trim: true,
      default: 'Information Technology & Services',
    },
    legalEntityType: {
      type: String,
      enum: [
        'Private Limited (Pvt Ltd)',
        'Public Limited (Ltd)',
        'Limited Liability Partnership (LLP)',
        'Partnership Firm',
        'Sole Proprietorship',
        'One Person Company (OPC)',
      ],
      default: 'Private Limited (Pvt Ltd)',
    },
    cin: {
      type: String,
      trim: true,
      uppercase: true,
      default: '',
    },
    gstin: {
      type: String,
      trim: true,
      uppercase: true,
      default: '',
    },
    pan: {
      type: String,
      trim: true,
      uppercase: true,
      default: '',
    },
    tan: {
      type: String,
      trim: true,
      uppercase: true,
      default: '',
    },
    registrationNumber: {
      type: String,
      required: [true, 'Please provide official company registration number / CIN / LLPIN'],
      trim: true,
    },
    companySize: {
      type: String,
      enum: ['1-10', '11-50', '51-200', '201-500', '500+'],
      default: '11-50',
    },
    address: {
      type: String,
      trim: true,
      default: '',
    },
    city: {
      type: String,
      trim: true,
      default: '',
    },
    state: {
      type: String,
      trim: true,
      default: 'Maharashtra',
    },
    pincode: {
      type: String,
      trim: true,
      default: '',
    },
    country: {
      type: String,
      default: 'India',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'active', 'rejected', 'suspended'],
      default: 'pending',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    remarks: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Organization', organizationSchema);
