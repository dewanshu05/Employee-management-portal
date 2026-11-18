import React from 'react';

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendPositive = true,
  color = 'indigo',
}) => {
  const colorSchemes = {
    indigo: {
      bg: 'bg-indigo-50 text-indigo-600',
      border: 'border-slate-200/80',
    },
    emerald: {
      bg: 'bg-emerald-50 text-emerald-600',
      border: 'border-slate-200/80',
    },
    amber: {
      bg: 'bg-amber-50 text-amber-600',
      border: 'border-slate-200/80',
    },
    rose: {
      bg: 'bg-rose-50 text-rose-600',
      border: 'border-slate-200/80',
    },
    sky: {
      bg: 'bg-sky-50 text-sky-600',
      border: 'border-slate-200/80',
    },
    purple: {
      bg: 'bg-purple-50 text-purple-600',
      border: 'border-slate-200/80',
    },
  };

  const scheme = colorSchemes[color] || colorSchemes.indigo;

  return (
    <div className={`bg-white rounded-2xl border ${scheme.border} p-5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">
            {value}
          </h3>
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${scheme.bg} group-hover:scale-110 transition-transform duration-200`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {(subtitle || trend) && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          {subtitle && <span className="text-slate-500">{subtitle}</span>}
          {trend && (
            <span
              className={`font-medium ${
                trendPositive ? 'text-emerald-600' : 'text-rose-600'
              }`}
            >
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default StatCard;
