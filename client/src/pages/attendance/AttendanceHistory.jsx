import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Breadcrumb from '../../components/common/Breadcrumb';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatDate, formatTime } from '../../utils/formatters';
import { exportToCSV } from '../../utils/exportUtils';
import {
  History,
  Download,
  Filter,
  Search,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
} from 'lucide-react';

const AttendanceHistory = () => {
  const { user } = useAuth();
  const isEmployee = user?.role === 'employee';

  const [records, setRecords] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  // Filters
  const [department, setDepartment] = useState('all');
  const [employee, setEmployee] = useState('');
  const [status, setStatus] = useState('all');
  const [date, setDate] = useState('');

  const fetchFilters = async () => {
    try {
      if (!isEmployee) {
        const [deptRes, empRes] = await Promise.all([
          api.get('/departments'),
          api.get('/employees?limit=100'),
        ]);
        if (deptRes.data.success) setDepartments(deptRes.data.departments || []);
        if (empRes.data.success) setEmployees(empRes.data.employees || []);
      }
    } catch (err) {
      console.error('Failed to load filter options', err);
    }
  };

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      if (isEmployee) {
        const res = await api.get('/attendance/my');
        if (res.data.success) {
          setRecords(res.data.records || []);
          setTotal(res.data.count || 0);
          setTotalPages(1);
        }
      } else {
        const params = {
          page,
          limit: 20,
          department: department !== 'all' ? department : undefined,
          employee: employee || undefined,
          status: status !== 'all' ? status : undefined,
          date: date || undefined,
        };
        const res = await api.get('/attendance', { params });
        if (res.data.success) {
          setRecords(res.data.records || []);
          setTotal(res.data.total || 0);
          setTotalPages(res.data.totalPages || 1);
        }
      }
    } catch (err) {
      console.error('Failed to load attendance records', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilters();
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, [page, department, employee, status, date]);

  const handleExportCSV = () => {
    const headers = [
      { label: 'Date', key: 'date' },
      { label: 'Employee Name', key: 'employee.name' },
      { label: 'Designation', key: 'employee.designation' },
      { label: 'Check In', key: 'checkIn' },
      { label: 'Check Out', key: 'checkOut' },
      { label: 'Hours Worked', key: 'hoursWorked' },
      { label: 'Status', key: 'status' },
      { label: 'Remarks', key: 'remarks' },
    ];

    const exportData = records.map((r) => ({
      ...r,
      date: formatDate(r.date),
      checkIn: r.checkIn ? formatTime(r.checkIn) : '--',
      checkOut: r.checkOut ? formatTime(r.checkOut) : '--',
    }));

    exportToCSV('attendance_report', exportData, headers);
  };

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: 'Attendance' },
          { label: 'Organization Attendance Log' },
        ]}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Attendance Log & Shift Records
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Complete database audit of employee check-ins, check-outs, and shift determinations
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 shadow-sm transition-all self-start sm:self-auto cursor-pointer"
        >
          <Download className="w-4 h-4 text-indigo-600" />
          <span>Export to CSV</span>
        </button>
      </div>

      {/* Filters (HR/Admin) */}
      {!isEmployee && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-wrap items-center gap-3 text-xs">
          {/* Department Filter */}
          <select
            value={department}
            onChange={(e) => {
              setDepartment(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All Departments</option>
            {departments.map((d) => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All Statuses</option>
            <option value="Present">Present (&gt;6h)</option>
            <option value="Half Day">Half Day (3-6h)</option>
            <option value="Absent">Absent (&lt;3h)</option>
            <option value="On Leave">On Leave</option>
          </select>

          {/* Single Date Filter */}
          <input
            type="date"
            value={date}
            onChange={(e) => {
              setDate(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />

          {date && (
            <button
              onClick={() => {
                setDate('');
                setPage(1);
              }}
              className="text-xs text-rose-600 hover:underline font-semibold"
            >
              Clear Date
            </button>
          )}

          <span className="text-xs text-slate-400 ml-auto font-medium">
            Found <strong>{total}</strong> attendance logs
          </span>
        </div>
      )}

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner label="Loading attendance logs..." />
        ) : records.length === 0 ? (
          <EmptyState
            icon={Clock}
            title="No attendance records match your criteria"
            description="Try modifying your date or department filters to see records."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Date</th>
                  {!isEmployee && <th className="py-3.5 px-4">Employee</th>}
                  <th className="py-3.5 px-4">Check In</th>
                  <th className="py-3.5 px-4">Check Out</th>
                  <th className="py-3.5 px-4">Hours Logged</th>
                  <th className="py-3.5 px-4">Shift Determination</th>
                  <th className="py-3.5 px-4">Notes / Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((rec) => (
                  <tr key={rec._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold font-mono text-slate-900 text-[11px]">
                      {formatDate(rec.date)}
                    </td>

                    {!isEmployee && (
                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {rec.employee?.name || 'Employee'}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {rec.employee?.designation}
                        </span>
                      </td>
                    )}

                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {formatTime(rec.checkIn)}
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {formatTime(rec.checkOut)}
                    </td>

                    <td className="py-3.5 px-4 font-bold font-mono text-indigo-600">
                      {rec.hoursWorked ? `${rec.hoursWorked} hrs` : '--'}
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant={rec.status} size="sm">
                        {rec.status}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 italic text-[11px] max-w-xs truncate">
                      {rec.remarks || '-'}
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
    </div>
  );
};

export default AttendanceHistory;
