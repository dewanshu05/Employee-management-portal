import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/common/StatCard';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import api from '../../api/axios';
import { formatDate } from '../../utils/formatters';
import {
  Users,
  CalendarClock,
  Clock,
  UserX,
  UserPlus,
  ArrowUpRight,
  CheckCircle,
  XCircle,
  Building2,
  CalendarCheck,
  ShieldAlert,
} from 'lucide-react';

const HRDashboard = ({ data, onRefresh }) => {
  const { user } = useAuth();
  const { metrics, departmentStats = [], recentLeaves = [], recentPendingEmployees = [] } = data;
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const handleApprove = async (id) => {
    try {
      setActionLoading(true);
      await api.put(`/leaves/${id}/approve`, { remarks: 'Approved by HR Operations' });
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve leave');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectRemarks.trim()) {
      alert('Please provide rejection remarks');
      return;
    }
    try {
      setActionLoading(true);
      await api.put(`/leaves/${selectedLeave._id}/reject`, { remarks: rejectRemarks });
      setRejectModalOpen(false);
      setSelectedLeave(null);
      setRejectRemarks('');
      onRefresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject leave');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold mb-1">
            People Operations & HR Management
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            HR Manager Dashboard
          </h1>
          <p className="text-indigo-200 text-xs sm:text-sm max-w-xl">
            Monitor attendance compliance, process pending employee leave requests, and oversee team operations.
          </p>

          {user?.organization && (
            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs text-indigo-300 font-medium">Organization:</span>
              <span className="text-xs font-bold text-white bg-white/10 px-2.5 py-1 rounded-lg border border-white/10">
                {user.organization.name}
              </span>
              <span className="text-xs text-indigo-300 font-medium ml-2">Official Company Code:</span>
              <span className="text-xs font-mono font-black text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-400/30">
                {user.organization.orgCode || 'ACM-2026'}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(user.organization.orgCode || 'ACM-2026');
                  alert(`Company Code "${user.organization.orgCode || 'ACM-2026'}" copied! Share this with employees for self-registration.`);
                }}
                className="text-xs font-bold text-amber-300 hover:text-amber-200 underline cursor-pointer ml-1"
              >
                Copy Code for Staff Registration
              </button>
            </div>
          )}
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-2.5">
          <Link
            to="/employees/new"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-indigo-900 hover:bg-slate-100 text-xs font-bold transition-all shadow-md"
          >
            <UserPlus className="w-4 h-4" />
            <span>Onboard Employee</span>
          </Link>
          <Link
            to="/leaves/approvals"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-md"
          >
            <CalendarCheck className="w-4 h-4" />
            <span>Pending Approvals</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Workforce"
          value={metrics?.totalEmployees ?? 0}
          subtitle={`${metrics?.activeEmployees ?? 0} Active Accounts`}
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Pending Leave Requests"
          value={metrics?.pendingLeaves ?? 0}
          subtitle="Awaiting HR Review"
          icon={CalendarClock}
          color="amber"
        />
        <StatCard
          title="Present Today"
          value={metrics?.presentToday ?? 0}
          subtitle="Checked In"
          icon={Clock}
          color="emerald"
        />
        <StatCard
          title="Absent / Unmarked"
          value={metrics?.absentToday ?? 0}
          subtitle="No Entry Today"
          icon={UserX}
          color="rose"
        />
      </div>

      {/* Pending Account Approvals Card */}
      {(metrics?.pendingEmployees > 0 || recentPendingEmployees.length > 0) && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-50 border border-amber-300 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-600/30">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  Zero-Access Review Queue ({metrics?.pendingEmployees || recentPendingEmployees.length})
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                  Pending Staff Registrations Awaiting Verification
                </h3>
                <p className="text-xs text-slate-600">
                  New workforce applicants who submitted registration for your company. Assign Employee ID & department to activate.
                </p>
              </div>
            </div>
            <Link
              to="/employees?status=pending"
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <span>Manage Approvals</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {recentPendingEmployees.map((applicant) => (
              <div
                key={applicant._id}
                className="bg-white rounded-2xl border border-amber-200/80 p-4 shadow-xs space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{applicant.name}</h4>
                      <p className="text-[11px] text-slate-500 font-mono truncate">{applicant.email}</p>
                    </div>
                    <Badge variant={applicant.role} size="sm">
                      {applicant.role}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-slate-600 mt-2 space-y-0.5">
                    <p>
                      <strong className="text-slate-700">Designation:</strong> {applicant.designation || 'Pending'}
                    </p>
                    {applicant.phone && (
                      <p>
                        <strong className="text-slate-700">Phone:</strong> {applicant.phone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={async () => {
                      try {
                        await api.patch(`/employees/${applicant._id}/approve`);
                        onRefresh();
                      } catch (err) {
                        alert(err.response?.data?.message || 'Failed to approve');
                      }
                    }}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Quick Approve</span>
                  </button>
                  <Link
                    to="/employees?status=pending"
                    className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                  >
                    Review
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Grid: Pending Approvals & Department Headcount */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Leave Requests (Takes 2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Leave Applications</h3>
              <p className="text-xs text-slate-500">Review, approve, or reject employee leave requests</p>
            </div>
            <Link
              to="/leaves/approvals"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>Manage All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="pb-3 pl-1">Employee</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3">Duration</th>
                  <th className="pb-3">Dates</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 pr-1 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentLeaves.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      No leave requests pending.
                    </td>
                  </tr>
                ) : (
                  recentLeaves.map((leave) => (
                    <tr key={leave._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 pl-1">
                        <div className="flex items-center gap-2.5">
                          {leave.employee?.profileImage ? (
                            <img
                              src={leave.employee.profileImage}
                              alt=""
                              className="w-7 h-7 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center text-[10px]">
                              {leave.employee?.name?.slice(0, 2).toUpperCase() || 'EM'}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 truncate">
                              {leave.employee?.name}
                            </p>
                            <p className="text-[10px] text-slate-400 truncate">
                              {leave.employee?.designation}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 text-slate-600 font-medium">{leave.leaveType}</td>
                      <td className="py-3 text-slate-700 font-semibold">{leave.totalDays} day(s)</td>
                      <td className="py-3 text-slate-500 text-[11px]">
                        {formatDate(leave.startDate, 'MMM dd')} - {formatDate(leave.endDate, 'MMM dd')}
                      </td>
                      <td className="py-3">
                        <Badge variant={leave.status} size="sm">
                          {leave.status}
                        </Badge>
                      </td>
                      <td className="py-3 pr-1 text-right">
                        {leave.status === 'Pending' ? (
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              onClick={() => handleApprove(leave._id)}
                              disabled={actionLoading}
                              className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-semibold text-[11px] transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setSelectedLeave(leave);
                                setRejectModalOpen(true);
                              }}
                              disabled={actionLoading}
                              className="px-2 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 font-semibold text-[11px] transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">Decided</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Department Stats Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Department Overview</h3>
                <p className="text-xs text-slate-500">Employee strength by unit</p>
              </div>
              <Building2 className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-3">
              {departmentStats.map((dept) => (
                <div
                  key={dept.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                >
                  <span className="text-xs font-semibold text-slate-700 truncate">{dept.name}</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                    {dept.totalEmployees} staff
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <Link
              to="/employees"
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
            >
              <span>Explore All Employees</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Reject Remarks Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Leave Request"
        subtitle={`Applicant: ${selectedLeave?.employee?.name || 'Employee'}`}
        footer={
          <>
            <button
              type="button"
              onClick={() => setRejectModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleRejectSubmit}
              disabled={actionLoading}
              className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl disabled:opacity-50"
            >
              {actionLoading ? 'Rejecting...' : 'Reject Application'}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-slate-600">
            Please add remarks explaining the reason for rejection (required for employee records):
          </p>
          <textarea
            value={rejectRemarks}
            onChange={(e) => setRejectRemarks(e.target.value)}
            rows={4}
            required
            placeholder="e.g. Coverage required during audit week; please coordinate alternative dates."
            className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:outline-none"
          />
        </div>
      </Modal>
    </div>
  );
};

export default HRDashboard;
