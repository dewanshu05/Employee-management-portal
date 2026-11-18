import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import Breadcrumb from '../../components/common/Breadcrumb';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { formatDate } from '../../utils/formatters';
import {
  Building2,
  ShieldCheck,
  ShieldAlert,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  Eye,
  Users,
  Mail,
  Phone,
  MapPin,
  ExternalLink,
  RefreshCw,
  Sparkles,
} from 'lucide-react';

const OrganizationsManagement = () => {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [metrics, setMetrics] = useState({
    totalOrganizations: 0,
    pendingOrganizations: 0,
    activeOrganizations: 0,
    totalPlatformUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchMetrics = async () => {
    try {
      const res = await api.get('/organizations/master/metrics');
      if (res.data.success) {
        setMetrics(res.data.metrics);
      }
    } catch (err) {
      console.error('Failed to load platform metrics:', err);
    }
  };

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const params = {
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: search.trim() || undefined,
      };
      const res = await api.get('/organizations', { params });
      if (res.data.success) {
        setOrganizations(res.data.organizations || []);
      }
    } catch (err) {
      console.error('Failed to load organizations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    fetchOrganizations();
  }, [statusFilter]);

  const handleApprove = async (org) => {
    if (!window.confirm(`Are you sure you want to approve and activate "${org.name}"? This will unlock access for their Organization Super Admin.`)) {
      return;
    }

    try {
      setActionLoadingId(org._id);
      const res = await api.patch(`/organizations/${org._id}/approve`);
      alert(res.data.message || 'Organization approved successfully.');
      fetchMetrics();
      fetchOrganizations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to approve organization.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (org) => {
    const reason = window.prompt(`Provide rejection reason for "${org.name}":`, 'Compliance credentials could not be verified.');
    if (reason === null) return;

    try {
      setActionLoadingId(org._id);
      const res = await api.patch(`/organizations/${org._id}/reject`, { remarks: reason });
      alert(res.data.message || 'Organization rejected.');
      fetchMetrics();
      fetchOrganizations();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to reject organization.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <Breadcrumb items={[{ label: 'Platform Governance' }, { label: 'Organizations' }]} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Platform Master Console
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Client Organizations & Compliance Approvals
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Review official company registration dossiers, verify Tax ID/corporate records, and authorize organization workspaces.
          </p>
        </div>

        <button
          onClick={() => {
            fetchMetrics();
            fetchOrganizations();
          }}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Platform Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Companies</span>
            <Building2 className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">{metrics.totalOrganizations}</div>
          <div className="mt-1 text-[11px] text-slate-400">Registered platform tenants</div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">Pending Review</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-amber-950">{metrics.pendingOrganizations}</div>
          <div className="mt-1 text-[11px] text-amber-700 font-medium">Awaiting master clearance</div>
        </div>

        <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">Active Tenants</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-950">{metrics.activeOrganizations}</div>
          <div className="mt-1 text-[11px] text-emerald-700 font-medium">Verified & operational</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Global Workforce</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900">{metrics.totalPlatformUsers}</div>
          <div className="mt-1 text-[11px] text-slate-400">Total staff across all tenants</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchOrganizations();
          }}
          className="relative flex-1"
        >
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company name, Tax ID, or business email..."
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </form>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Master Review</option>
            <option value="active">Active & Operational</option>
            <option value="rejected">Rejected / Inactive</option>
          </select>
        </div>
      </div>

      {/* Organizations Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <LoadingSpinner label="Loading organization records..." />
        ) : organizations.length === 0 ? (
          <EmptyState
            title="No organizations match your query"
            description="When companies register their official business credentials, they will appear here for verification."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Company & Identification</th>
                  <th className="py-3 px-4">Industry & Size</th>
                  <th className="py-3 px-4">Primary Administrator</th>
                  <th className="py-3 px-4">Submission Date</th>
                  <th className="py-3 px-4">Compliance Status</th>
                  <th className="py-3 px-4 text-right">Master Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {organizations.map((org) => {
                  const isPending = org.status === 'pending';
                  const isActionLoading = actionLoadingId === org._id;

                  return (
                    <tr key={org._id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Company Name & Registration */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5 flex-wrap">
                          <span>{org.name}</span>
                          {org.orgCode && (
                            <span className="px-2 py-0.5 rounded-md bg-purple-50 border border-purple-200 text-purple-700 text-[10px] font-mono font-extrabold">
                              Code: {org.orgCode}
                            </span>
                          )}
                          {org.legalEntityType && (
                            <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-semibold">
                              {org.legalEntityType}
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-600 font-mono mt-1 space-y-0.5">
                          <div>
                            <span className="text-slate-400 font-medium">CIN:</span>{' '}
                            <span className="font-semibold text-slate-800">{org.cin || org.registrationNumber}</span>
                          </div>
                          {org.gstin && (
                            <div>
                              <span className="text-slate-400 font-medium">GSTIN:</span>{' '}
                              <span className="font-semibold text-emerald-700">{org.gstin}</span>
                            </div>
                          )}
                          {org.pan && (
                            <div>
                              <span className="text-slate-400 font-medium">PAN:</span>{' '}
                              <span className="font-semibold text-slate-700">{org.pan}</span>
                            </div>
                          )}
                          <div className="text-indigo-600">
                            {org.city ? `${org.city}, ${org.state}` : org.state || 'India'}
                          </div>
                        </div>
                      </td>

                      {/* Industry & Size */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-700">{org.industry}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          <span>{org.companySize} employees ({org.memberCount || 0} enrolled)</span>
                        </div>
                      </td>

                      {/* Primary Admin */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{org.owner?.name || 'Unassigned'}</div>
                        <div className="text-[11px] text-slate-500 font-mono mt-0.5">{org.owner?.email}</div>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-slate-500 font-mono text-[11px]">
                        {formatDate(org.createdAt)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                            org.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : org.status === 'pending'
                              ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-current" />
                          {org.status === 'pending'
                            ? 'Pending Master Review'
                            : org.status === 'active'
                            ? 'Approved & Active'
                            : 'Rejected / Inactive'}
                        </span>
                      </td>

                      {/* Master Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          {isPending && (
                            <>
                              <button
                                onClick={() => handleApprove(org)}
                                disabled={isActionLoading}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1 shadow-sm transition-colors cursor-pointer disabled:opacity-60"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Approve Organization</span>
                              </button>

                              <button
                                onClick={() => handleReject(org)}
                                disabled={isActionLoading}
                                className="p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                                title="Reject Registration"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}

                          {org.status === 'active' && (
                            <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                              <ShieldCheck className="w-4 h-4" /> Operational
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizationsManagement;
