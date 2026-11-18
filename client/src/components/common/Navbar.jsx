import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Menu,
  Bell,
  Search,
  User,
  LogOut,
  Clock,
  Shield,
  Briefcase,
  ChevronDown,
  ExternalLink,
  Building2,
} from 'lucide-react';

const Navbar = ({ onOpenSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('#user-menu-btn') && !e.target.closest('#user-dropdown')) {
        setProfileDropdownOpen(false);
      }
      if (!e.target.closest('#notif-btn') && !e.target.closest('#notif-dropdown')) {
        setNotificationsOpen(false);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between no-print">
      {/* Left: Mobile Toggle & Page Greeting */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition-colors"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
          <Clock className="w-3.5 h-3.5 text-indigo-600" />
          <span>
            {currentTime.toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
          <span className="text-slate-300">•</span>
          <span className="font-mono text-slate-700">
            {currentTime.toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
            })}
          </span>
        </div>
      </div>

      {/* Right: Actions, Notifications, Profile */}
      <div className="flex items-center gap-3">
        {/* Company Organization Code Badge */}
        {user?.organization && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <Building2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span className="font-bold text-slate-800">{user.organization.name}</span>
            {user.organization.orgCode && (
              <span className="font-mono font-extrabold text-[10px] text-purple-700 bg-purple-50 border border-purple-200 px-1.5 py-0.5 rounded">
                Code: {user.organization.orgCode}
              </span>
            )}
          </div>
        )}

        {/* Quick Check-in Button for Employee */}
        <Link
          to="/attendance/track"
          className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-xl hover:bg-indigo-100/80 transition-colors"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Attendance Clock</span>
        </Link>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            id="notif-btn"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="p-2 text-slate-500 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white" />
          </button>

          {notificationsOpen && (
            <div
              id="notif-dropdown"
              className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Notifications
                </h4>
                <span className="text-[10px] bg-indigo-50 text-indigo-600 font-bold px-2 py-0.5 rounded-full">
                  Portal Updates
                </span>
              </div>
              <div className="divide-y divide-slate-100 text-xs">
                {user?.role !== 'employee' ? (
                  <Link
                    to="/leaves/approvals"
                    onClick={() => setNotificationsOpen(false)}
                    className="block px-4 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <p className="font-semibold text-slate-800">Pending Leave Approvals</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Review submitted leave requests awaiting decision.
                    </p>
                  </Link>
                ) : (
                  <Link
                    to="/leaves/history"
                    onClick={() => setNotificationsOpen(false)}
                    className="block px-4 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <p className="font-semibold text-slate-800">Leave Balance Status</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Check your updated leave balances and approvals.
                    </p>
                  </Link>
                )}
                <div className="px-4 py-2.5 bg-slate-50/50 text-[11px] text-slate-400 text-center">
                  All systems operational • MongoDB Connected
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <div className="relative">
          <button
            id="user-menu-btn"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name}
                className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-200"
              />
            ) : (
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                {user?.name?.slice(0, 2).toUpperCase() || 'U'}
              </div>
            )}
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-slate-800 leading-none">{user?.name}</p>
              <p className="text-[10px] text-slate-500 capitalize mt-0.5">
                {user?.role === 'admin' ? 'Super Admin' : user?.role === 'hr' ? 'HR Manager' : 'Employee'}
              </p>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {profileDropdownOpen && (
            <div
              id="user-dropdown"
              className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50 animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="px-4 py-2.5 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
              </div>

              <div className="py-1 text-xs">
                <Link
                  to="/profile"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>My Profile</span>
                </Link>
                <Link
                  to="/payroll"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                >
                  <Briefcase className="w-4 h-4" />
                  <span>Payroll & Payslip</span>
                </Link>
                {user?.role === 'admin' && (
                  <Link
                    to="/settings"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                  >
                    <Shield className="w-4 h-4" />
                    <span>System Settings</span>
                  </Link>
                )}
              </div>

              <div className="pt-1 border-t border-slate-100">
                <button
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
