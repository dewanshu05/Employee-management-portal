import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Building2,
  CalendarDays,
  CheckSquare,
  Clock,
  History,
  BarChart3,
  UserCheck,
  CreditCard,
  Settings,
  ShieldAlert,
  LogOut,
  X,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const role = user?.role || 'employee';

  const masterNav = [
    {
      group: 'PLATFORM GOVERNANCE',
      items: [
        { label: 'Master Dashboard', to: '/dashboard', icon: LayoutDashboard },
        { label: 'Client Organizations', to: '/organizations', icon: Building2 },
        { label: 'Global Settings', to: '/settings', icon: Settings },
      ],
    },
    {
      group: 'MASTER PROFILE',
      items: [
        { label: 'Master Dossier', to: '/profile', icon: UserCheck },
      ],
    },
  ];

  const adminHrNav = [
    {
      group: 'OVERVIEW',
      items: [
        { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      group: 'ORGANIZATION',
      items: [
        { label: 'Employees', to: '/employees', icon: Users },
        { label: 'Account Approvals', to: '/employees?status=pending', icon: ShieldAlert, badge: 'Pending' },
        { label: 'Add Employee', to: '/employees/new', icon: UserPlus },
        { label: 'Departments', to: '/departments', icon: Building2 },
      ],
    },
    {
      group: 'TIME & ATTENDANCE',
      items: [
        { label: 'Leave Approvals', to: '/leaves/approvals', icon: CheckSquare, badge: 'New' },
        { label: 'All Leaves', to: '/leaves/history', icon: CalendarDays },
        { label: 'Daily Attendance', to: '/attendance/track', icon: Clock },
        { label: 'Attendance Log', to: '/attendance/history', icon: History },
      ],
    },
    {
      group: 'INTELLIGENCE',
      items: [
        { label: 'Reports & Analytics', to: '/reports', icon: BarChart3 },
        ...(role === 'admin' || role === 'master'
          ? [{ label: 'System Settings', to: '/settings', icon: Settings }]
          : []),
      ],
    },
    {
      group: 'PERSONAL',
      items: [
        { label: 'My Profile', to: '/profile', icon: UserCheck },
        { label: 'Payroll Overview', to: '/payroll', icon: CreditCard },
      ],
    },
  ];

  const employeeNav = [
    {
      group: 'MAIN',
      items: [
        { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard },
      ],
    },
    {
      group: 'ATTENDANCE & LEAVES',
      items: [
        { label: 'Daily Check In/Out', to: '/attendance/track', icon: Clock },
        { label: 'Attendance History', to: '/attendance/history', icon: History },
        { label: 'Apply for Leave', to: '/leaves/apply', icon: CalendarDays },
        { label: 'Leave History & Balances', to: '/leaves/history', icon: CheckSquare },
      ],
    },
    {
      group: 'FINANCE & ACCOUNT',
      items: [
        { label: 'Payroll & Payslips', to: '/payroll', icon: CreditCard },
        { label: 'My Profile', to: '/profile', icon: UserCheck },
      ],
    },
  ];

  const navGroups = role === 'master' ? masterNav : role === 'employee' ? employeeNav : adminHrNav;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } no-print`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm shadow-indigo-500/30">
              EP
            </div>
            <div>
              <h1 className="font-bold text-white text-sm tracking-wide truncate max-w-[130px]">
                {role === 'master' ? 'MASTER CONSOLE' : user?.organization?.name || 'PORTAL HRMS'}
              </h1>
              <p className="text-[10px] text-indigo-400 font-medium tracking-wider uppercase">
                {role === 'master' ? 'Platform Creator' : 'Enterprise HRMS'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current User Quick Badge */}
        <div className="mx-4 my-3 p-3 rounded-xl bg-slate-800/60 border border-slate-800 flex items-center gap-3">
          <div className="relative">
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name}
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-500/20"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-bold text-sm ring-1 ring-indigo-500/30">
                {user?.name?.slice(0, 2).toUpperCase() || 'EM'}
              </div>
            )}
            <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-semibold text-white truncate">{user?.name}</h4>
            <p className="text-[11px] text-slate-400 truncate">
              {role === 'master'
                ? 'Platform Master'
                : role === 'admin'
                ? 'Organization Super Admin'
                : role === 'hr'
                ? 'HR Operations Lead'
                : user?.designation || 'Staff Member'}
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 px-3 py-2 space-y-6 overflow-y-auto">
          {navGroups.map((group, idx) => (
            <div key={idx}>
              <h5 className="px-3 text-[10px] font-semibold tracking-wider text-slate-400 uppercase mb-2">
                {group.group}
              </h5>
              <div className="space-y-1">
                {group.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => {
                      if (window.innerWidth < 1024) onClose();
                    }}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 ${
                        isActive
                          ? 'bg-indigo-600 text-white font-semibold shadow-sm shadow-indigo-600/30'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                      }`
                    }
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-4 h-4 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800/80">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
