import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import api from '../../api/axios';
import { formatDate, formatTime } from '../../utils/formatters';
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Briefcase,
  ChevronRight,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

const EmployeeDashboard = ({ data, onRefresh }) => {
  const { employee, todayAttendance, pendingLeaves, recentLeaves = [], monthlySummary } = data;
  const [checkingIn, setCheckingIn] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const record = todayAttendance?.record;
  const onLeave = todayAttendance?.onLeave;

  const handleCheckIn = async () => {
    try {
      setErrorMsg('');
      setSuccessMsg('');
      setCheckingIn(true);
      const res = await api.post('/attendance/checkin');
      setSuccessMsg('Check-in successful! Have a productive day.');
      onRefresh();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Check-in failed');
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setErrorMsg('');
      setSuccessMsg('');
      setCheckingOut(true);
      const res = await api.put('/attendance/checkout');
      setSuccessMsg(res.data.message || 'Check-out successful! Good job today.');
      onRefresh();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Check-out failed');
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Welcome back</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Hello, {employee?.name}!
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm">
            {employee?.designation} • {employee?.department} Department
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <Link
            to="/leaves/apply"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30"
          >
            <CalendarDays className="w-4 h-4" />
            <span>Apply for Leave</span>
          </Link>
          <Link
            to="/payroll"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 text-xs font-semibold transition-all backdrop-blur-sm"
          >
            <Briefcase className="w-4 h-4" />
            <span>Payslip Overview</span>
          </Link>
        </div>
      </div>

      {/* Alert Messages */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Today Attendance & Action Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Today's Attendance Status
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </h3>
          </div>

          <div>
            {onLeave ? (
              <Badge variant="On Leave" size="lg">
                On Approved Leave Today
              </Badge>
            ) : record?.checkOut ? (
              <Badge variant={record.status} size="lg">
                Checked Out • {record.status} ({record.hoursWorked} hrs)
              </Badge>
            ) : record?.checkIn ? (
              <Badge variant="Present" size="lg">
                Checked In • Active Shift
              </Badge>
            ) : (
              <Badge variant="Absent" size="lg">
                Not Checked In Yet
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-5">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-xs text-slate-500 font-medium">Check-In Time</p>
            <p className="text-lg font-bold text-slate-900 mt-1 font-mono">
              {record?.checkIn ? formatTime(record.checkIn) : '--:--'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-xs text-slate-500 font-medium">Check-Out Time</p>
            <p className="text-lg font-bold text-slate-900 mt-1 font-mono">
              {record?.checkOut ? formatTime(record.checkOut) : '--:--'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-xs text-slate-500 font-medium">Hours Logged Today</p>
            <p className="text-lg font-bold text-indigo-600 mt-1 font-mono">
              {record?.hoursWorked ? `${record.hoursWorked} hrs` : record?.checkIn ? 'In Progress' : '0 hrs'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            onClick={handleCheckIn}
            disabled={checkingIn || !!record?.checkIn}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-all shadow-sm cursor-pointer"
          >
            <Clock className="w-4 h-4" />
            <span>{checkingIn ? 'Checking in...' : record?.checkIn ? 'Checked In' : 'Check In Now'}</span>
          </button>

          <button
            onClick={handleCheckOut}
            disabled={checkingOut || !record?.checkIn || !!record?.checkOut}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 disabled:opacity-50 transition-all shadow-sm cursor-pointer"
          >
            <Clock className="w-4 h-4" />
            <span>{checkingOut ? 'Checking out...' : record?.checkOut ? 'Checked Out' : 'Check Out'}</span>
          </button>

          <Link
            to="/attendance/track"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 ml-auto"
          >
            <span>View Full Attendance Calendar</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Leave Balances Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900">Remaining Leave Balances</h3>
          <Link
            to="/leaves/history"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Leave Policy Details
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center">
            <span className="text-xs font-medium text-slate-500">Casual Leave</span>
            <p className="text-2xl font-black text-indigo-600 my-1">
              {employee?.leaveBalances?.casual ?? 0}
            </p>
            <span className="text-[10px] text-slate-400">Total: 12 days/yr</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center">
            <span className="text-xs font-medium text-slate-500">Sick Leave</span>
            <p className="text-2xl font-black text-rose-600 my-1">
              {employee?.leaveBalances?.sick ?? 0}
            </p>
            <span className="text-[10px] text-slate-400">Total: 10 days/yr</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center">
            <span className="text-xs font-medium text-slate-500">Earned Leave</span>
            <p className="text-2xl font-black text-emerald-600 my-1">
              {employee?.leaveBalances?.earned ?? 0}
            </p>
            <span className="text-[10px] text-slate-400">Total: 15 days/yr</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center">
            <span className="text-xs font-medium text-slate-500">Maternity Leave</span>
            <p className="text-2xl font-black text-purple-600 my-1">
              {employee?.leaveBalances?.maternity ?? 0}
            </p>
            <span className="text-[10px] text-slate-400">Total: 180 days</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center col-span-2 sm:col-span-1">
            <span className="text-xs font-medium text-slate-500">Paternity Leave</span>
            <p className="text-2xl font-black text-teal-600 my-1">
              {employee?.leaveBalances?.paternity ?? 0}
            </p>
            <span className="text-[10px] text-slate-400">Total: 15 days</span>
          </div>
        </div>
      </div>

      {/* Monthly Summary & Recent Leaves */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Attendance Summary */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            {monthlySummary?.currentMonthName || 'Monthly'} Attendance Summary
          </h3>
          <p className="text-xs text-slate-500 mb-4">Summary of recorded activity this month</p>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 text-emerald-800">
              <span className="font-semibold">Days Present</span>
              <span className="font-bold text-sm">{monthlySummary?.present ?? 0}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 text-amber-800">
              <span className="font-semibold">Half Days</span>
              <span className="font-bold text-sm">{monthlySummary?.halfDay ?? 0}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50 text-blue-800">
              <span className="font-semibold">Approved Leaves</span>
              <span className="font-bold text-sm">{monthlySummary?.onLeave ?? 0}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50 text-rose-800">
              <span className="font-semibold">Absent Days</span>
              <span className="font-bold text-sm">{monthlySummary?.absent ?? 0}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 text-slate-800 font-bold">
              <span>Total Work Hours</span>
              <span className="font-bold text-sm">{monthlySummary?.totalHours ?? 0} hrs</span>
            </div>
          </div>
        </div>

        {/* Recent Leave History */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recent Leave Requests</h3>
                <p className="text-xs text-slate-500">Your latest submitted leave applications</p>
              </div>
              <Link
                to="/leaves/history"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                All Applications
              </Link>
            </div>

            <div className="space-y-3">
              {recentLeaves.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  You have not submitted any leave applications yet.
                </p>
              ) : (
                recentLeaves.map((leave) => (
                  <div
                    key={leave._id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800">{leave.leaveType}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-600 font-semibold">{leave.totalDays} day(s)</span>
                      </div>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        {formatDate(leave.startDate)} to {formatDate(leave.endDate)}
                      </p>
                      {leave.remarks && (
                        <p className="text-[10px] text-slate-400 mt-0.5 italic">
                          Remarks: "{leave.remarks}"
                        </p>
                      )}
                    </div>

                    <div className="shrink-0">
                      <Badge variant={leave.status} size="sm">
                        {leave.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <Link
              to="/leaves/apply"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <span>Apply for New Leave</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
