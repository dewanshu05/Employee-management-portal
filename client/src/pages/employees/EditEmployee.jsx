import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Breadcrumb from '../../components/common/Breadcrumb';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Save,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Building2,
  Calendar,
  User,
} from 'lucide-react';

const EditEmployee = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();

  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'employee',
    employeeId: '',
    department: '',
    designation: '',
    phone: '',
    joiningDate: '',
    salary: 0,
    status: 'active',
    profileImage: '',
    pan: '',
    aadhaar: '',
    uan: '',
    bankAccount: '',
    ifsc: '',
    casualLeave: 12,
    sickLeave: 10,
    earnedLeave: 15,
    maternityLeave: 180,
    paternityLeave: 15,
    password: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [deptRes, empRes] = await Promise.all([
          api.get('/departments'),
          api.get(`/employees/${id}`),
        ]);

        if (deptRes.data.success) {
          setDepartments(deptRes.data.departments || []);
        }

        if (empRes.data.success) {
          const emp = empRes.data.employee;
          setFormData({
            name: emp.name || '',
            email: emp.email || '',
            role: emp.role || 'employee',
            employeeId: emp.employeeId || '',
            department: emp.department?._id || emp.department || '',
            designation: emp.designation || '',
            phone: emp.phone || '',
            joiningDate: emp.joiningDate ? emp.joiningDate.slice(0, 10) : '',
            salary: emp.salary || 0,
            status: emp.status || 'active',
            profileImage: emp.profileImage || '',
            pan: emp.pan || '',
            aadhaar: emp.aadhaar || '',
            uan: emp.uan || '',
            bankAccount: emp.bankAccount || '',
            ifsc: emp.ifsc || '',
            casualLeave: emp.leaveBalances?.casual ?? 12,
            sickLeave: emp.leaveBalances?.sick ?? 10,
            earnedLeave: emp.leaveBalances?.earned ?? 15,
            maternityLeave: emp.leaveBalances?.maternity ?? 180,
            paternityLeave: emp.leaveBalances?.paternity ?? 15,
            password: '',
          });
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load employee details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setSaving(true);
      const payload = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        employeeId: formData.employeeId ? formData.employeeId.trim().toUpperCase() : undefined,
        department: formData.department || null,
        designation: formData.designation,
        phone: formData.phone,
        joiningDate: formData.joiningDate,
        salary: Number(formData.salary) || 0,
        pan: formData.pan.trim().toUpperCase(),
        aadhaar: formData.aadhaar.trim(),
        uan: formData.uan.trim(),
        bankAccount: formData.bankAccount.trim(),
        ifsc: formData.ifsc.trim().toUpperCase(),
        status: formData.status,
        profileImage: formData.profileImage,
        leaveBalances: {
          casual: Number(formData.casualLeave) || 0,
          sick: Number(formData.sickLeave) || 0,
          earned: Number(formData.earnedLeave) || 0,
          maternity: Number(formData.maternityLeave) || 0,
          paternity: Number(formData.paternityLeave) || 0,
        },
      };

      if (formData.password && formData.password.trim().length >= 6) {
        payload.password = formData.password.trim();
      }

      const res = await api.put(`/employees/${id}`, payload);
      if (res.data.success) {
        setSuccess('Employee details updated successfully!');
        setTimeout(() => navigate(`/employees/${id}`), 1000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update employee details');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner label="Loading employee file..." />;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Breadcrumb
        items={[
          { label: 'Employees', to: '/employees' },
          { label: formData.name || 'Employee', to: `/employees/${id}` },
          { label: 'Edit Profile' },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Edit Employee Profile
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Modify profile records, job designation, salary, and leave balances
          </p>
        </div>
        <Link
          to={`/employees/${id}`}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Profile</span>
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

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Account Information */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-600" />
            <span>Account & Contact Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Official Employee ID</label>
              <input
                type="text"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                placeholder="e.g. EMP-1001"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Full Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Corporate Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Phone Number</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Reset Password (Optional)
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Leave blank to keep unchanged"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1.5">Profile Image URL</label>
              <input
                type="url"
                name="profileImage"
                value={formData.profileImage}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Job & Organization */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span>Job Role & Status</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={currentUser?.role === 'hr' && formData.role === 'admin'}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 disabled:opacity-50"
              >
                <option value="employee">Employee</option>
                <option value="hr">HR Manager</option>
                {currentUser?.role === 'admin' && <option value="admin">Super Admin</option>}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                <option value="">None / Unassigned</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Designation</label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Joining Date</label>
              <input
                type="date"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Compensation / CTC (₹ INR)</label>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleChange}
                min="0"
                placeholder="e.g. 850000"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={formData.role === 'admin'}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 disabled:opacity-50"
              >
                <option value="active">Active</option>
                <option value="pending">Pending Approval</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Card 3: Indian Statutory Compliance & Banking */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>Indian Statutory Compliance & Salary Account</span>
            </span>
            <span className="text-[11px] font-normal text-slate-400">PAN, EPFO & Banking</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Income Tax PAN (10 Characters)
              </label>
              <input
                type="text"
                name="pan"
                maxLength={10}
                value={formData.pan}
                onChange={handleChange}
                placeholder="e.g. ABCDE1234F"
                className="w-full px-3.5 py-2.5 uppercase font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Aadhaar Number (12 Digits)
              </label>
              <input
                type="text"
                name="aadhaar"
                maxLength={12}
                value={formData.aadhaar}
                onChange={handleChange}
                placeholder="e.g. 987654321098"
                className="w-full px-3.5 py-2.5 font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                EPFO UAN (Universal Account No.)
              </label>
              <input
                type="text"
                name="uan"
                maxLength={12}
                value={formData.uan}
                onChange={handleChange}
                placeholder="e.g. 101234567890"
                className="w-full px-3.5 py-2.5 font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Bank Account Number
              </label>
              <input
                type="text"
                name="bankAccount"
                value={formData.bankAccount}
                onChange={handleChange}
                placeholder="e.g. 50100234891234"
                className="w-full px-3.5 py-2.5 font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Bank IFSC Code
              </label>
              <input
                type="text"
                name="ifsc"
                maxLength={11}
                value={formData.ifsc}
                onChange={handleChange}
                placeholder="e.g. HDFC0001234"
                className="w-full px-3.5 py-2.5 uppercase font-mono bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>
        </div>

        {/* Card 3: Leave Balances Allocation */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>Leave Balance Allocation</span>
            </span>
            <span className="text-xs text-slate-400 font-normal">Remaining available days</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 text-xs">
            <div>
              <label className="block font-medium text-slate-600 mb-1">Casual Leave</label>
              <input
                type="number"
                name="casualLeave"
                value={formData.casualLeave}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-indigo-600 text-center"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-600 mb-1">Sick Leave</label>
              <input
                type="number"
                name="sickLeave"
                value={formData.sickLeave}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-rose-600 text-center"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-600 mb-1">Earned Leave</label>
              <input
                type="number"
                name="earnedLeave"
                value={formData.earnedLeave}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-emerald-600 text-center"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-600 mb-1">Maternity Leave</label>
              <input
                type="number"
                name="maternityLeave"
                value={formData.maternityLeave}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-purple-600 text-center"
              />
            </div>

            <div className="col-span-2 sm:col-span-1">
              <label className="block font-medium text-slate-600 mb-1">Paternity Leave</label>
              <input
                type="number"
                name="paternityLeave"
                value={formData.paternityLeave}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-teal-600 text-center"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link
            to={`/employees/${id}`}
            className="px-5 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/30 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEmployee;
