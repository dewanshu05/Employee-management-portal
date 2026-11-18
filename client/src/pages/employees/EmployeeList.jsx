import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Breadcrumb from '../../components/common/Breadcrumb';
import { formatDate } from '../../utils/formatters';
import {
  Users,
  UserPlus,
  Search,
  Eye,
  Edit2,
  Trash2,
  Power,
  ChevronLeft,
  ChevronRight,
  Shield,
  Building2,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';

const EmployeeList = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlStatus = searchParams.get('status');

  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [pendingTotal, setPendingTotal] = useState(0);

  // Filters
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('all');
  const [status, setStatus] = useState(urlStatus || 'all');
  const [role, setRole] = useState('all');

  // Delete modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Interactive Approval Modal State
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [empToApprove, setEmpToApprove] = useState(null);
  const [approvalData, setApprovalData] = useState({
    employeeId: '',
    department: '',
    designation: '',
    salary: 850000,
    role: 'employee',
  });
  const [approvalLoading, setApprovalLoading] = useState(false);

  // Keep state synchronized with URL search parameters
  useEffect(() => {
    if (urlStatus && urlStatus !== status) {
      setStatus(urlStatus);
      setPage(1);
    }
  }, [urlStatus]);

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

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        search: search.trim() || undefined,
        department: department !== 'all' ? department : undefined,
        status: status !== 'all' ? status : undefined,
        role: role !== 'all' ? role : undefined,
      };

      const res = await api.get('/employees', { params });
      if (res.data.success) {
        setEmployees(res.data.employees || []);
        setTotal(res.data.total || 0);
        setTotalPages(res.data.totalPages || 1);

        if (status === 'pending') {
          setPendingTotal(res.data.total || 0);
        } else {
          api.get('/employees', { params: { status: 'pending', limit: 1 } })
            .then((pRes) => setPendingTotal(pRes.data?.total || 0))
            .catch(() => {});
        }
      }
    } catch (err) {
      console.error('Failed to load employees', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchEmployees();
  }, [page, department, status, role]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchEmployees();
  };

  const handleToggleStatus = async (emp) => {
    try {
      await api.patch(`/employees/${emp._id}/status`);
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to toggle status');
    }
  };

  const openApprovalModal = (emp) => {
    setEmpToApprove(emp);
    const suggestedEmpId = emp.employeeId || `EMP-${String(Math.floor(1000 + Math.random() * 9000))}`;
    setApprovalData({
      employeeId: suggestedEmpId,
      department: emp.department?._id || emp.department || (departments[0]?._id || ''),
      designation: emp.designation && !emp.designation.includes('Pending') ? emp.designation : 'Software Engineer',
      salary: emp.salary || 850000,
      role: emp.role || 'employee',
    });
    setApprovalModalOpen(true);
  };

  const handleApproveSubmit = async (e) => {
    e.preventDefault();
    if (!empToApprove) return;
    try {
      setApprovalLoading(true);
      await api.patch(`/employees/${empToApprove._id}/approve`, approvalData);
      setApprovalModalOpen(false);
      setEmpToApprove(null);
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve account');
    } finally {
      setApprovalLoading(false);
    }
  };

  const handleRejectApplicant = async (emp) => {
    if (
      !window.confirm(
        `Are you sure you want to reject and remove the registration application for "${emp.name}" (${emp.email})?`
      )
    ) {
      return;
    }
    try {
      await api.patch(`/employees/${emp._id}/reject`);
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject applicant');
    }
  };

  const handleDelete = async () => {
    if (!selectedEmp) return;
    try {
      setDeleteLoading(true);
      await api.delete(`/employees/${selectedEmp._id}`);
      setDeleteModalOpen(false);
      setSelectedEmp(null);
      fetchEmployees();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete employee');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Employees' }]} />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Workforce & Staff Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage company staff records, assigned Employee IDs, roles, and access statuses ({total} total)
          </p>
        </div>

        <Link
          to="/employees/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 transition-all self-start sm:self-auto cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Employee</span>
        </Link>
      </div>

      {/* Prominent Pending Approvals Alert Banner */}
      {pendingTotal > 0 && status !== 'pending' && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900 flex items-center gap-2">
                <span>Action Required: {pendingTotal} {pendingTotal === 1 ? 'Registration' : 'Registrations'} in Zero-Access Quarantine</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-600 text-white animate-pulse">
                  Pending Decision
                </span>
              </h4>
              <p className="text-[11px] text-amber-700 mt-0.5">
                New staff/HR registrants cannot access any portal data until you review their credentials, assign an official Employee ID, and activate them.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setStatus('pending');
              setSearchParams({ status: 'pending' });
              setPage(1);
            }}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer shrink-0 self-end sm:self-auto shadow-sm"
          >
            Review Pending Queue ({pendingTotal})
          </button>
        </div>
      )}

      {/* Top Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => {
            setStatus('all');
            setSearchParams({});
            setPage(1);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            status === 'all'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          All Staff ({total})
        </button>
        <button
          type="button"
          onClick={() => {
            setStatus('active');
            setSearchParams({ status: 'active' });
            setPage(1);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            status === 'active'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Active Staff
        </button>
        <button
          type="button"
          onClick={() => {
            setStatus('pending');
            setSearchParams({ status: 'pending' });
            setPage(1);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            status === 'pending'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200'
          }`}
        >
          <span>Pending Approvals</span>
          {pendingTotal > 0 && (
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                status === 'pending' ? 'bg-white text-amber-700' : 'bg-amber-600 text-white'
              }`}
            >
              {pendingTotal}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => {
            setStatus('inactive');
            setSearchParams({ status: 'inactive' });
            setPage(1);
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            status === 'inactive'
              ? 'bg-slate-700 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Inactive
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Employee ID, Name, Email, or Designation..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Department Filter */}
            <select
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Departments</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>

            {/* Role Filter */}
            <select
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setPage(1);
              }}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Roles</option>
              <option value="admin">Super Admin</option>
              <option value="hr">HR Manager</option>
              <option value="employee">Employee</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-800 rounded-xl hover:bg-slate-900 transition-colors cursor-pointer"
            >
              Filter
            </button>
          </div>
        </form>
      </div>

      {/* Employee Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner label="Loading employee records..." />
        ) : employees.length === 0 ? (
          <EmptyState
            icon={Users}
            title={status === 'pending' ? 'No pending registration requests' : 'No employees found'}
            description={
              status === 'pending'
                ? 'All staff registrations have been reviewed and approved.'
                : 'Try adjusting your search query or department filters.'
            }
            actionText="Add New Employee"
            onAction={() => window.location.assign('/employees/new')}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Employee / ID</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Department</th>
                  <th className="py-3.5 px-4">Designation</th>
                  <th className="py-3.5 px-4">Joined / Applied</th>
                  <th className="py-3.5 px-4">Access Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((emp) => (
                  <tr key={emp._id} className="hover:bg-slate-50/60 transition-colors">
                    {/* Employee Profile & Employee ID */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {emp.profileImage ? (
                          <img
                            src={emp.profileImage}
                            alt=""
                            className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                            {emp.name?.slice(0, 2).toUpperCase() || 'EM'}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/employees/${emp._id}`}
                              className="font-bold text-slate-900 hover:text-indigo-600 truncate block"
                            >
                              {emp.name}
                            </Link>
                            {emp.employeeId ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                                {emp.employeeId}
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                ID Pending
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">{emp.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-3.5 px-4">
                      <Badge variant={emp.role} size="sm">
                        {emp.role === 'admin'
                          ? 'Super Admin'
                          : emp.role === 'hr'
                          ? 'HR Manager'
                          : 'Employee'}
                      </Badge>
                    </td>

                    {/* Department */}
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {emp.department?.name || <span className="text-amber-600 font-normal">Pending Assignment</span>}
                    </td>

                    {/* Designation */}
                    <td className="py-3.5 px-4 text-slate-600">{emp.designation || 'Pending'}</td>

                    {/* Joining Date */}
                    <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                      {formatDate(emp.joiningDate || emp.createdAt)}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <Badge variant={emp.status} size="sm">
                        {emp.status === 'pending' ? 'Pending Approval' : emp.status}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {emp.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => openApprovalModal(emp)}
                              title="Review & Activate Account"
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Review & Approve</span>
                            </button>
                            <button
                              onClick={() => handleRejectApplicant(emp)}
                              title="Reject Registration Application"
                              className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <>
                            <Link
                              to={`/employees/${emp._id}`}
                              title="View Profile Details"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>

                            <Link
                              to={`/employees/${emp._id}/edit`}
                              title="Edit Employee"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </Link>

                            {emp.role !== 'admin' && (
                              <>
                                <button
                                  onClick={() => handleToggleStatus(emp)}
                                  title={
                                    emp.status === 'active'
                                      ? 'Deactivate Account'
                                      : 'Reactivate Account'
                                  }
                                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                    emp.status === 'active'
                                      ? 'text-slate-500 hover:text-rose-600 hover:bg-rose-50'
                                      : 'text-slate-500 hover:text-emerald-600 hover:bg-emerald-50'
                                  }`}
                                >
                                  <Power className="w-4 h-4" />
                                </button>

                                <button
                                  onClick={() => {
                                    setSelectedEmp(emp);
                                    setDeleteModalOpen(true);
                                  }}
                                  title="Delete Employee"
                                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing page <strong className="text-slate-700">{page}</strong> of{' '}
              <strong className="text-slate-700">{totalPages}</strong>
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Account Approval Modal */}
      {approvalModalOpen && empToApprove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Zero-Access Quarantine Review
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                  Approve & Activate Account
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Assign official Employee ID, department, and salary for {empToApprove.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setApprovalModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApproveSubmit} className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Applicant:</span>
                  <span className="font-bold text-slate-900">{empToApprove.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Corporate Email:</span>
                  <span className="font-mono text-slate-700">{empToApprove.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Requested Portal Role:</span>
                  <Badge variant={empToApprove.role} size="sm">{empToApprove.role}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Official Employee ID *
                  </label>
                  <input
                    type="text"
                    value={approvalData.employeeId}
                    onChange={(e) =>
                      setApprovalData((prev) => ({ ...prev, employeeId: e.target.value }))
                    }
                    placeholder="e.g. EMP-1001"
                    className="w-full px-3 py-2 text-xs font-mono bg-white border border-slate-200 rounded-xl uppercase focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirmed Role *
                  </label>
                  <select
                    value={approvalData.role}
                    onChange={(e) =>
                      setApprovalData((prev) => ({ ...prev, role: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="employee">Employee (Staff Portal)</option>
                    <option value="hr">HR Manager (HR Portal)</option>
                    {user?.role === 'admin' && <option value="admin">Super Admin (Admin Gateway)</option>}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Department *
                  </label>
                  <select
                    value={approvalData.department}
                    onChange={(e) =>
                      setApprovalData((prev) => ({ ...prev, department: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="">-- Select Department --</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Designation / Title *
                  </label>
                  <input
                    type="text"
                    value={approvalData.designation}
                    onChange={(e) =>
                      setApprovalData((prev) => ({ ...prev, designation: e.target.value }))
                    }
                    placeholder="e.g. Senior Software Engineer"
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Annual CTC Compensation (₹ INR) *
                </label>
                <input
                  type="number"
                  value={approvalData.salary}
                  onChange={(e) =>
                    setApprovalData((prev) => ({ ...prev, salary: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setApprovalModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={approvalLoading}
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all disabled:opacity-60 cursor-pointer flex items-center gap-1.5"
                >
                  {approvalLoading ? (
                    <span>Activating Account...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Grant Portal Clearance</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Employee Record"
        message={`Are you sure you want to permanently delete employee "${selectedEmp?.name}" (${selectedEmp?.email})? All associated attendance and leave records will also be removed. This action cannot be undone.`}
        confirmText="Delete Record"
        variant="danger"
        loading={deleteLoading}
      />
    </div>
  );
};

export default EmployeeList;
