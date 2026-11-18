import React, { useState } from 'react';
import Breadcrumb from '../../components/common/Breadcrumb';
import {
  Settings,
  Calendar,
  Clock,
  Building,
  Save,
  CheckCircle2,
  Shield,
  Sliders,
} from 'lucide-react';

const SystemSettings = () => {
  const [settings, setSettings] = useState({
    companyName: 'Acme Enterprise Corporation',
    companyDomain: 'company.com',
    supportEmail: 'hr-support@company.com',
    casualLeaveQuota: 12,
    sickLeaveQuota: 10,
    earnedLeaveQuota: 15,
    maternityLeaveQuota: 180,
    paternityLeaveQuota: 15,
    fullDayMinHours: 6,
    halfDayMinHours: 3,
    weekendExclusionEnabled: true,
  });

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Breadcrumb items={[{ label: 'System Settings & Leave Policies' }]} />

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
          System Policies & Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Configure organization leave allocations, daily shift thresholds, and system constants
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>System configuration parameters saved successfully!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Card 1: Leave Policies */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-600" />
            <span>Default Annual Leave Allocations (Days)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Casual Leave Annual Quota
              </label>
              <input
                type="number"
                value={settings.casualLeaveQuota}
                onChange={(e) =>
                  setSettings({ ...settings, casualLeaveQuota: Number(e.target.value) })
                }
                min="1"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-indigo-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Sick Leave Annual Quota
              </label>
              <input
                type="number"
                value={settings.sickLeaveQuota}
                onChange={(e) =>
                  setSettings({ ...settings, sickLeaveQuota: Number(e.target.value) })
                }
                min="1"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-rose-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Earned Leave Annual Quota
              </label>
              <input
                type="number"
                value={settings.earnedLeaveQuota}
                onChange={(e) =>
                  setSettings({ ...settings, earnedLeaveQuota: Number(e.target.value) })
                }
                min="1"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-emerald-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Maternity Leave Quota
              </label>
              <input
                type="number"
                value={settings.maternityLeaveQuota}
                onChange={(e) =>
                  setSettings({ ...settings, maternityLeaveQuota: Number(e.target.value) })
                }
                min="1"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-purple-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Paternity Leave Quota
              </label>
              <input
                type="number"
                value={settings.paternityLeaveQuota}
                onChange={(e) =>
                  setSettings({ ...settings, paternityLeaveQuota: Number(e.target.value) })
                }
                min="1"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold text-teal-600"
              />
            </div>

            <div className="flex items-center pt-6">
              <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={settings.weekendExclusionEnabled}
                  onChange={(e) =>
                    setSettings({ ...settings, weekendExclusionEnabled: e.target.checked })
                  }
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                />
                <span>Exclude Saturdays & Sundays from Leave Count</span>
              </label>
            </div>
          </div>
        </div>

        {/* Card 2: Attendance Determination Thresholds */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <span>Shift Determination Thresholds (Hours)</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Full-Day "Present" Minimum Threshold (Hours)
              </label>
              <input
                type="number"
                value={settings.fullDayMinHours}
                onChange={(e) =>
                  setSettings({ ...settings, fullDayMinHours: Number(e.target.value) })
                }
                min="1"
                max="12"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Logged shifts exceeding {settings.fullDayMinHours} hours are automatically marked "Present".
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                "Half-Day" Minimum Threshold (Hours)
              </label>
              <input
                type="number"
                value={settings.halfDayMinHours}
                onChange={(e) =>
                  setSettings({ ...settings, halfDayMinHours: Number(e.target.value) })
                }
                min="1"
                max="8"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 font-bold"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Logged shifts between {settings.halfDayMinHours} and {settings.fullDayMinHours} hours are marked "Half Day".
              </span>
            </div>
          </div>
        </div>

        {/* Card 3: Organization Details */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100 flex items-center gap-2">
            <Building className="w-4 h-4 text-indigo-600" />
            <span>Company Branding & Identifiers</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Company Legal Name</label>
              <input
                type="text"
                value={settings.companyName}
                onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Primary Domain</label>
              <input
                type="text"
                value={settings.companyDomain}
                onChange={(e) => setSettings({ ...settings, companyDomain: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">Support Desk Email</label>
              <input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm shadow-indigo-600/30 transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Settings...' : 'Save Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default SystemSettings;
