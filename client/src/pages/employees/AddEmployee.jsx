import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Breadcrumb from '../../components/common/Breadcrumb';
import {
  UserPlus,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Building2,
  DollarSign,
  Calendar,
  Phone,
  Mail,
  User,
  Lock,
  Image,
  Copy,
  Check,
  ShieldCheck,
} from 'lucide-react';

const AddEmployee = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [createdCredentials, setCreatedCredentials] = useState(null);
  const [copied, setCopied] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'Welcome@123',
    role: 'employee',
    employeeId: '',
    department: '',
    designation: '',
    phone: '+91 ',
    joiningDate: new Date().toISOString().slice(0, 10),
    salary: 850000,
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
  });

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await api.get('/departments');
        if (res.data.success && res.data.departments.length > 0) {
          setDepartments(res.data.departments);
          setFormData((prev) => ({ ...prev, department: res.data.departments[0]._id }));
        }
      } catch (err) {
        console.error('Failed to load departments', err);
      }
    };
    fetchDepartments();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name || !formData.email || !formData.designation) {
      setError('Please fill in all required fields (Name, Email, Designation)');
      return;
    }

    try {
      setLoading(true);
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        employeeId: formData.employeeId.trim().toUpperCase() || undefined,
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
          casual: Number(formData.casualLeave) || 12,
          sick: Number(formData.sickLeave) || 10,
          earned: Number(formData.earnedLeave) || 15,
          maternity: Number(formData.maternityLeave) || 180,
          paternity: Number(formData.paternityLeave) || 15,
        },
      };

      const res = await api.post('/employees', payload);
      if (res.data.success) {
        setSuccess('Employee account created and active!');
        setCreatedCredentials(
          res.data.credentials || {
            employeeId: res.data.employee?.employeeId,
            email: res.data.employee?.email,
            temporaryPassword: formData.password,
            role: res.data.employee?.role,
            portal:
              res.data.employee?.role === 'admin'
                ? 'Super Admin Gateway'
                : res.data.employee?.role === 'hr'
                ? 'HR Operations Portal'
                : 'Employee Portal',
          }
        );
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create employee record');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Breadcrumb
        items={[
          { label: 'Employees', to: '/employees' },
          { label: 'Add New Employee' },
        ]}
      />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Add New Employee
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Onboard an employee with corporate profile, role, and leave balance quotas
          </p>
        </div>
        <Link
          to="/employees"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Directory</span>
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

      {/* Onboarding Success Credentials Showcase */}
      {createdCredentials && (
        <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-50 to-teal-50 border-2 border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-lg space-y-5 animate-in fade-in zoom-in-95">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30 shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  Account Active & Ready
                </span>
                <h2 className="text-xl font-black text-slate-900 mt-1">
                  Employee Onboarded Successfully!
                </h2>
                <p className="text-xs text-slate-600">
                  Official Employee ID and portal access credentials have been generated. Share these with the employee for direct login.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                const credText = `Employee Portal Login Credentials:\nEmployee ID: ${createdCredentials.employeeId}\nEmail: ${createdCredentials.email}\nTemporary Password: ${createdCredentials.temporaryPassword}\nPortal: ${createdCredentials.portal}\nLogin URL: ${window.location.origin}/login`;
                navigator.clipboard.writeText(credText);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition-all cursor-pointer shrink-0 self-start sm:self-auto"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied to Clipboard!' : 'Copy Credentials'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Official Employee ID</span>
              <p className="text-sm font-mono font-black text-indigo-700 mt-0.5">{createdCredentials.employeeId}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Login Corporate Email</span>
              <p className="text-xs font-mono font-bold text-slate-800 truncate mt-0.5">{createdCredentials.email}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Initial Password</span>
              <p className="text-xs font-mono font-bold text-emerald-700 mt-0.5">{createdCredentials.temporaryPassword}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Assigned Portal</span>
              <p className="text-xs font-bold text-slate-800 mt-0.5">{createdCredentials.portal}</p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => {
                setCreatedCredentials(null);
                setFormData({
                  name: '',
                  email: '',
                  password: 'Welcome@123',
                  role: 'employee',
                  employeeId: '',
                  department: departments[0]?._id || '',
                  designation: '',
                  phone: '+91 ',
                  joiningDate: new Date().toISOString().slice(0, 10),
                  salary: 850000,
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
                });
              }}
              className="px-4 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
            >
              Add Another Employee
            </button>
            <Link
              to="/employees"
              className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-md transition-all cursor-pointer"
            >
              Go to Employee Directory
            </Link>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Basic Information */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-600" />
            <span>Personal & Account Details</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Official Employee ID (Optional)
              </label>
              <input
                type="text"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                placeholder="Auto-generated if left blank (e.g. EMP-1002)"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Johnathan Smith"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Work Email <span className="text-rose-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="johnathan@company.com"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Initial Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Contact Phone
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1.5">
                Profile Image URL (Optional)
              </label>
              <input
                type="url"
                name="profileImage"
                value={formData.profileImage}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/photo-..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Organizational Placement */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <span>Role & Department Assignment</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                System Role <span className="text-rose-500">*</span>
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                <option value="employee">Employee</option>
                <option value="hr">HR Manager</option>
                {currentUser?.role === 'admin' && <option value="admin">Super Admin</option>}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Department
              </label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              >
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Designation / Job Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
                placeholder="e.g. Senior Software Engineer"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Joining Date
              </label>
              <input
                type="date"
                name="joiningDate"
                value={formData.joiningDate}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Compensation / CTC (₹ INR)
              </label>
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
              <label className="block font-semibold text-slate-700 mb-1.5">
                Employment Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
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

        {/* Card 3: Annual Leave Allocation */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>Annual Leave Balances Quota (Days)</span>
            </span>
            <span className="text-xs text-slate-400 font-normal">Standard company policy defaults</span>
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
            to="/employees"
            className="px-5 py-2.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/30 transition-all disabled:opacity-50 cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>{loading ? 'Creating Account...' : 'Complete Onboarding'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEmployee;
