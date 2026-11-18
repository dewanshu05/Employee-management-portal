import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Breadcrumb from '../../components/common/Breadcrumb';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatDate, formatTime, formatCurrency } from '../../utils/formatters';
import { exportToCSV, triggerPrint } from '../../utils/exportUtils';
import {
  BarChart3,
  Download,
  Printer,
  Filter,
  Users,
  Clock,
  CalendarCheck,
  Building2,
  Calendar,
} from 'lucide-react';

const ReportsAnalytics = () => {
  const [activeTab, setActiveTab] = useState('employees'); // employees, attendance, leaves, departments
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [deptFilter, setDeptFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Report Data
  const [employeeReport, setEmployeeReport] = useState([]);
  const [attendanceReport, setAttendanceReport] = useState([]);
  const [leaveReport, setLeaveReport] = useState([]);
  const [deptReport, setDeptReport] = useState([]);

  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await api.get('/departments');
        if (res.data.success) {
          setDepartments(res.data.departments || []);
        }
      } catch (err) {
        console.error('Failed to load departments', err);
      }
    };
    fetchDepts();
  }, []);

  const fetchActiveReport = async () => {
    try {
      setLoading(true);
      const params = {
        department: deptFilter !== 'all' ? deptFilter : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      };

      if (activeTab === 'employees') {
        const res = await api.get('/reports/employees', { params });
        if (res.data.success) setEmployeeReport(res.data.employees || []);
      } else if (activeTab === 'attendance') {
        const res = await api.get('/reports/attendance', { params });
        if (res.data.success) setAttendanceReport(res.data.records || []);
      } else if (activeTab === 'leaves') {
        const res = await api.get('/reports/leaves', { params });
        if (res.data.success) setLeaveReport(res.data.leaves || []);
      } else if (activeTab === 'departments') {
        const res = await api.get('/reports/departments');
        if (res.data.success) setDeptReport(res.data.departments || []);
      }
    } catch (err) {
      console.error('Failed to fetch report data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveReport();
  }, [activeTab, deptFilter, startDate, endDate, statusFilter]);

  const handleExportCSV = () => {
    if (activeTab === 'employees') {
      const headers = [
        { label: 'Employee Name', key: 'name' },
        { label: 'Email', key: 'email' },
        { label: 'Role', key: 'role' },
        { label: 'Department', key: 'department.name' },
        { label: 'Designation', key: 'designation' },
        { label: 'Joining Date', key: 'joiningDate' },
        { label: 'Monthly Salary', key: 'salary' },
        { label: 'Status', key: 'status' },
      ];
      const data = employeeReport.map((e) => ({
        ...e,
        joiningDate: formatDate(e.joiningDate),
      }));
      exportToCSV('employee_directory_report', data, headers);
    } else if (activeTab === 'attendance') {
      const headers = [
        { label: 'Date', key: 'date' },
        { label: 'Employee Name', key: 'employee.name' },
        { label: 'Department', key: 'employee.department.name' },
        { label: 'Check In', key: 'checkIn' },
        { label: 'Check Out', key: 'checkOut' },
        { label: 'Hours Worked', key: 'hoursWorked' },
        { label: 'Status', key: 'status' },
      ];
      const data = attendanceReport.map((a) => ({
        ...a,
        date: formatDate(a.date),
        checkIn: a.checkIn ? formatTime(a.checkIn) : '--',
        checkOut: a.checkOut ? formatTime(a.checkOut) : '--',
      }));
      exportToCSV('attendance_audit_report', data, headers);
    } else if (activeTab === 'leaves') {
      const headers = [
        { label: 'Employee Name', key: 'employee.name' },
        { label: 'Leave Type', key: 'leaveType' },
        { label: 'Start Date', key: 'startDate' },
        { label: 'End Date', key: 'endDate' },
        { label: 'Working Days', key: 'totalDays' },
        { label: 'Status', key: 'status' },
        { label: 'Reason', key: 'reason' },
        { label: 'Remarks', key: 'remarks' },
      ];
      const data = leaveReport.map((l) => ({
        ...l,
        startDate: formatDate(l.startDate),
        endDate: formatDate(l.endDate),
      }));
      exportToCSV('leave_summary_report', data, headers);
    } else if (activeTab === 'departments') {
      const headers = [
        { label: 'Department Name', key: 'name' },
        { label: 'Department Head', key: 'head' },
        { label: 'Total Employees', key: 'totalEmployees' },
        { label: 'Active Employees', key: 'activeEmployees' },
        { label: 'Monthly Payroll Expense', key: 'totalSalary' },
      ];
      exportToCSV('department_headcount_report', deptReport, headers);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Reports & Analytics' }]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Reports & Workforce Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Generate and export real database audits for compliance, HR planning, and payroll
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto no-print">
          <button
            onClick={triggerPrint}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print / PDF Export</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm shadow-indigo-600/20 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Report Selection Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-sm flex flex-wrap gap-2 no-print">
        <button
          onClick={() => setActiveTab('employees')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'employees'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Employee Directory</span>
        </button>

        <button
          onClick={() => setActiveTab('attendance')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'attendance'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Monthly Attendance</span>
        </button>

        <button
          onClick={() => setActiveTab('leaves')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'leaves'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Leave Summary</span>
        </button>

        <button
          onClick={() => setActiveTab('departments')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
            activeTab === 'departments'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
              : 'text-slate-600 hover:bg-slate-50'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Department Headcount & Payroll</span>
        </button>
      </div>

      {/* Filter Bar */}
      {activeTab !== 'departments' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-wrap items-center gap-3 text-xs no-print">
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>

          {activeTab !== 'employees' && (
            <div className="flex items-center gap-2">
              <span className="text-slate-400">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <span className="text-slate-400">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          )}

          {activeTab === 'leaves' && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
          )}

          {(startDate || endDate || deptFilter !== 'all' || statusFilter !== 'all') && (
            <button
              onClick={() => {
                setDeptFilter('all');
                setStartDate('');
                setEndDate('');
                setStatusFilter('all');
              }}
              className="text-xs text-rose-600 hover:underline font-semibold ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      )}

      {/* Report Render Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner label="Generating database report..." />
        ) : (
          <>
            {/* Print Header */}
            <div className="p-6 border-b border-slate-100 hidden print:block">
              <h2 className="text-xl font-bold text-slate-900">
                Portal Report: {activeTab.toUpperCase()}
              </h2>
              <p className="text-xs text-slate-500">
                Generated on {new Date().toLocaleString()} from MongoDB Production Store
              </p>
            </div>

            {/* Tab 1: Employee Directory */}
            {activeTab === 'employees' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Employee</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Designation</th>
                      <th className="py-3 px-4">Joining Date</th>
                      <th className="py-3 px-4">Monthly Salary</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {employeeReport.map((emp) => (
                      <tr key={emp._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {emp.name}
                          <span className="block text-[11px] text-slate-400 font-normal">
                            {emp.email}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={emp.role} size="sm">
                            {emp.role}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700">
                          {emp.department?.name || 'General'}
                        </td>
                        <td className="py-3 px-4 text-slate-600">{emp.designation}</td>
                        <td className="py-3 px-4 font-mono text-slate-500">
                          {formatDate(emp.joiningDate)}
                        </td>
                        <td className="py-3 px-4 font-bold font-mono text-slate-800">
                          {formatCurrency(emp.salary)}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={emp.status} size="sm">
                            {emp.status}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 2: Attendance */}
            {activeTab === 'attendance' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Employee</th>
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Check In</th>
                      <th className="py-3 px-4">Check Out</th>
                      <th className="py-3 px-4">Hours</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {attendanceReport.map((rec) => (
                      <tr key={rec._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-800">
                          {formatDate(rec.date)}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {rec.employee?.name || 'Staff'}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {rec.employee?.department?.name || '-'}
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 3: Leaves */}
            {activeTab === 'leaves' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Employee</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Period</th>
                      <th className="py-3 px-4">Days</th>
                      <th className="py-3 px-4">Reason</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Approved By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {leaveReport.map((l) => (
                      <tr key={l._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {l.employee?.name}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-700">{l.leaveType}</td>
                        <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">
                          {formatDate(l.startDate)} - {formatDate(l.endDate)}
                        </td>
                        <td className="py-3 px-4 font-bold text-indigo-600">{l.totalDays}d</td>
                        <td className="py-3 px-4 max-w-xs truncate text-slate-600" title={l.reason}>
                          {l.reason}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={l.status} size="sm">
                            {l.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {l.approvedBy?.name || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab 4: Departments */}
            {activeTab === 'departments' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Department</th>
                      <th className="py-3 px-4">Department Head</th>
                      <th className="py-3 px-4">Total Staff</th>
                      <th className="py-3 px-4">Active Staff</th>
                      <th className="py-3 px-4">Monthly Payroll Expense</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {deptReport.map((d) => (
                      <tr key={d._id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4 font-bold text-slate-900">{d.name}</td>
                        <td className="py-3 px-4 text-slate-700 font-medium">{d.head}</td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {d.totalEmployees}
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-100">
                            {d.activeEmployees} active
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold font-mono text-indigo-600">
                          {formatCurrency(d.totalSalary)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ReportsAnalytics;
