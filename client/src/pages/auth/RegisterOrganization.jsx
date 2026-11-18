import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import {
  Building2,
  Lock,
  Mail,
  User,
  Phone,
  Globe,
  FileText,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  Eye,
  EyeOff,
  Briefcase,
  MapPin,
  Sparkles,
} from 'lucide-react';

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Delhi (NCR)',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
];

const RegisterOrganization = () => {
  const [companyName, setCompanyName] = useState('');
  const [legalEntityType, setLegalEntityType] = useState('Private Limited (Pvt Ltd)');
  const [cin, setCin] = useState('');
  const [gstin, setGstin] = useState('');
  const [pan, setPan] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [domain, setDomain] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('Information Technology & Services');
  const [companySize, setCompanySize] = useState('11-50');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Maharashtra');
  const [pincode, setPincode] = useState('');

  // Admin user details
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submittedOrg, setSubmittedOrg] = useState(null);

  const navigate = useNavigate();

  // Password strength
  const getPasswordStrength = () => {
    let score = 0;
    if (adminPassword.length >= 8) score++;
    if (/[A-Z]/.test(adminPassword)) score++;
    if (/[0-9]/.test(adminPassword)) score++;
    if (/[^A-Za-z0-9]/.test(adminPassword)) score++;
    return score;
  };

  const passwordScore = getPasswordStrength();
  const strengthLabels = ['Too Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-slate-300', 'bg-rose-500', 'bg-amber-500', 'bg-blue-500', 'bg-emerald-500'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const effectiveRegNo = (cin || registrationNumber).trim();

    if (!companyName.trim() || !effectiveRegNo || !businessEmail.trim()) {
      setError('Please provide legal company name, official CIN/Registration number, and corporate business email.');
      return;
    }

    if (!adminName.trim() || !adminEmail.trim() || !adminPassword) {
      setError('Please provide primary administrator credentials.');
      return;
    }

    if (adminPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (adminPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (!agreeTerms) {
      setError('Please verify and consent to the official Indian corporate registration governance policy.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/organizations/register', {
        companyName: companyName.trim(),
        legalEntityType,
        cin: cin.trim().toUpperCase(),
        gstin: gstin.trim().toUpperCase(),
        pan: pan.trim().toUpperCase(),
        registrationNumber: effectiveRegNo.toUpperCase(),
        businessEmail: businessEmail.trim().toLowerCase(),
        phone: phone.trim(),
        domain: domain.trim().toLowerCase(),
        website: website.trim(),
        industry,
        companySize,
        address: address.trim(),
        city: city.trim(),
        state,
        pincode: pincode.trim(),
        country: 'India',
        adminName: adminName.trim(),
        adminEmail: adminEmail.trim().toLowerCase(),
        adminPassword,
      });

      if (res.data.success) {
        setSubmittedOrg(res.data.organization);
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to register organization. Please check provided business data.'
      );
    } finally {
      setLoading(false);
    }
  };

  // If submitted successfully, show Confirmation Screen
  if (submittedOrg) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 sm:px-6 py-12 relative overflow-hidden">
        <div className="w-full max-w-xl bg-slate-800/95 border border-slate-700 rounded-3xl p-8 sm:p-10 shadow-2xl text-white space-y-6">
          <div className="flex items-center gap-3 pb-6 border-b border-slate-700">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xl">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">PORTAL HRMS • Platform Governance</h2>
              <p className="text-xs text-amber-400 font-semibold uppercase tracking-wider">
                Organization Registration Dossier Submitted
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h1 className="text-2xl font-extrabold text-white">
              Application Under Compliance Review
            </h1>
            <p className="text-xs text-slate-300 leading-relaxed">
              Your official organization profile for <strong className="text-white">{submittedOrg.name}</strong> has been
              securely recorded in **Zero-Access Quarantine**. In accordance with platform policy, your company registration details
              (Reg No: <span className="font-mono text-amber-300">{submittedOrg.registrationNumber}</span>) are pending
              verification and approval by the **Platform Master Administrator**.
            </p>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700 text-xs space-y-2.5">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Registration Verification Summary
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Legal Business Name:</span>
                <span className="font-semibold text-white">{submittedOrg.name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-800 items-center">
                <span className="text-slate-400">Official Company Code (Unique ID):</span>
                <span className="font-mono font-black text-indigo-300 text-sm bg-indigo-500/20 px-2.5 py-0.5 rounded-lg border border-indigo-400/30">
                  {submittedOrg.orgCode || 'Will be active on approval'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Registration / Tax ID:</span>
                <span className="font-mono font-semibold text-amber-300">{submittedOrg.registrationNumber}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Corporate Email:</span>
                <span className="text-white font-mono">{submittedOrg.businessEmail}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Clearance Status:</span>
                <span className="text-amber-400 font-bold">Pending Platform Master Approval</span>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-700/30 border border-slate-700 text-xs text-slate-400 space-y-1">
              <p className="font-semibold text-slate-300">What happens next?</p>
              <p>
                The Platform Founder will inspect your official corporate registration credentials. Once approved,
                your dedicated Organization Super Admin account will be unlocked, and your independent corporate workspace will be activated.
              </p>
            </div>
          </div>

          <div className="pt-2">
            <Link
              to="/login?portal=admin"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/30 transition-colors"
            >
              <span>Proceed to Portal Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Top Header Banner */}
        <div className="bg-slate-950 p-6 sm:p-8 text-white relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-600/30">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-wide">PORTAL HRMS</h2>
                <p className="text-[11px] text-indigo-400 font-semibold uppercase tracking-wider">
                  Official Organization Onboarding & Registration
                </p>
              </div>
            </div>

            <span className="hidden sm:inline-flex px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
              Master Approval Required
            </span>
          </div>

          <div className="mt-4 max-w-xl">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Register Your Organization
            </h1>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Submit your official corporate data to provision a secure, isolated workspace. All organization registrations
              are reviewed and approved by Platform Administration prior to activation.
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="p-6 sm:p-8 lg:p-10">
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Section 1: Official Corporate Information */}
            <div>
              <div className="flex items-center gap-2 pb-2 mb-4 border-b border-slate-100">
                <Building2 className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  1. Official Indian Corporate & Statutory Credentials
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Legal Company Name (as per MCA / ROC) *
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Acme Tech Solutions Private Limited"
                    required
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Legal Entity Structure *
                  </label>
                  <select
                    value={legalEntityType}
                    onChange={(e) => setLegalEntityType(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  >
                    <option value="Private Limited (Pvt Ltd)">Private Limited (Pvt Ltd)</option>
                    <option value="Public Limited (Ltd)">Public Limited (Ltd)</option>
                    <option value="Limited Liability Partnership (LLP)">Limited Liability Partnership (LLP)</option>
                    <option value="Partnership Firm">Partnership Firm</option>
                    <option value="Sole Proprietorship">Sole Proprietorship</option>
                    <option value="One Person Company (OPC)">One Person Company (OPC)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Corporate Identification Number (CIN / LLPIN) *
                  </label>
                  <input
                    type="text"
                    value={cin}
                    onChange={(e) => {
                      setCin(e.target.value);
                      setRegistrationNumber(e.target.value);
                    }}
                    placeholder="e.g. U72200MH2021PTC123456"
                    required
                    className="w-full px-3.5 py-2 text-sm font-mono uppercase bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">21-digit alphanumeric CIN issued by MCA / ROC India</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    GSTIN (GST Identification Number)
                  </label>
                  <input
                    type="text"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    placeholder="e.g. 27AAPFU0939F1ZV"
                    className="w-full px-3.5 py-2 text-sm font-mono uppercase bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">15-digit GST State Code + PAN + Entity Code</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Corporate Permanent Account Number (PAN)
                  </label>
                  <input
                    type="text"
                    value={pan}
                    onChange={(e) => setPan(e.target.value)}
                    placeholder="e.g. AABCB1234F"
                    className="w-full px-3.5 py-2 text-sm font-mono uppercase bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                  <p className="text-[10px] text-slate-400 mt-1">10-character Income Tax PAN of the entity</p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Official Corporate Email *
                  </label>
                  <input
                    type="email"
                    value={businessEmail}
                    onChange={(e) => setBusinessEmail(e.target.value)}
                    placeholder="contact@company.in"
                    required
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Corporate Mobile / Contact (+91) *
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    required
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Workforce Headcount (India)
                  </label>
                  <select
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  >
                    <option value="1-10">1 - 10 Employees</option>
                    <option value="11-50">11 - 50 Employees</option>
                    <option value="51-200">51 - 200 Employees</option>
                    <option value="201-500">201 - 500 Employees</option>
                    <option value="500+">500+ Enterprise</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Registered State (India) *
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  >
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City / Tech Hub *
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Mumbai, Bengaluru, Hyderabad, Pune, Gurugram"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Postal PIN Code (6 Digits) *
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="e.g. 400001 or 560001"
                    className="w-full px-3.5 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Industry Domain
                  </label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  >
                    <option value="Information Technology & Services">Information Technology & Services</option>
                    <option value="Fintech & BFSI">Fintech & BFSI</option>
                    <option value="Manufacturing & Auto">Manufacturing & Auto</option>
                    <option value="E-Commerce & Logistics">E-Commerce & Logistics</option>
                    <option value="Healthcare & Pharma">Healthcare & Pharma</option>
                    <option value="Consulting & Auditing">Consulting & Auditing</option>
                    <option value="EdTech & Education">EdTech & Education</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Registered Office Street Address
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Floor 4, Cyber City, Phase 2, DLF CyberHub"
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Organization Super Admin Credentials */}
            <div>
              <div className="flex items-center gap-2 pb-2 mb-4 border-b border-slate-100">
                <User className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  2. Primary Organization Administrator Credentials
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Administrator Full Legal Name *
                  </label>
                  <input
                    type="text"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    required
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Admin Work Email *
                  </label>
                  <input
                    type="email"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="sarah.jenkins@company.com"
                    required
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Master Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full px-3.5 pr-10 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              {/* Password strength */}
              {adminPassword && (
                <div className="mt-3 space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Security Strength:</span>
                    <span className="font-semibold text-slate-700">{strengthLabels[passwordScore]}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 h-1.5">
                    {[1, 2, 3, 4].map((bar) => (
                      <div
                        key={bar}
                        className={`rounded-full transition-colors ${
                          passwordScore >= bar ? strengthColors[passwordScore] : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Terms Consent */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>
                  I certify that I am an authorized executive representative of this legal entity, and I agree to
                  the Platform Compliance Verification & Data Governance Guidelines.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 transition-all disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <span>Submitting Official Dossier for Master Approval...</span>
              ) : (
                <>
                  <span>Submit Organization for Platform Master Review</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Back */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <Link to="/login" className="inline-flex items-center gap-1.5 hover:text-indigo-600">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Portal Sign In</span>
            </Link>
            <span className="text-[11px] text-slate-400">Zero-Trust Multi-Tenant Architecture</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterOrganization;
