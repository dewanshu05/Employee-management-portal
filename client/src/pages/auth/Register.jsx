import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import {
  Lock,
  Mail,
  User,
  Building2,
  Shield,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  KeyRound,
  Phone,
  Briefcase,
  Users,
  ChevronRight,
} from 'lucide-react';

const PORTAL_CONFIG = {
  employee: {
    id: 'employee',
    title: 'Employee Portal',
    badge: 'Staff Self-Service',
    description: 'Attendance clocking, leave requests, and personal compensation',
    accentColor: 'emerald',
    badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    btnClass: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20',
  },
  hr: {
    id: 'hr',
    title: 'HR Operations Portal',
    badge: 'People & Operations',
    description: 'Leave approvals, attendance audits, and staff management',
    accentColor: 'indigo',
    badgeClass: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    btnClass: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/20',
  },
  admin: {
    id: 'admin',
    title: 'Super Admin Gateway',
    badge: 'Executive Command',
    description: 'System policies, organization oversight, and user clearance',
    accentColor: 'purple',
    badgeClass: 'bg-purple-500/10 text-purple-400 border-purple-500/30',
    btnClass: 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/20',
  },
};

const Register = () => {
  const [searchParams] = useSearchParams();
  const initialPortal = searchParams.get('portal') || 'employee';

  const [portal, setPortal] = useState(
    ['admin', 'hr', 'employee'].includes(initialPortal) ? initialPortal : 'employee'
  );
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phone, setPhone] = useState('');
  const [designation, setDesignation] = useState('');
  const [department, setDepartment] = useState('');
  const [registrationKey, setRegistrationKey] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Multi-Tenant Company Organization state
  const [organizations, setOrganizations] = useState([]);
  const [selectedOrg, setSelectedOrg] = useState('');
  const [manualOrgCode, setManualOrgCode] = useState('');
  const [useManualCode, setUseManualCode] = useState(false);

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  // 1. Fetch Active Registered Organizations
  useEffect(() => {
    const fetchOrgs = async () => {
      try {
        const res = await api.get('/organizations/public', { _skipAuthRedirect: true });
        if (res.data.success && res.data.organizations?.length > 0) {
          setOrganizations(res.data.organizations);
          // If only 1 organization is active, auto-select it for seamless convenience
          if (res.data.organizations.length === 1) {
            setSelectedOrg(res.data.organizations[0]._id);
          }
        }
      } catch (e) {
        console.warn('Could not load organizations:', e.message);
      }
    };
    fetchOrgs();
  }, []);

  // 2. Fetch Departments scoped to the selected Organization
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const orgParam = selectedOrg ? `?organization=${selectedOrg}` : '';
        const res = await api.get(`/departments/public${orgParam}`, { _skipAuthRedirect: true });
        if (res.data.success) {
          setDepartments(res.data.departments || []);
        }
      } catch (e) {
        // Fallback silently
      }
    };
    fetchDepartments();
  }, [selectedOrg]);

  // Password strength calculation
  const getPasswordStrength = () => {
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const passwordScore = getPasswordStrength();
  const strengthLabels = ['Too Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = [
    'bg-slate-300',
    'bg-rose-500',
    'bg-amber-500',
    'bg-blue-500',
    'bg-emerald-500',
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide your full legal name');
      return;
    }

    if (!email.trim()) {
      setError('Please provide your corporate email address');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const finalOrg = useManualCode ? manualOrgCode.trim().toUpperCase() : selectedOrg;
    if (!finalOrg) {
      setError('Please select your Employer / Organization from the list or enter your Company Code (e.g. ACM-2026)');
      return;
    }

    if (!agreeTerms) {
      setError('Please agree to the Enterprise Acceptable Use & Security Policy');
      return;
    }

    try {
      setLoading(true);
      const res = await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        role: portal,
        portal,
        organization: finalOrg,
        orgCode: finalOrg,
        phone: phone.trim(),
        designation: designation.trim() || undefined,
        department: department || undefined,
        registrationKey: registrationKey.trim() || undefined,
      });

      if (res.isPending) {
        navigate('/pending-approval', {
          replace: true,
          state: {
            user: {
              name,
              email,
              role: portal,
              status: 'pending',
            },
          },
        });
      } else {
        navigate('/login', {
          replace: true,
          state: { message: 'Registration approved! You can now log into your portal.' },
        });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Failed to complete registration. Please check your inputs.'
      );
    } finally {
      setLoading(false);
    }
  };

  const currentPortalConfig = PORTAL_CONFIG[portal] || PORTAL_CONFIG.employee;

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Left Column: Security & Enterprise Architecture */}
      <div className="hidden lg:flex lg:w-5/12 bg-slate-950 text-white relative flex-col justify-between p-12 border-r border-slate-800">
        {/* Glow */}
        <div className="absolute top-10 left-10 w-80 h-80 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-600/30">
            EP
          </div>
          <div>
            <h2 className="font-bold text-lg text-white tracking-wide">PORTAL HRMS</h2>
            <p className="text-[11px] text-indigo-400 font-semibold uppercase tracking-widest">
              Enterprise Access Onboarding
            </p>
          </div>
        </div>

        {/* Zero-Access Callout */}
        <div className="relative z-10 space-y-6 my-auto">
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-amber-500/30 shadow-xl space-y-3">
            <div className="flex items-center gap-2 text-amber-400">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span className="font-bold text-sm tracking-wide">Zero-Access Architecture</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every self-registered account is initially quarantined in a <strong>Zero-Access</strong> state.
              Unauthorized access to company records, salary schedules, and internal applications is physically
              blocked until an authorized administrator verifies and approves your profile.
            </p>
            <div className="text-[11px] text-slate-400 border-t border-slate-800 pt-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Strict Role-Based Access Control (RBAC)</span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
              Onboarding Process
            </h3>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Select your designated operational portal (Staff, HR, or Executive)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Account created in quarantined state with zero access permissions</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Administrator activates privileges & allocates leave quotas</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="relative z-10 text-xs text-slate-500 border-t border-slate-800 pt-4 flex items-center justify-between">
          <span>Enterprise Security Protocol v2.4</span>
          <span>Encrypted with 256-bit AES</span>
        </div>
      </div>

      {/* Right Column: Registration Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-20 py-12 bg-white overflow-y-auto">
        <div className="w-full max-w-xl mx-auto">
          {/* Mobile Brand */}
          <div className="lg:hidden flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              EP
            </div>
            <span className="font-bold text-slate-900">PORTAL HRMS</span>
          </div>

          <div className="mb-6">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Create Enterprise Account
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Select your required portal and submit your registration for approval
            </p>
          </div>

          {/* Portal Switcher Tabs */}
          <div className="mb-6">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Target Portal & Privilege Level:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(PORTAL_CONFIG).map((cfg) => {
                const isSelected = portal === cfg.id;
                return (
                  <button
                    key={cfg.id}
                    type="button"
                    onClick={() => setPortal(cfg.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-slate-900">{cfg.title}</span>
                      {isSelected && <span className="w-2 h-2 rounded-full bg-indigo-600" />}
                    </div>
                    <p className="text-[10px] text-slate-500 line-clamp-1">{cfg.badge}</p>
                  </button>
                );
              })}
            </div>

            {/* Selected Portal Summary Banner */}
            <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
              <span className="text-slate-600">
                Applying for: <strong className="text-slate-900">{currentPortalConfig.title}</strong>
              </span>
              <span className="text-[11px] font-semibold text-amber-600 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> Requires Admin Review
              </span>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">{error}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Super Admin Company Onboarding Prompt */}
            {portal === 'admin' && (
              <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 text-xs flex items-start justify-between gap-3 shadow-xs">
                <div>
                  <h4 className="font-bold">Are you the Founder / Executive creating a new company?</h4>
                  <p className="text-[11px] text-purple-700 mt-0.5">
                    To register a new enterprise workspace and generate your official Company Code, proceed to Company Registration.
                  </p>
                </div>
                <Link
                  to="/register-organization"
                  className="px-3 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-[11px] font-bold shrink-0 self-center transition-colors"
                >
                  Register Company
                </Link>
              </div>
            )}

            {/* Organization / Employer Selection */}
            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  Your Organization / Employer *
                </label>
                <button
                  type="button"
                  onClick={() => setUseManualCode(!useManualCode)}
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                >
                  {useManualCode ? 'Choose from registered list' : 'Have a Company Code?'}
                </button>
              </div>

              {!useManualCode ? (
                <div>
                  <select
                    value={selectedOrg}
                    onChange={(e) => {
                      const orgId = e.target.value;
                      setSelectedOrg(orgId);
                      const found = organizations.find((o) => o._id === orgId);
                      if (found?.orgCode) setManualOrgCode(found.orgCode);
                    }}
                    required
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium text-slate-800"
                  >
                    <option value="">-- Select Registered Company / Employer --</option>
                    {organizations.map((org) => (
                      <option key={org._id} value={org._id}>
                        {org.name} (Company Code: {org.orgCode || 'ORG'}) • {org.city || 'India'}, {org.state || ''}
                      </option>
                    ))}
                  </select>

                  {selectedOrg && (
                    <div className="mt-2.5 p-2.5 rounded-xl bg-white border border-indigo-200 flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">
                        Selected: <strong className="text-slate-900">{organizations.find((o) => o._id === selectedOrg)?.name}</strong>
                      </span>
                      <span className="font-mono font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-lg text-[11px]">
                        Company Code: {organizations.find((o) => o._id === selectedOrg)?.orgCode || 'ACM-2026'}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    value={manualOrgCode}
                    onChange={(e) => {
                      const code = e.target.value;
                      setManualOrgCode(code);
                      const match = organizations.find(
                        (o) => o.orgCode?.toUpperCase() === code.trim().toUpperCase()
                      );
                      if (match) setSelectedOrg(match._id);
                    }}
                    placeholder="Enter Company Code (e.g. ACM-2026)"
                    required
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-indigo-300 rounded-xl uppercase font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Ask your company HR or System Administrator for your official Organization Code (e.g. ACM-2026).
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between text-[11px] pt-2 border-t border-indigo-100">
                <span className="text-slate-500">Don&apos;t have a registered company yet?</span>
                <Link
                  to="/register-organization"
                  className="font-bold text-indigo-700 hover:text-indigo-900 underline flex items-center gap-1"
                >
                  <span>Register Company & Get Company Code</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              <p className="text-[11px] text-slate-500">
                🛡️ Zero-Access Governance: Your registration application will be sent directly to your organization&apos;s Administrator & HR team for identity verification and Employee ID assignment.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Legal Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Jane Doe"
                    required
                    className="w-full pl-10 pr-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Corporate Email *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane.doe@company.com"
                    required
                    className="w-full pl-10 pr-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-10 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
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
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>
            </div>

            {/* Password Strength Indicator */}
            {password && (
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Proposed Designation (Optional)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={designation}
                    onChange={(e) => setDesignation(e.target.value)}
                    placeholder="e.g. Software Engineer"
                    className="w-full pl-10 pr-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Department (Optional)
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                >
                  <option value="">-- Unassigned / To be Assigned --</option>
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Optional Registration Key for elevated roles */}
            {(portal === 'admin' || portal === 'hr') && (
              <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                    Enterprise Authorization Key (Optional)
                  </label>
                  <span className="text-[10px] text-amber-700 font-medium">Bypasses queue</span>
                </div>
                <input
                  type="password"
                  value={registrationKey}
                  onChange={(e) => setRegistrationKey(e.target.value)}
                  placeholder="Enter corporate key if issued by IT leadership"
                  className="w-full px-3 py-1.5 text-xs bg-white border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
                <p className="text-[10px] text-amber-700">
                  Leave blank to submit for manual administrative approval in Zero-Access quarantine.
                </p>
              </div>
            )}

            {/* Terms checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-2.5 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>
                  I understand that newly created accounts are isolated in Zero-Access status pending identity
                  verification, and I agree to the Enterprise Acceptable Use & Privacy Policy.
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-3 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-md shadow-indigo-600/20 transition-all disabled:opacity-60 cursor-pointer"
            >
              {loading ? (
                <span>Submitting Registration Dossier...</span>
              ) : (
                <>
                  <span>Submit for Portal Approval</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Back to Login */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            <span>Already have an approved account? </span>
            <Link
              to={`/login?portal=${portal}`}
              className="font-semibold text-indigo-600 hover:text-indigo-700 underline"
            >
              Sign In to {currentPortalConfig.title}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
