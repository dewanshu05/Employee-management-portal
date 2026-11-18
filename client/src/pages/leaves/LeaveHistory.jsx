import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Breadcrumb from '../../components/common/Breadcrumb';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { formatDate } from '../../utils/formatters';
import {
  CalendarDays,
  PlusCircle,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Ban,
} from 'lucide-react';

const LeaveHistory = () => {
  const { user, refreshUser } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [balances, setBalances] = useState({});
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedYear, setSelectedYear] = useState('2026');

  // Cancel dialog
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [alertMsg, setAlertMsg] = useState({ text: '', type: '' });

  const fetchLeaveHistory = async () => {
    try {
      setLoading(true);
      const isEmployee = user?.role === 'employee';
      // If employee, fetch `/leaves/my`; if admin/hr, fetch `/leaves` or `/leaves/my`
      const endpoint = isEmployee ? '/leaves/my' : '/leaves';
      const params = {
        status: statusFilter !== 'all' ? statusFilter : undefined,
      };

      const res = await api.get(endpoint, { params });
      if (res.data.success) {
        setLeaves(res.data.leaves || []);
        if (res.data.balances) {
          setBalances(res.data.balances);
        } else if (user?.leaveBalances) {
          setBalances(user.leaveBalances);
        }
      }
    } catch (err) {
      console.error('Failed to load leave history', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveHistory();
  }, [statusFilter]);

  const handleCancelLeave = async () => {
    if (!selectedLeave) return;
    try {
      setCancelLoading(true);
      const res = await api.put(`/leaves/${selectedLeave._id}/cancel`);
      if (res.data.success) {
        setAlertMsg({ text: 'Leave application cancelled successfully', type: 'success' });
        setCancelModalOpen(false);
        setSelectedLeave(null);
        fetchLeaveHistory();
        refreshUser();
      }
    } catch (err) {
      setAlertMsg({
        text: err.response?.data?.message || 'Failed to cancel application',
        type: 'error',
      });
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Leaves' },
          { label: user?.role === 'employee' ? 'My Leave History' : 'All Leave Records' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Leave History & Balances
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Track leave allocations, pending approvals, and historical applications
          </p>
        </div>

        <Link
          to="/leaves/apply"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Apply for Leave</span>
        </Link>
      </div>

      {alertMsg.text && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between gap-2 ${
            alertMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}
        >
          <span>{alertMsg.text}</span>
          <button
            onClick={() => setAlertMsg({ text: '', type: '' })}
            className="text-xs font-bold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Leave Balance Quota Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center">
          <span className="text-xs font-semibold text-slate-500">Casual Leave</span>
          <p className="text-2xl font-black text-indigo-600 my-1">
            {balances?.casual ?? user?.leaveBalances?.casual ?? 0}
          </p>
          <span className="text-[10px] text-slate-400">Total: 12 days/year</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center">
          <span className="text-xs font-semibold text-slate-500">Sick Leave</span>
          <p className="text-2xl font-black text-rose-600 my-1">
            {balances?.sick ?? user?.leaveBalances?.sick ?? 0}
          </p>
          <span className="text-[10px] text-slate-400">Total: 10 days/year</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center">
          <span className="text-xs font-semibold text-slate-500">Earned Leave</span>
          <p className="text-2xl font-black text-emerald-600 my-1">
            {balances?.earned ?? user?.leaveBalances?.earned ?? 0}
          </p>
          <span className="text-[10px] text-slate-400">Total: 15 days/year</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center">
          <span className="text-xs font-semibold text-slate-500">Maternity Leave</span>
          <p className="text-2xl font-black text-purple-600 my-1">
            {balances?.maternity ?? user?.leaveBalances?.maternity ?? 0}
          </p>
          <span className="text-[10px] text-slate-400">Total: 180 days</span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm text-center col-span-2 sm:col-span-1">
          <span className="text-xs font-semibold text-slate-500">Paternity Leave</span>
          <p className="text-2xl font-black text-teal-600 my-1">
            {balances?.paternity ?? user?.leaveBalances?.paternity ?? 0}
          </p>
          <span className="text-[10px] text-slate-400">Total: 15 days</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs">
          {['all', 'Pending', 'Approved', 'Rejected', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st === 'all' ? 'All' : st}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400 font-medium">
          {leaves.length} records shown
        </span>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner label="Loading leave history..." />
        ) : leaves.length === 0 ? (
          <EmptyState
            icon={CalendarDays}
            title="No leave applications found"
            description="You currently have no leave records under this filter."
            actionText="Apply for Leave"
            onAction={() => window.location.assign('/leaves/apply')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  {user?.role !== 'employee' && <th className="py-3.5 px-4">Employee</th>}
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Period</th>
                  <th className="py-3.5 px-4">Days</th>
                  <th className="py-3.5 px-4">Reason</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Decision Notes</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaves.map((leave) => (
                  <tr key={leave._id} className="hover:bg-slate-50/60 transition-colors">
                    {user?.role !== 'employee' && (
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {leave.employee?.name || 'Employee'}
                      </td>
                    )}

                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {leave.leaveType}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                      {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-indigo-600">
                      {leave.totalDays} day(s)
                    </td>

                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-600" title={leave.reason}>
                      {leave.reason}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant={leave.status} size="sm">
                        {leave.status}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 italic max-w-xs truncate" title={leave.remarks}>
                      {leave.remarks ? `"${leave.remarks}"` : '-'}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {leave.status === 'Pending' ? (
                        <button
                          onClick={() => {
                            setSelectedLeave(leave);
                            setCancelModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-rose-600 hover:bg-rose-50 font-semibold text-[11px] transition-colors"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>Cancel Request</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Finalized</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleCancelLeave}
        title="Cancel Leave Application"
        message={`Are you sure you want to withdraw your ${selectedLeave?.leaveType} request for ${selectedLeave?.totalDays} day(s)?`}
        confirmText="Confirm Withdrawal"
        variant="danger"
        loading={cancelLoading}
      />
    </div>
  );
};

export default LeaveHistory;
