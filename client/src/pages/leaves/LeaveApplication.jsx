import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Breadcrumb from '../../components/common/Breadcrumb';
import Badge from '../../components/common/Badge';
import {
  formatDate,
  calculateDaysExcludingWeekends,
} from '../../utils/formatters';
import {
  CalendarDays,
  Clock,
  AlertCircle,
  CheckCircle2,
  CalendarCheck,
  Send,
  Info,
  History,
} from 'lucide-react';

const LEAVE_TYPES = [
  { name: 'Casual Leave', abbr: 'CL', key: 'casual', defaultTotal: 12 },
  { name: 'Sick Leave', abbr: 'SL', key: 'sick', defaultTotal: 10 },
  { name: 'Earned Leave', abbr: 'EL / Privilege Leave', key: 'earned', defaultTotal: 15 },
  { name: 'Maternity Leave', abbr: '26 Weeks Statutory', key: 'maternity', defaultTotal: 180 },
  { name: 'Paternity Leave', abbr: 'PL', key: 'paternity', defaultTotal: 15 },
];

const LeaveApplication = () => {
  const { user, refreshUser } = useAuth();
  const [leaveType, setLeaveType] = useState('Casual Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');
  const [calculatedDays, setCalculatedDays] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [balances, setBalances] = useState({});

  const fetchMyLeaves = async () => {
    try {
      const res = await api.get('/leaves/my');
      if (res.data.success) {
        setRecentLeaves(res.data.leaves.slice(0, 5) || []);
        if (res.data.balances) {
          setBalances(res.data.balances);
        }
      }
    } catch (err) {
      console.error('Failed to load leave history', err);
    }
  };

  useEffect(() => {
    fetchMyLeaves();
  }, []);

  // Recalculate days excluding weekends whenever dates change
  useEffect(() => {
    if (startDate && endDate) {
      const days = calculateDaysExcludingWeekends(startDate, endDate);
      setCalculatedDays(days);
    } else {
      setCalculatedDays(0);
    }
  }, [startDate, endDate]);

  const selectedTypeObj = LEAVE_TYPES.find((t) => t.name === leaveType);
  const availableBalance = selectedTypeObj
    ? balances[selectedTypeObj.key] ?? user?.leaveBalances?.[selectedTypeObj.key] ?? 0
    : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!startDate || !endDate || !reason.trim()) {
      setError('Please provide start date, end date, and reason for leave');
      return;
    }

    if (calculatedDays <= 0) {
      setError('Selected date range contains 0 working days (weekends only)');
      return;
    }

    if (calculatedDays > availableBalance) {
      setError(
        `Requested duration (${calculatedDays} working days) exceeds your remaining ${leaveType} balance (${availableBalance} days)`
      );
      return;
    }

    try {
      setLoading(true);
      const res = await api.post('/leaves', {
        leaveType,
        startDate,
        endDate,
        reason,
      });

      if (res.data.success) {
        setSuccess('Leave application submitted successfully! It is now pending HR approval.');
        setStartDate('');
        setEndDate('');
        setReason('');
        setCalculatedDays(0);
        fetchMyLeaves();
        refreshUser();
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit leave application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Breadcrumb
        items={[
          { label: 'Leaves', to: '/leaves/history' },
          { label: 'Apply for Leave' },
        ]}
      />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Apply for Leave
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Submit leave requests with automated weekend exclusions and balance verification
          </p>
        </div>

        <Link
          to="/leaves/history"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors self-start sm:self-auto"
        >
          <History className="w-4 h-4" />
          <span>View Leave History & Quotas</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Main Grid: Form on Left, Quota & Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Leave Application Form (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5 text-xs">
            {/* Leave Type Select */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Leave Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-medium text-slate-800"
              >
                {LEAVE_TYPES.map((type) => (
                  <option key={type.name} value={type.name}>
                    {type.name} ({type.abbr}) — Available: {balances[type.key] ?? user?.leaveBalances?.[type.key] ?? 0} days
                  </option>
                ))}
              </select>
            </div>

            {/* Date Pickers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Start Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  End Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={endDate}
                  min={startDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
              </div>
            </div>

            {/* Automated Working Days Calculation Notice */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-600">
                <Info className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>
                  Net Working Days <strong className="text-slate-800">(Excluding Saturdays & Sundays)</strong>:
                </span>
              </div>
              <span className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-black text-sm border border-indigo-100">
                {calculatedDays} Day{calculatedDays !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Reason */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Reason for Leave <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={4}
                required
                placeholder="Please state clear details regarding your leave request for management review..."
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || calculatedDays <= 0 || calculatedDays > availableBalance}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-600/20 disabled:opacity-50 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Submitting Application...' : 'Submit Leave Application'}</span>
            </button>
          </form>
        </div>

        {/* Right: Balances & Recent Submissions (1 col) */}
        <div className="space-y-6">
          {/* Balance Preview Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
              <CalendarCheck className="w-4 h-4 text-indigo-600" />
              <span>Available Leave Quotas</span>
            </h3>

            <div className="space-y-2 text-xs">
              {LEAVE_TYPES.map((type) => {
                const bal = balances[type.key] ?? user?.leaveBalances?.[type.key] ?? 0;
                const isSelected = type.name === leaveType;
                return (
                  <div
                    key={type.name}
                    onClick={() => setLeaveType(type.name)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-50/70 border-indigo-300 ring-1 ring-indigo-400'
                        : 'bg-slate-50/50 border-slate-100 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <p className={`font-semibold ${isSelected ? 'text-indigo-900' : 'text-slate-700'}`}>
                        {type.name}
                      </p>
                      <p className="text-[10px] text-slate-400">Quota: {type.defaultTotal} days</p>
                    </div>
                    <span
                      className={`text-sm font-black ${
                        bal > 0 ? 'text-indigo-600' : 'text-rose-500'
                      }`}
                    >
                      {bal} left
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Recent Applications */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Your Recent Applications</h3>
            <div className="space-y-2 text-xs">
              {recentLeaves.length === 0 ? (
                <p className="text-slate-400 text-center py-4 text-[11px]">No recent leave history.</p>
              ) : (
                recentLeaves.slice(0, 3).map((l) => (
                  <div key={l._id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{l.leaveType}</span>
                      <Badge variant={l.status} size="sm">
                        {l.status}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">
                      {formatDate(l.startDate, 'MMM d')} - {formatDate(l.endDate, 'MMM d')} ({l.totalDays}d)
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveApplication;
