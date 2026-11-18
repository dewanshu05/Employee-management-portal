import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Breadcrumb from '../../components/common/Breadcrumb';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, formatTime } from '../../utils/formatters';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Sparkles,
  TrendingUp,
  History,
  Info,
} from 'lucide-react';

const AttendanceTracker = () => {
  const { user } = useAuth();
  const [todayRecord, setTodayRecord] = useState(null);
  const [onLeave, setOnLeave] = useState(false);
  const [leaveDetails, setLeaveDetails] = useState(null);
  const [history, setHistory] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [message, setMessage] = useState({ text: '', type: '' });

  // Live Clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const [todayRes, myRes] = await Promise.all([
        api.get('/attendance/today'),
        api.get('/attendance/my'),
      ]);

      if (todayRes.data.success) {
        setTodayRecord(todayRes.data.attendance);
        setOnLeave(todayRes.data.onLeave);
        setLeaveDetails(todayRes.data.leaveDetails);
      }

      if (myRes.data.success) {
        setHistory(myRes.data.records || []);
        setSummary(myRes.data.summary || {});
      }
    } catch (err) {
      console.error('Failed to load attendance data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceData();
  }, []);

  const handleCheckIn = async () => {
    try {
      setActionLoading(true);
      setMessage({ text: '', type: '' });
      const res = await api.post('/attendance/checkin');
      if (res.data.success) {
        setMessage({
          text: 'Check-in recorded successfully! Shift has begun.',
          type: 'success',
        });
        fetchAttendanceData();
      }
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Check-in failed',
        type: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setActionLoading(true);
      setMessage({ text: '', type: '' });
      const res = await api.put('/attendance/checkout');
      if (res.data.success) {
        setMessage({
          text: res.data.message || 'Check-out successful! Shift logged.',
          type: 'success',
        });
        fetchAttendanceData();
      }
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Check-out failed',
        type: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading attendance status..." />;
  }

  const isCheckedIn = !!todayRecord?.checkIn;
  const isCheckedOut = !!todayRecord?.checkOut;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Breadcrumb
        items={[
          { label: 'Attendance' },
          { label: 'Daily Time Clock & Tracker' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Daily Attendance Clock
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Log your daily check-in and check-out to compute accurate working hours and shifts
          </p>
        </div>
      </div>

      {/* Alerts */}
      {message.text && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
          <button
            onClick={() => setMessage({ text: '', type: '' })}
            className="text-xs font-bold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Hero Time Clock Card */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold">
              <Clock className="w-3.5 h-3.5" />
              <span>Real-Time Biometric Simulator</span>
            </span>

            <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-white">
              {currentTime.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </div>

            <p className="text-slate-300 text-xs sm:text-sm font-medium">
              {currentTime.toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={handleCheckIn}
              disabled={actionLoading || isCheckedIn}
              className="px-6 py-3 rounded-2xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              <span>{isCheckedIn ? 'Checked In' : 'Daily Check In'}</span>
            </button>

            <button
              onClick={handleCheckOut}
              disabled={actionLoading || !isCheckedIn || isCheckedOut}
              className="px-6 py-3 rounded-2xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:hover:bg-slate-800 transition-all border border-slate-700 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              <span>{isCheckedOut ? 'Checked Out' : 'Daily Check Out'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Today Status Breakdown Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Today's Shift Log</h3>
            <p className="text-xs text-slate-500">Automated status criteria applied to your hours</p>
          </div>

          <div>
            {onLeave ? (
              <Badge variant="On Leave" size="lg">
                On Approved Leave Today ({leaveDetails?.leaveType})
              </Badge>
            ) : isCheckedOut ? (
              <Badge variant={todayRecord.status} size="lg">
                {todayRecord.status} • {todayRecord.hoursWorked} hrs recorded
              </Badge>
            ) : isCheckedIn ? (
              <Badge variant="Present" size="lg">
                Shift Active (Checked In)
              </Badge>
            ) : (
              <Badge variant="Absent" size="lg">
                Unmarked Today
              </Badge>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-500 font-medium">Check-In Time</span>
            <p className="text-base font-bold text-slate-900 font-mono mt-1">
              {todayRecord?.checkIn ? formatTime(todayRecord.checkIn) : '--:--'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-500 font-medium">Check-Out Time</span>
            <p className="text-base font-bold text-slate-900 font-mono mt-1">
              {todayRecord?.checkOut ? formatTime(todayRecord.checkOut) : '--:--'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-slate-500 font-medium">Computed Work Hours</span>
            <p className="text-base font-bold text-indigo-600 font-mono mt-1">
              {todayRecord?.hoursWorked ? `${todayRecord.hoursWorked} hrs` : isCheckedIn ? 'In Progress' : '0.00 hrs'}
            </p>
          </div>
        </div>

        {/* Shift Policy Legend */}
        <div className="mt-5 p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100/70 text-slate-600 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="font-semibold text-slate-700">Attendance Policy Guidelines:</span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-[11px]">
            <span>Present: <strong>&gt; 6 hrs</strong></span>
            <span>•</span>
            <span>Half Day: <strong>3 to 6 hrs</strong></span>
            <span>•</span>
            <span>Absent: <strong>&lt; 3 hrs</strong></span>
          </div>
        </div>
      </div>

      {/* Monthly Attendance Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 text-center">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Full Days</span>
          <p className="text-2xl font-black text-emerald-600 my-1">{summary.present ?? 0}</p>
          <span className="text-[10px] text-slate-400">Present</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Half Days</span>
          <p className="text-2xl font-black text-amber-600 my-1">{summary.halfDay ?? 0}</p>
          <span className="text-[10px] text-slate-400">3-6 hrs</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Absent</span>
          <p className="text-2xl font-black text-rose-600 my-1">{summary.absent ?? 0}</p>
          <span className="text-[10px] text-slate-400">No shift</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <span className="text-xs font-semibold text-slate-500">Approved Leaves</span>
          <p className="text-2xl font-black text-blue-600 my-1">{summary.onLeave ?? 0}</p>
          <span className="text-[10px] text-slate-400">Excused</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm col-span-2 sm:col-span-1">
          <span className="text-xs font-semibold text-slate-500">Total Hours</span>
          <p className="text-2xl font-black text-indigo-600 my-1">{summary.totalHours ?? 0}</p>
          <span className="text-[10px] text-slate-400">Hours worked</span>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Attendance Log History</h3>
          <span className="text-xs text-slate-400">{history.length} records logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Check In</th>
                <th className="py-3 px-4">Check Out</th>
                <th className="py-3 px-4">Hours Worked</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {history.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No attendance records logged yet.
                  </td>
                </tr>
              ) : (
                history.slice(0, 15).map((rec) => (
                  <tr key={rec._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 font-mono text-[11px]">
                      {formatDate(rec.date)}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {formatTime(rec.checkIn)}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {formatTime(rec.checkOut)}
                    </td>
                    <td className="py-3 px-4 font-bold font-mono text-indigo-600">
                      {rec.hoursWorked ? `${rec.hoursWorked} hrs` : '--'}
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={rec.status} size="sm">
                        {rec.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-400 italic text-[11px]">
                      {rec.remarks || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendanceTracker;
