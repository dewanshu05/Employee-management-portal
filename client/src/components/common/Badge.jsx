import React from 'react';

const Badge = ({ variant = 'default', children, className = '', size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  const variantClasses = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    primary: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border-rose-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
    purple: 'bg-purple-50 text-purple-700 border-purple-200',
    
    // Status mappings
    Active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Inactive: 'bg-slate-100 text-slate-600 border-slate-200',
    inactive: 'bg-slate-100 text-slate-600 border-slate-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    'Pending Approval': 'bg-amber-50 text-amber-700 border-amber-200 font-semibold',
    
    // Attendance mappings
    Present: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Half Day': 'bg-amber-50 text-amber-700 border-amber-200',
    Absent: 'bg-rose-50 text-rose-700 border-rose-200',
    'On Leave': 'bg-blue-50 text-blue-700 border-blue-200',
    
    // Leave mappings
    Approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    Pending: 'bg-amber-50 text-amber-700 border-amber-200',
    Rejected: 'bg-rose-50 text-rose-700 border-rose-200',
    Cancelled: 'bg-slate-100 text-slate-600 border-slate-200',

    // Role mappings
    admin: 'bg-purple-50 text-purple-700 border-purple-200 font-semibold',
    hr: 'bg-indigo-50 text-indigo-700 border-indigo-200 font-semibold',
    employee: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const matchedClass = variantClasses[variant] || variantClasses.default;

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${sizeClasses[size]} ${matchedClass} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-70"></span>
      {children}
    </span>
  );
};

export default Badge;
