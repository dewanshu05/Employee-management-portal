import { format, isValid } from 'date-fns';

export const formatDate = (date, formatStr = 'dd MMM yyyy') => {
  if (!date) return '-';
  const d = new Date(date);
  return isValid(d) ? format(d, formatStr) : '-';
};

export const formatDateTime = (date) => {
  if (!date) return '-';
  const d = new Date(date);
  return isValid(d) ? format(d, 'dd MMM yyyy, hh:mm a') : '-';
};

export const formatTime = (date) => {
  if (!date) return '--:--';
  const d = new Date(date);
  return isValid(d) ? format(d, 'hh:mm a') : '--:--';
};

export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '₹0';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const getLeaveStatusColor = (status) => {
  switch (status) {
    case 'Approved':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Pending':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Rejected':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'Cancelled':
      return 'bg-slate-100 text-slate-600 border-slate-200';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200';
  }
};

export const getAttendanceStatusColor = (status) => {
  switch (status) {
    case 'Present':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    case 'Half Day':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'Absent':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'On Leave':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    default:
      return 'bg-slate-50 text-slate-600 border-slate-200';
  }
};

export const calculateDaysExcludingWeekends = (startDate, endDate) => {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  if (start > end) return 0;

  let count = 0;
  const current = new Date(start);
  while (current <= end) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  return count;
};
