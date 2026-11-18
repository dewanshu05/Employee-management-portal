import React, { useState } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Breadcrumb from '../../components/common/Breadcrumb';
import Badge from '../../components/common/Badge';
import { formatDate, formatCurrency } from '../../utils/formatters';
import {
  User,
  Mail,
  Phone,
  Building2,
  Calendar,
  Lock,
  Save,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Shield,
} from 'lucide-react';

const MyProfile = () => {
  const { user, updateUser } = useAuth();

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    profileImage: user?.profileImage || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ text: '', type: '' });
  const [passwordMsg, setPasswordMsg] = useState({ text: '', type: '' });

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg({ text: '', type: '' });

    try {
      setProfileSaving(true);
      const res = await api.put('/auth/profile', profileData);
      if (res.data.success) {
        updateUser(res.data.user);
        setProfileMsg({ text: 'Profile updated successfully!', type: 'success' });
      }
    } catch (err) {
      setProfileMsg({
        text: err.response?.data?.message || 'Failed to update profile',
        type: 'error',
      });
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg({ text: '', type: '' });

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordMsg({ text: 'New passwords do not match', type: 'error' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordMsg({ text: 'New password must be at least 6 characters long', type: 'error' });
      return;
    }

    try {
      setPasswordSaving(true);
      const res = await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (res.data.success) {
        setPasswordMsg({ text: 'Password changed successfully!', type: 'success' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setPasswordMsg({
        text: err.response?.data?.message || 'Failed to update password',
        type: 'error',
      });
    } finally {
      setPasswordSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Breadcrumb items={[{ label: 'My Profile & Credentials' }]} />

      {/* Header Profile Dossier Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          {user?.profileImage ? (
            <img
              src={user.profileImage}
              alt={user.name}
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-indigo-50 shadow-md"
            />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-indigo-600/30">
              {user?.name?.slice(0, 2).toUpperCase() || 'ME'}
            </div>
          )}

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{user?.name}</h1>
              <Badge variant={user?.role} size="sm">
                {user?.role === 'admin'
                  ? 'Super Admin'
                  : user?.role === 'hr'
                  ? 'HR Manager'
                  : 'Employee'}
              </Badge>
            </div>
            <p className="text-xs sm:text-sm font-medium text-slate-500">
              {user?.designation} • {user?.department?.name || 'General Department'}
            </p>
            <p className="text-xs text-slate-400 font-mono">{user?.email}</p>
          </div>
        </div>

        <div className="text-right sm:border-l sm:border-slate-100 sm:pl-6 text-xs text-slate-500 space-y-1">
          <p>
            Joined: <strong className="text-slate-800">{formatDate(user?.joiningDate)}</strong>
          </p>
          <p>
            Account Status: <strong className="text-emerald-600 capitalize">{user?.status}</strong>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Edit Contact Info */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-600" />
            <span>Update Profile Information</span>
          </h3>

          {profileMsg.text && (
            <div
              className={`my-3 p-3 rounded-xl text-xs flex items-center gap-2 ${
                profileMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {profileMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{profileMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4 mt-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Full Name</label>
              <input
                type="text"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Phone Number</label>
              <input
                type="text"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Profile Avatar URL</label>
              <input
                type="url"
                value={profileData.profileImage}
                onChange={(e) =>
                  setProfileData({ ...profileData, profileImage: e.target.value })
                }
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <button
              type="submit"
              disabled={profileSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/20 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{profileSaving ? 'Saving...' : 'Save Profile'}</span>
            </button>
          </form>
        </div>

        {/* Card 2: Security & Password */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-indigo-600" />
            <span>Security & Password</span>
          </h3>

          {passwordMsg.text && (
            <div
              className={`my-3 p-3 rounded-xl text-xs flex items-center gap-2 ${
                passwordMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-rose-50 text-rose-800 border border-rose-200'
              }`}
            >
              {passwordMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{passwordMsg.text}</span>
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4 mt-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Current Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, currentPassword: e.target.value })
                }
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                New Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
                placeholder="Minimum 6 characters"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Confirm New Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
                placeholder="Re-type new password"
                required
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>

            <button
              type="submit"
              disabled={passwordSaving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-slate-800 hover:bg-slate-900 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Shield className="w-4 h-4" />
              <span>{passwordSaving ? 'Updating...' : 'Change Password'}</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
