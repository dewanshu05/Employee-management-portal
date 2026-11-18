import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Breadcrumb from '../../components/common/Breadcrumb';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import Modal from '../../components/common/Modal';
import { formatDate } from '../../utils/formatters';
import {
  CheckSquare,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  CalendarCheck2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Info,
} from 'lucide-react';

const LeaveApproval = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [leaveTypeFilter, setLeaveTypeFilter] = useState('all');
  const [deptFilter, setDeptFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Reject Modal State
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [rejectRemarks, setRejectRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Details Modal
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [viewingLeave, setViewingLeave] = useState(null);

  const fetchDepartments = async () => {
    try {
      const res = await api.get('/departments');
      if (res.data.success) {
        setDepartments(res.data.departments || []);
      }
    } catch (err) {
      console.error('Failed to load departments', err);
    }
  };

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        leaveType: leaveTypeFilter !== 'all' ? leaveTypeFilter : undefined,
        department: deptFilter !== 'all' ? deptFilter : undefined,
      };

      const res = await api.get('/leaves', { params });
      if (res.data.success) {
        setLeaves(res.data.leaves || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);
      }
    } catch (err) {
      console.error('Failed to load leaves', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchLeaves();
  }, [page, statusFilter, leaveTypeFilter, deptFilter]);

  const handleApprove = async (leave) => {
    try {
      setActionLoading(true);
      setMessage({ text: '', type: '' });
      const res = await api.put(`/leaves/${leave._id}/approve`, {
        remarks: `Approved by ${user?.name}`,
      });
      if (res.data.success) {
        setMessage({
          text: `Leave for ${leave.employee?.name} approved successfully. Leave balance deducted!`,
          type: 'success',
        });
        fetchLeaves();
      }
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Failed to approve leave',
        type: 'error',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectRemarks.trim()) {
      alert('Rejection remarks are mandatory');
      return;
    }

    try {
      setActionLoading(true);
      const res = await api.put(`/leaves/${selectedLeave._id}/reject`, {
        remarks: rejectRemarks.trim(),
      });
      if (res.data.success) {
        setRejectModalOpen(false);
        setSelectedLeave(null);
        setRejectRemarks('');
        setMessage({
          text: `Leave application rejected.`,
          type: 'info',
        });
        fetchLeaves();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject leave');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Leaves' },
          { label: 'Leave Approvals & Decision Queue' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Leave Approvals & Decisions
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Review submitted leave applications, verify balance eligibility, and process requests
          </p>
        </div>
      </div>

      {/* Banner / Message Alert */}
      {message.text && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : message.type === 'error'
              ? 'bg-rose-50 text-rose-800 border border-rose-200'
              : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
          }`}
        >
          <span>{message.text}</span>
          <button
            onClick={() => setMessage({ text: '', type: '' })}
            className="text-xs font-bold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-wrap items-center gap-3">
        {/* Status Tab buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs">
          {['Pending', 'Approved', 'Rejected', 'all'].map((st) => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-all ${
                statusFilter === st
                  ? 'bg-white text-indigo-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st === 'all' ? 'All Applications' : st}
            </button>
          ))}
        </div>

        {/* Leave Type Filter */}
        <select
          value={leaveTypeFilter}
          onChange={(e) => {
            setLeaveTypeFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="all">All Leave Types</option>
          <option value="Casual Leave">Casual Leave</option>
          <option value="Sick Leave">Sick Leave</option>
          <option value="Earned Leave">Earned Leave</option>
          <option value="Maternity Leave">Maternity Leave</option>
          <option value="Paternity Leave">Paternity Leave</option>
        </select>

        {/* Department Filter */}
        <select
          value={deptFilter}
          onChange={(e) => {
            setDeptFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
        >
          <option value="all">All Departments</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </select>

        <span className="text-xs text-slate-400 ml-auto font-medium">
          Found <strong>{total}</strong> applications
        </span>
      </div>

      {/* Leave Approval Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner label="Loading leave requests..." />
        ) : leaves.length === 0 ? (
          <EmptyState
            icon={CalendarCheck2}
            title="No applications match this filter"
            description="All leave requests in this category have been processed or none exist."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Applicant</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Duration</th>
                  <th className="py-3.5 px-4">Requested Dates</th>
                  <th className="py-3.5 px-4">Reason</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Decision / Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaves.map((leave) => (
                  <tr key={leave._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {leave.employee?.profileImage ? (
                          <img
                            src={leave.employee.profileImage}
                            alt=""
                            className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-200"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                            {leave.employee?.name?.slice(0, 2).toUpperCase() || 'EM'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">
                            {leave.employee?.name}
                          </p>
                          <p className="text-[11px] text-slate-400 truncate">
                            {leave.employee?.designation}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {leave.leaveType}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-indigo-600">
                      {leave.totalDays} working day(s)
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                      {formatDate(leave.startDate)} to {formatDate(leave.endDate)}
                    </td>

                    <td className="py-3.5 px-4 max-w-xs truncate text-slate-600" title={leave.reason}>
                      {leave.reason}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant={leave.status} size="sm">
                        {leave.status}
                      </Badge>
                      {leave.remarks && (
                        <p className="text-[10px] text-slate-400 italic mt-0.5 max-w-xs truncate" title={leave.remarks}>
                          "{leave.remarks}"
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {leave.status === 'Pending' ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleApprove(leave)}
                            disabled={actionLoading}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>

                          <button
                            onClick={() => {
                              setSelectedLeave(leave);
                              setRejectModalOpen(true);
                            }}
                            disabled={actionLoading}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-sm disabled:opacity-50"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setViewingLeave(leave);
                            setDetailsModalOpen(true);
                          }}
                          className="px-2.5 py-1 text-slate-500 hover:text-indigo-600 font-medium"
                        >
                          View Details
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Page <strong className="text-slate-700">{page}</strong> of{' '}
              <strong className="text-slate-700">{totalPages}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Reject Remarks Modal */}
      <Modal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        title="Reject Leave Application"
        subtitle={`Applicant: ${selectedLeave?.employee?.name}`}
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
              {actionLoading ? 'Rejecting...' : 'Confirm Rejection with Remarks'}
            </button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          <p className="text-slate-600">
            Rejection remarks are mandatory and will be recorded in the employee's file and notification:
          </p>
          <textarea
            value={rejectRemarks}
            onChange={(e) => setRejectRemarks(e.target.value)}
            rows={4}
            required
            placeholder="e.g. Critical engineering release this week; request to postpone to next Monday."
            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 focus:outline-none"
          />
        </div>
      </Modal>

      {/* View Decision Details Modal */}
      {viewingLeave && (
        <Modal
          isOpen={detailsModalOpen}
          onClose={() => setDetailsModalOpen(false)}
          title="Application Dossier"
          subtitle={`Reference: ${viewingLeave._id}`}
        >
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div>
                <p className="text-slate-400 font-medium">Applicant</p>
                <p className="text-slate-900 font-bold mt-0.5">{viewingLeave.employee?.name}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Status</p>
                <Badge variant={viewingLeave.status} size="sm" className="mt-0.5">
                  {viewingLeave.status}
                </Badge>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Category</p>
                <p className="text-slate-800 font-semibold mt-0.5">{viewingLeave.leaveType}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Duration</p>
                <p className="text-slate-800 font-semibold mt-0.5">{viewingLeave.totalDays} working day(s)</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">Start Date</p>
                <p className="text-slate-800 font-mono mt-0.5">{formatDate(viewingLeave.startDate)}</p>
              </div>
              <div>
                <p className="text-slate-400 font-medium">End Date</p>
                <p className="text-slate-800 font-mono mt-0.5">{formatDate(viewingLeave.endDate)}</p>
              </div>
            </div>

            <div>
              <p className="text-slate-500 font-semibold mb-1">Reason Stated</p>
              <p className="p-3 rounded-xl bg-white border border-slate-200 text-slate-700 leading-relaxed">
                {viewingLeave.reason}
              </p>
            </div>

            {viewingLeave.remarks && (
              <div>
                <p className="text-slate-500 font-semibold mb-1">Manager Remarks</p>
                <p className="p-3 rounded-xl bg-amber-50/60 border border-amber-200 text-amber-900 leading-relaxed">
                  {viewingLeave.remarks}
                </p>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default LeaveApproval;
