import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Breadcrumb from '../../components/common/Breadcrumb';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { formatDate, formatTime, formatCurrency } from '../../utils/formatters';
import {
  User,
  Mail,
  Phone,
  Building2,
  Calendar,
  DollarSign,
  Edit2,
  ArrowLeft,
  Clock,
  CalendarDays,
  ShieldCheck,
} from 'lucide-react';

const EmployeeDetails = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [employee, setEmployee] = useState(null);
  const [recentLeaves, setRecentLeaves] = useState([]);
  const [recentAttendance, setRecentAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEmployeeDetails = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/employees/${id}`);
        if (res.data.success) {
          setEmployee(res.data.employee);
          setRecentLeaves(res.data.recentLeaves || []);
          setRecentAttendance(res.data.recentAttendance || []);
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load employee details');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployeeDetails();
  }, [id]);

  if (loading) {
    return <LoadingSpinner label="Loading employee file..." />;
  }

  if (error || !employee) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-rose-200">
        <p className="text-sm font-semibold text-rose-600 mb-2">{error || 'Employee not found'}</p>
        <Link
          to="/employees"
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Directory</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Breadcrumb
        items={[
          { label: 'Employees', to: '/employees' },
          { label: employee.name },
        ]}
      />

      {/* Top Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {employee.profileImage ? (
            <img
              src={employee.profileImage}
              alt={employee.name}
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-indigo-50 shadow-md"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-indigo-600/30">
              {employee.name?.slice(0, 2).toUpperCase() || 'EM'}
            </div>
          )}

          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {employee.name}
              </h1>
              {employee.employeeId && (
                <span className="px-2 py-0.5 rounded-lg text-xs font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
                  {employee.employeeId}
                </span>
              )}
              <Badge variant={employee.role} size="sm">
                {employee.role === 'admin'
                  ? 'Super Admin'
                  : employee.role === 'hr'
                  ? 'HR Manager'
                  : 'Employee'}
              </Badge>
              <Badge variant={employee.status} size="sm">
                {employee.status}
              </Badge>
            </div>
            <p className="text-sm font-medium text-slate-600">
              {employee.designation} • {employee.department?.name || 'General Department'}
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                {employee.email}
              </span>
              {employee.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {employee.phone}
                </span>
              )}
            </div>
          </div>
        </div>

        {currentUser?.role !== 'employee' && (
          <div className="flex items-center gap-2.5">
            <Link
              to={`/employees/${employee._id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 transition-all"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </Link>
          </div>
        )}
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Department</p>
            <p className="text-sm font-bold text-slate-900 mt-0.5">
              {employee.department?.name || 'Unassigned'}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Joining Date</p>
            <p className="text-sm font-bold text-slate-900 mt-0.5">
              {formatDate(employee.joiningDate)}
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-purple-50 text-purple-600 font-bold text-lg">
            ₹
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Compensation / CTC</p>
            <p className="text-sm font-bold text-slate-900 mt-0.5">
              {currentUser?.role === 'employee' && currentUser?._id !== employee._id
                ? '••••••'
                : formatCurrency(employee.salary)}
            </p>
          </div>
        </div>
      </div>

      {/* Indian Statutory Compliance Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
          <span>Indian Statutory Compliance & Payroll Records</span>
          <span className="text-[11px] font-normal text-slate-400">PAN, EPFO & Bank Remittance</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-medium text-slate-400">Income Tax PAN</span>
            <p className="font-mono font-bold text-slate-800 mt-0.5">
              {employee.pan || 'Not Provided'}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-medium text-slate-400">Aadhaar No.</span>
            <p className="font-mono font-bold text-slate-800 mt-0.5">
              {employee.aadhaar ? `•••• •••• ${employee.aadhaar.slice(-4)}` : 'Not Provided'}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-medium text-slate-400">EPFO UAN</span>
            <p className="font-mono font-bold text-slate-800 mt-0.5">
              {employee.uan || 'Not Provided'}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-medium text-slate-400">Bank Account</span>
            <p className="font-mono font-bold text-slate-800 mt-0.5">
              {employee.bankAccount ? `•••• ${employee.bankAccount.slice(-4)}` : 'Not Provided'}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
            <span className="text-[11px] font-medium text-slate-400">Bank IFSC</span>
            <p className="font-mono font-bold text-slate-800 mt-0.5">
              {employee.ifsc || 'Not Provided'}
            </p>
          </div>
        </div>
      </div>

      {/* Leave Balances Grid */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Current Leave Balance Quotas</h3>
            <p className="text-xs text-slate-500">Available annual leave allocations</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 text-center">
          <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100">
            <span className="text-xs font-semibold text-slate-600">Casual Leave</span>
            <p className="text-2xl font-black text-indigo-600 my-1">
              {employee.leaveBalances?.casual ?? 0}
            </p>
            <span className="text-[10px] text-slate-400">Days Remaining</span>
          </div>

          <div className="p-4 rounded-xl bg-rose-50/50 border border-rose-100">
            <span className="text-xs font-semibold text-slate-600">Sick Leave</span>
            <p className="text-2xl font-black text-rose-600 my-1">
              {employee.leaveBalances?.sick ?? 0}
            </p>
            <span className="text-[10px] text-slate-400">Days Remaining</span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
            <span className="text-xs font-semibold text-slate-600">Earned Leave</span>
            <p className="text-2xl font-black text-emerald-600 my-1">
              {employee.leaveBalances?.earned ?? 0}
            </p>
            <span className="text-[10px] text-slate-400">Days Remaining</span>
          </div>

          <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100">
            <span className="text-xs font-semibold text-slate-600">Maternity Leave</span>
            <p className="text-2xl font-black text-purple-600 my-1">
              {employee.leaveBalances?.maternity ?? 0}
            </p>
            <span className="text-[10px] text-slate-400">Days Remaining</span>
          </div>

          <div className="p-4 rounded-xl bg-teal-50/50 border border-teal-100 col-span-2 sm:col-span-1">
            <span className="text-xs font-semibold text-slate-600">Paternity Leave</span>
            <p className="text-2xl font-black text-teal-600 my-1">
              {employee.leaveBalances?.paternity ?? 0}
            </p>
            <span className="text-[10px] text-slate-400">Days Remaining</span>
          </div>
        </div>
      </div>

      {/* Two Column Section: Recent Attendance & Recent Leaves */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Attendance */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Recent Attendance Records</span>
            </h3>
          </div>

          <div className="space-y-2.5">
            {recentAttendance.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No attendance recorded</p>
            ) : (
              recentAttendance.map((rec) => (
                <div
                  key={rec._id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-slate-800">{formatDate(rec.date)}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      In: {formatTime(rec.checkIn)} • Out: {formatTime(rec.checkOut)}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge variant={rec.status} size="sm">
                      {rec.status}
                    </Badge>
                    <p className="text-[10px] text-slate-400 mt-0.5 font-mono">
                      {rec.hoursWorked ? `${rec.hoursWorked} hrs` : '--'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Leaves */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-indigo-600" />
              <span>Recent Leave Applications</span>
            </h3>
          </div>

          <div className="space-y-2.5">
            {recentLeaves.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No leave applications</p>
            ) : (
              recentLeaves.map((leave) => (
                <div
                  key={leave._id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-slate-800 truncate">{leave.leaveType}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {formatDate(leave.startDate)} to {formatDate(leave.endDate)} ({leave.totalDays}d)
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <Badge variant={leave.status} size="sm">
                      {leave.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeDetails;
