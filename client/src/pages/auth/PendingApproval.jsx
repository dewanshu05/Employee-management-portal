import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Clock,
  CheckCircle2,
  Lock,
  ArrowLeft,
  RefreshCw,
  Mail,
  Building2,
  FileText,
  HelpCircle,
} from 'lucide-react';
import api from '../../api/axios';

const PendingApproval = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const pendingUser = location.state?.user || {
    name: 'New Applicant',
    email: 'Pending Account',
    role: 'employee',
    status: 'pending',
  };

  const [checking, setChecking] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const checkStatus = async () => {
    try {
      setChecking(true);
      setStatusMessage('');
      // Attempt to ping auth/login or check status if email is available
      if (pendingUser.email && pendingUser.email !== 'Pending Account') {
        const res = await api.post('/auth/login', {
          email: pendingUser.email,
          password: '___status_probe___',
        }).catch((err) => err.response);

        if (res?.data?.code === 'ACCOUNT_PENDING') {
          setStatusMessage('Your account is still in Zero-Access quarantine awaiting administrator approval.');
        } else if (res?.status === 401) {
          setStatusMessage('Your account has been activated! Please proceed to the login page to sign in.');
        } else {
          setStatusMessage('Status checked: Account remains in approval queue.');
        }
      } else {
        setStatusMessage('Your application is currently active in the approval queue.');
      }
    } catch (e) {
      setStatusMessage('Status checked: Still pending administrative verification.');
    } finally {
      setChecking(false);
    }
  };

  const roleLabel = {
    admin: 'Super Admin Gateway',
    hr: 'HR Operations Portal',
    employee: 'Employee Self-Service Portal',
  }[pendingUser.role] || 'Portal Account';

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 sm:px-6 py-12 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10 text-white">
        {/* Top Header Badge */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-700/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-lg">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white tracking-wide">PORTAL HRMS</h2>
              <p className="text-[11px] font-semibold text-amber-400 tracking-wider uppercase">
                Zero-Access Security Quarantine
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Pending Approval
          </span>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Account Registered Successfully
            </h1>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              In adherence with enterprise Zero-Trust policy, newly registered accounts are isolated with{' '}
              <strong className="text-amber-300 font-semibold">zero system privileges</strong> until an authorized
              organization administrator verifies your credentials.
            </p>
          </div>

          {/* User Dossier Card */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700/60 space-y-3">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Registration Dossier
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-slate-500 block">Registered Name:</span>
                <span className="font-semibold text-white text-sm">{pendingUser.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Corporate Email:</span>
                <span className="font-semibold text-white text-sm">{pendingUser.email}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Target Clearance:</span>
                <span className="font-semibold text-indigo-400">{roleLabel}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Access Status:</span>
                <span className="font-semibold text-amber-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Zero Access (Quarantined)
                </span>
              </div>
            </div>
          </div>

          {/* Verification Lifecycle Timeline */}
          <div className="space-y-3 pt-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Clearance Workflow
            </div>

            <div className="space-y-2.5">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-700/30 border border-slate-700/50">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-semibold text-white">Stage 1: Identity Profile Created</span>
                  <p className="text-slate-400 text-[11px] mt-0.5">Registration information securely stored in database.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5 animate-spin" />
                <div className="text-xs">
                  <span className="font-semibold text-amber-300">Stage 2: Administrative Review & Approval</span>
                  <p className="text-slate-300 text-[11px] mt-0.5">HR Manager or Super Admin must review and grant access.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-700/20 border border-slate-700/40 opacity-70">
                <Lock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-semibold text-slate-400">Stage 3: Portal Clearance & Role Activation</span>
                  <p className="text-slate-500 text-[11px] mt-0.5">Dashboard, attendance, and leave management features unlocked.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Message feedback */}
          {statusMessage && (
            <div className="p-3.5 rounded-xl bg-indigo-950/60 border border-indigo-500/40 text-indigo-300 text-xs">
              {statusMessage}
            </div>
          )}

          {/* Actions */}
          <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
            <button
              type="button"
              onClick={checkStatus}
              disabled={checking}
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-slate-700 hover:bg-slate-600 border border-slate-600 flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
              <span>{checking ? 'Querying Status...' : 'Check Approval Status'}</span>
            </button>

            <Link
              to="/login"
              className="w-full sm:flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Portal Sign In</span>
            </Link>
          </div>
        </div>

        {/* Footer Support */}
        <div className="mt-8 pt-6 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500">
          <span>Enterprise Portal HRMS</span>
          <span className="flex items-center gap-1 text-slate-400">
            <HelpCircle className="w-3.5 h-3.5" />
            Contact IT / HR for priority clearance
          </span>
        </div>
      </div>
    </div>
  );
};

export default PendingApproval;
