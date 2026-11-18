import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Building2,
  Users,
  CalendarCheck2,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Sparkles,
  Eye,
  EyeOff,
  UserCheck,
  Briefcase,
  KeyRound,
} from 'lucide-react';

const PORTALS = {
  admin: {
    id: 'admin',
    name: 'Super Admin Gateway',
    shortName: 'Admin Gateway',
    badge: 'Executive Command Center',
    theme: 'purple',
    accentClass: 'border-purple-600 bg-purple-50/60 text-purple-900',
    btnClass: 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/25',
    icon: ShieldCheck,
    description: 'System policies, departmental configuration, organization analytics & clearance oversight.',
    requiredRole: 'Super Administrator clearance only',
  },
  hr: {
    id: 'hr',
    name: 'HR Operations Portal',
    shortName: 'HR Portal',
    badge: 'People Operations',
    theme: 'indigo',
    accentClass: 'border-indigo-600 bg-indigo-50/60 text-indigo-900',
    btnClass: 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/25',
    icon: Users,
    description: 'Leave approvals, attendance monitoring, employee directory & onboarding management.',
    requiredRole: 'HR Manager authorization only',
  },
  employee: {
    id: 'employee',
    name: 'Employee Self-Service',
    shortName: 'Staff Portal',
    badge: 'Workforce Portal',
    theme: 'emerald',
    accentClass: 'border-emerald-600 bg-emerald-50/60 text-emerald-900',
    btnClass: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25',
    icon: CalendarCheck2,
    description: 'Daily attendance clock-in, leave balances, leave applications, and monthly compensation.',
    requiredRole: 'Company Employee credentials',
  },
};

