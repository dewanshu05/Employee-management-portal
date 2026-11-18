import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Breadcrumb from '../../components/common/Breadcrumb';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';
import {
  Building2,
  PlusCircle,
  Users,
  Edit2,
  Trash2,
  UserCheck,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Eye,
} from 'lucide-react';

const DepartmentManagement = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create / Edit modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({ name: '', head: '', description: '' });
  const [formLoading, setFormLoading] = useState(false);

  // Delete confirm dialog
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // View employees in department modal
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [deptDetails, setDeptDetails] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  // Alerts
  const [message, setMessage] = useState({ text: '', type: '' });

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/departments');
      if (res.data.success) {
        setDepartments(res.data.departments || []);
      }
    } catch (err) {
      console.error('Failed to load departments', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await api.get('/employees?limit=100');
      if (res.data.success) {
        setEmployees(res.data.employees || []);
      }
    } catch (err) {
      console.error('Failed to load employees', err);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
  }, []);

  const handleOpenCreate = () => {
    setEditingDept(null);
    setFormData({ name: '', head: '', description: '' });
    setModalOpen(true);
  };

  const handleOpenEdit = (dept) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      head: dept.head?._id || '',
      description: dept.description || '',
    });
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Department name is required');
      return;
    }

    try {
      setFormLoading(true);
      if (editingDept) {
        await api.put(`/departments/${editingDept._id}`, formData);
        setMessage({ text: 'Department updated successfully!', type: 'success' });
      } else {
        await api.post('/departments', formData);
        setMessage({ text: 'Department created successfully!', type: 'success' });
      }
      setModalOpen(false);
      fetchDepartments();
    } catch (err) {
      alert(err.response?.data?.message || 'Operation failed');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedDept) return;
    try {
      setDeleteLoading(true);
      const res = await api.delete(`/departments/${selectedDept._id}`);
      if (res.data.success) {
        setMessage({ text: res.data.message || 'Department deleted', type: 'success' });
        setDeleteModalOpen(false);
        setSelectedDept(null);
        fetchDepartments();
      }
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Failed to delete department',
        type: 'error',
      });
      setDeleteModalOpen(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleViewDept = async (id) => {
    try {
      setViewLoading(true);
      setViewModalOpen(true);
      const res = await api.get(`/departments/${id}`);
      if (res.data.success) {
        setDeptDetails(res.data);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to fetch department details');
    } finally {
      setViewLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Departments' }]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Department Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Organize business units, designate department leaders, and inspect team rosters
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={handleOpenCreate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 transition-all self-start sm:self-auto cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Department</span>
          </button>
        )}
      </div>

      {/* Alert banner */}
      {message.text && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-center justify-between gap-2 ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-rose-50 text-rose-800 border border-rose-200'
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

      {/* Department Cards Grid */}
      {loading ? (
        <LoadingSpinner label="Loading departments..." />
      ) : departments.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No departments found"
          description="Create your first organization department to organize employees."
          actionText={isAdmin ? 'Create Department' : undefined}
          onAction={isAdmin ? handleOpenCreate : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <div
              key={dept._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                    <Building2 className="w-6 h-6" />
                  </div>

                  {isAdmin && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(dept)}
                        title="Edit Department"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedDept(dept);
                          setDeleteModalOpen(true);
                        }}
                        title="Delete Department"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <h3 className="text-base font-bold text-slate-900">{dept.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 min-h-[32px]">
                  {dept.description || 'No description provided.'}
                </p>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Department Head:</span>
                    <span className="font-semibold text-slate-800">
                      {dept.head?.name || 'Unassigned'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 font-medium">Active Staff:</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-100 text-[11px]">
                      {dept.activeEmployeeCount ?? 0} members
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleViewDept(dept._id)}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Department Team</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingDept ? 'Edit Department' : 'Create New Department'}
        subtitle="Manage department details and designate a team leader"
        footer={
          <>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleFormSubmit}
              disabled={formLoading}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl disabled:opacity-50"
            >
              {formLoading ? 'Saving...' : editingDept ? 'Save Changes' : 'Create Department'}
            </button>
          </>
        }
      >
        <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Department Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Artificial Intelligence & Analytics"
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Designated Department Head
            </label>
            <select
              value={formData.head}
              onChange={(e) => setFormData({ ...formData, head: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            >
              <option value="">None / To be appointed</option>
              {employees.map((emp) => (
                <option key={emp._id} value={emp._id}>
                  {emp.name} ({emp.designation})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Department Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              placeholder="Operational responsibilities and scope of this department..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Delete Department"
        message={`Are you sure you want to delete the department "${selectedDept?.name}"? The system will ensure that no employees are currently assigned before allowing deletion.`}
        confirmText="Confirm Delete"
        variant="danger"
        loading={deleteLoading}
      />

      {/* View Department Details & Staff Modal */}
      {viewModalOpen && (
        <Modal
          isOpen={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          title={deptDetails?.department?.name || 'Department Roster'}
          subtitle={`Department Head: ${deptDetails?.department?.head?.name || 'Unassigned'}`}
          maxWidth="max-w-2xl"
        >
          {viewLoading || !deptDetails ? (
            <LoadingSpinner label="Loading team list..." />
          ) : (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-slate-500">Total Staff:</span>
                  <span className="font-bold text-slate-900 ml-1.5">{deptDetails.stats?.totalEmployees}</span>
                </div>
                <div>
                  <span className="text-slate-500">Active Members:</span>
                  <span className="font-bold text-emerald-600 ml-1.5">{deptDetails.stats?.activeEmployees}</span>
                </div>
                <div>
                  <span className="text-slate-500">Pending Leaves:</span>
                  <span className="font-bold text-amber-600 ml-1.5">{deptDetails.stats?.pendingLeaves}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-800">Assigned Employees</h4>
                {deptDetails.employees?.length === 0 ? (
                  <p className="text-slate-400 py-4 text-center">No employees assigned to this department yet.</p>
                ) : (
                  <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                    {deptDetails.employees?.map((emp) => (
                      <div key={emp._id} className="py-2.5 flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-slate-800">{emp.name}</p>
                          <p className="text-[11px] text-slate-400">{emp.designation}</p>
                        </div>
                        <span className="font-mono text-slate-500">{emp.email}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
};

export default DepartmentManagement;
