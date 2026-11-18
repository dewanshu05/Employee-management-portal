import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/common/StatCard';
import BarChart from '../../components/charts/BarChart';
import LineChart from '../../components/charts/LineChart';
import PieChart from '../../components/charts/PieChart';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import api from '../../api/axios';
import { formatDate } from '../../utils/formatters';
import {
  Users,
  UserCheck,
  Building2,
  CalendarClock,
  Clock,
  UserX,
  ArrowUpRight,
  PlusCircle,
  BarChart2,
  CheckCircle,
  XCircle,
  FileText,
  ShieldAlert,
} from 'lucide-react';

const SuperAdminDashboard = ({ data, onRefresh }) => {
  const { user } = useAuth();
  const { metrics, charts, recentLeaves = [], recentPendingEmployees = [] } = data;
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Prepare Chart 1: Department Distribution Bar Chart
  const deptLabels = charts?.departmentDistribution?.map((d) => d.name) || [];
  const deptCounts = charts?.departmentDistribution?.map((d) => d.count) || [];

  const deptBarData = {
    labels: deptLabels,
    datasets: [
      {
        label: 'Employees',
        data: deptCounts,
        backgroundColor: '#6366f1',
        borderRadius: 8,
        hoverBackgroundColor: '#4f46e5',
      },
    ],
  };

  // Prepare Chart 2: Monthly Attendance Trends Line Chart
  const trendMonths = charts?.monthlyTrends?.map((m) => m.month) || [];
  const trendPresent = charts?.monthlyTrends?.map((m) => m.present) || [];
  const trendLeaves = charts?.monthlyTrends?.map((m) => m.leaves) || [];

  const trendLineData = {
    labels: trendMonths,
    datasets: [
      {
        label: 'Present Records',
        data: trendPresent,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#10b981',
      },
      {
        label: 'Approved Leaves',
        data: trendLeaves,
        borderColor: '#f59e0b',
        backgroundColor: 'rgba(245, 158, 11, 0.05)',
        tension: 0.35,
        fill: true,
        pointBackgroundColor: '#f59e0b',
      },
    ],
  };

  // Prepare Chart 3: Leave Type Distribution Doughnut Chart
  const leaveLabels = Object.keys(charts?.leaveDistribution || {});
  const leaveValues = Object.values(charts?.leaveDistribution || {});

  const leavePieData = {
    labels: leaveLabels,
    datasets: [
      {
        data: leaveValues,
        backgroundColor: [
          '#6366f1', // Casual
          '#ec4899', // Sick
          '#3b82f6', // Earned
          '#8b5cf6', // Maternity
          '#14b8a6', // Paternity
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const handleApprove = async (id) => {
    try {
      setActionLoading(true);
      await api.put(`/leaves/${id}/approve`, { remarks: 'Approved by Super Admin' });
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
      alert('Please enter a rejection remark');
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
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-1">
            Super Administrator Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Organization Command Center
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
            Real-time analytics, organizational attendance, department distribution, and global policy controls.
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
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Employee</span>
          </Link>
          <Link
            to="/reports"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/10 text-xs font-semibold transition-all backdrop-blur-sm"
          >
            <BarChart2 className="w-4 h-4" />
            <span>View Reports</span>
          </Link>
        </div>
      </div>

      {/* Onboarding Welcome Callout for Fresh Organizations */}
      {metrics?.totalEmployees === 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-6 text-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h3 className="text-base font-bold text-slate-900">Your Organization Workspace is Live!</h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 max-w-xl">
              Your company profile and official verification have been approved. You are ready to start onboarding your workforce, defining departments, and managing staff leaves.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/departments"
              className="px-4 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-sm transition-all"
            >
              View Departments
            </Link>
            <Link
              to="/employees/new"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add First Employee</span>
            </Link>
          </div>
        </div>
      )}

      {/* 6 Key Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Total Employees"
          value={metrics?.totalEmployees ?? 0}
          subtitle="Registered staff"
          icon={Users}
          color="indigo"
        />
        <StatCard
          title="Active Employees"
          value={metrics?.activeEmployees ?? 0}
          subtitle="In service"
          icon={UserCheck}
          color="emerald"
        />
        <StatCard
          title="Departments"
          value={metrics?.totalDepartments ?? 0}
          subtitle="Operating units"
          icon={Building2}
          color="purple"
        />
        <StatCard
          title="Pending Leaves"
          value={metrics?.pendingLeaves ?? 0}
          subtitle="Awaiting decision"
          icon={CalendarClock}
          color="amber"
        />
        <StatCard
          title="Present Today"
          value={metrics?.presentToday ?? 0}
          subtitle="Checked in"
          icon={Clock}
          color="emerald"
        />
        <StatCard
          title="On Leave Today"
          value={metrics?.onLeaveToday ?? 0}
          subtitle="Approved leave"
          icon={UserX}
          color="rose"
        />
      </div>

      {/* Pending Account Review Section */}
      {(metrics?.pendingEmployees > 0 || recentPendingEmployees.length > 0) && (
        <div className="bg-gradient-to-r from-amber-500/10 via-amber-50 to-orange-50 border border-amber-300 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-600/30">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                  Zero-Access Quarantine ({metrics?.pendingEmployees || recentPendingEmployees.length})
                </span>
                <h3 className="text-base font-extrabold text-slate-900 mt-0.5">
                  Pending Staff Registrations Awaiting Organization Approval
                </h3>
                <p className="text-xs text-slate-600">
                  These individuals submitted self-registration for your company. They have ZERO access to system data until approved.
                </p>
              </div>
            </div>
            <Link
              to="/employees?status=pending"
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <span>Manage All Approvals</span>
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

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Department Employee Distribution */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Department Headcount Distribution
              </h3>
              <p className="text-xs text-slate-500">Active personnel across company departments</p>
            </div>
            <Link
              to="/departments"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <BarChart data={deptBarData} height={260} />
        </div>

        {/* Chart 3: Leave Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Leave Categories</h3>
              <p className="text-xs text-slate-500">Approved leave types breakdown</p>
            </div>
          </div>
          <PieChart data={leavePieData} height={260} />
        </div>
      </div>

      {/* Chart 2: Monthly Trends & Recent Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Attendance Trends */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Monthly Attendance Trends</h3>
              <p className="text-xs text-slate-500">Recorded attendance and leave history</p>
            </div>
            <Link
              to="/attendance/history"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>Log View</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <LineChart data={trendLineData} height={260} />
        </div>

        {/* Recent Leave Requests Card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Recent Applications</h3>
                <p className="text-xs text-slate-500">Latest employee leave submissions</p>
              </div>
              <Link
                to="/leaves/approvals"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {recentLeaves.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">No recent leaves recorded</p>
              ) : (
                recentLeaves.slice(0, 4).map((leave) => (
                  <div
                    key={leave._id}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate">
                        {leave.employee?.name || 'Employee'}
                      </p>
                      <p className="text-slate-500 text-[11px] truncate">
                        {leave.leaveType} • {leave.totalDays} day(s)
                      </p>
                      <p className="text-slate-400 text-[10px] mt-0.5">
                        {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-1.5">
                      <Badge variant={leave.status} size="sm">
                        {leave.status}
                      </Badge>
                      {leave.status === 'Pending' && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleApprove(leave._id)}
                            disabled={actionLoading}
                            title="Approve Leave"
                            className="p-1 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedLeave(leave);
                              setRejectModalOpen(true);
                            }}
                            disabled={actionLoading}
                            title="Reject Leave"
                            className="p-1 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4">
            <Link
              to="/leaves/approvals"
              className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
            >
              <span>Manage All Leave Approvals</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Reject Remarks Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Leave Application"
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
              {actionLoading ? 'Rejecting...' : 'Confirm Rejection'}
            </button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="text-xs text-slate-600">
            Please enter the official reason for rejecting this leave request. This remark will be visible to the employee.
          </p>
          <textarea
            value={rejectRemarks}
            onChange={(e) => setRejectRemarks(e.target.value)}
            rows={4}
            required
            placeholder="e.g. Critical project sprint milestone; please reschedule."
            className="w-full p-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:outline-none"
          />
        </div>
      </Modal>
    </div>
  );
};

export default SuperAdminDashboard;