const Login = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  // Read initial portal from query param or pathname
  const portalParam = searchParams.get('portal');
  const path = location.pathname;
  let initialPortal = 'employee';
  if (path.includes('admin') || portalParam === 'admin') initialPortal = 'admin';
  else if (path.includes('hr') || portalParam === 'hr') initialPortal = 'hr';
  else if (portalParam === 'employee') initialPortal = 'employee';

  const [activePortal, setActivePortal] = useState(initialPortal);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pendingAccount, setPendingAccount] = useState(null);

  // Update URL search param on tab change
  const handlePortalChange = (portalId) => {
    setActivePortal(portalId);
    setError('');
    setPendingAccount(null);
    setSearchParams({ portal: portalId });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPendingAccount(null);

    if (!email || !password) {
      setError('Please provide your corporate email and password');
      return;
    }

    try {
      setLoading(true);
      const loggedUser = await login(email.trim().toLowerCase(), password, activePortal, rememberMe);
      if (loggedUser?.role === 'master') {
        navigate('/organizations', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      const respData = err.response?.data;
      if (respData?.code === 'ACCOUNT_PENDING') {
        setPendingAccount(respData.user || { email, role: activePortal });
      }
      setError(
        respData?.message ||
          err.message ||
          'Failed to sign in. Please verify your credentials and portal access.'
      );
    } finally {
      setLoading(false);
    }
  };

  const portalConfig = PORTALS[activePortal] || PORTALS.employee;
  const PortalIcon = portalConfig.icon;

  return (
    <div className="min-h-screen bg-slate-900 flex">
      {/* Left Column: Enterprise Security Showcase */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-950 text-white relative flex-col justify-between p-12 overflow-hidden border-r border-slate-800">
        {/* Glow */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Top Logo */}
        <div className="relative z-10 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xl shadow-lg shadow-indigo-600/30">
            EP
          </div>
          <div>
            <h2 className="font-bold text-lg tracking-wide text-white">PORTAL HRMS</h2>
            <p className="text-[11px] text-indigo-400 font-semibold tracking-widest uppercase">
              Enterprise Workforce & Governance
            </p>
          </div>
        </div>

        {/* Dynamic Showcase based on Active Portal */}
        <div className="relative z-10 space-y-6 max-w-lg my-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Dedicated Multi-Panel Architecture</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white leading-tight">
            Role-Isolated Access For Secure Enterprise Operations.
          </h1>

          <p className="text-slate-400 text-sm leading-relaxed">
            Strict separation of duties enforced at the API gateway level. Each portal is dedicated to
            its specific business domain with zero cross-tenant credential leakage.
          </p>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 w-fit mb-2">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-semibold text-white">Role Guarding</h4>
              <p className="text-xs text-slate-400 mt-1">Super Admin, HR Manager & Staff role firewalls.</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit mb-2">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-semibold text-white">Zero-Access Isolation</h4>
              <p className="text-xs text-slate-400 mt-1">Quarantined pending status on all self-registrations.</p>
            </div>
          </div>
        </div>

        {/* Bottom Status */}
        <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 pt-6 border-t border-slate-800/80">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Active Session Security • 256-Bit Encryption
          </span>
          <span>Enterprise Portal v2.4</span>
        </div>
      </div>

      {/* Right Column: Portal Login Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-16 xl:px-24 py-12 bg-white overflow-y-auto">
        <div className="w-full max-w-md mx-auto">
          {/* Mobile Top Brand */}
          <div className="lg:hidden flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg">
              EP
            </div>
            <span className="font-bold text-slate-900 tracking-tight">PORTAL HRMS</span>
          </div>

          {/* Portal Switcher Selector Tabs */}
          <div className="mb-6">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
              Select Enterprise Portal:
            </label>
            <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1.5 rounded-2xl">
              {Object.values(PORTALS).map((p) => {
                const isActive = activePortal === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handlePortalChange(p.id)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      isActive
                        ? 'bg-white text-slate-900 shadow-sm'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
                    }`}
                  >
                    <span>{p.shortName}</span>
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isActive
                          ? p.theme === 'purple'
                            ? 'bg-purple-600'
                            : p.theme === 'indigo'
                            ? 'bg-indigo-600'
                            : 'bg-emerald-600'
                          : 'bg-transparent'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Portal Header Card */}
          <div className="mb-6 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  portalConfig.theme === 'purple'
                    ? 'bg-purple-100 text-purple-700'
                    : portalConfig.theme === 'indigo'
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-emerald-100 text-emerald-700'
                }`}
              >
                <PortalIcon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-900">{portalConfig.name}</h3>
                <p className="text-[11px] text-slate-500 line-clamp-1">{portalConfig.description}</p>
              </div>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-500 font-medium">Clearance requirement:</span>
              <span className="font-semibold text-slate-700">{portalConfig.requiredRole}</span>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{error}</p>
                {pendingAccount && (
                  <div className="mt-2 pt-2 border-t border-rose-200/60">
                    <Link
                      to="/pending-approval"
                      state={{ user: pendingAccount }}
                      className="inline-flex items-center gap-1 font-bold underline hover:text-rose-900"
                    >
                      <span>View Zero-Access Status Dossier</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Corporate Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
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
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Option */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                <span>Remember me on this workstation</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white focus:outline-none focus:ring-2 transition-all duration-150 disabled:opacity-60 cursor-pointer ${
                portalConfig.theme === 'purple'
                  ? 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500/20 shadow-md shadow-purple-600/20'
                  : portalConfig.theme === 'indigo'
                  ? 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500/20 shadow-md shadow-indigo-600/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500/20 shadow-md shadow-emerald-600/20'
              }`}
            >
              {loading ? (
                <span>Authenticating Credentials...</span>
              ) : (
                <>
                  <span>Sign In to {portalConfig.shortName}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Account Creation Link for Different Panels */}
          <div className="mt-8 pt-6 border-t border-slate-100 text-center space-y-3">
            <p className="text-xs text-slate-500 font-medium">
              {activePortal === 'admin' ? 'Registering a company or enterprise?' : 'Need access to this portal?'}
            </p>
            {activePortal === 'admin' ? (
              <div className="space-y-2">
                <Link
                  to="/register-organization"
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-xs font-bold text-purple-900 transition-colors shadow-sm"
                >
                  <Building2 className="w-4 h-4 text-purple-700" />
                  <span>Register a New Organization / Company</span>
                  <ArrowRight className="w-3.5 h-3.5 text-purple-500" />
                </Link>
                <p className="text-[11px] text-slate-400">
                  Organizations submit official business verification data for Platform Master approval.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  to={`/register?portal=${activePortal}`}
                  className="inline-flex items-center justify-center gap-2 w-full py-2 px-4 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors"
                >
                  <span>Create Account for {portalConfig.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
                <p className="text-[11px] text-slate-400 italic">
                  Note: Staff registrations are created in Zero-Access Quarantine pending clearance.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
