import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import SuperAdminDashboard from './SuperAdminDashboard';
import HRDashboard from './HRDashboard';
import EmployeeDashboard from './EmployeeDashboard';
import OrganizationsManagement from '../organizations/OrganizationsManagement';

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // If user is Platform Maker, immediately render Master Governance Console
  if (user?.role === 'master') {
    return <OrganizationsManagement />;
  }

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/reports/dashboard');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard:', err);
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return <LoadingSpinner label="Loading dashboard metrics..." />;
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-rose-200">
        <p className="text-sm font-semibold text-rose-600 mb-2">{error}</p>
        <button
          onClick={fetchDashboard}
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!data) return null;

  if (data.role === 'master') {
    return <OrganizationsManagement />;
  }

  if (data.role === 'admin') {
    return <SuperAdminDashboard data={data} onRefresh={fetchDashboard} />;
  }

  if (data.role === 'hr') {
    return <HRDashboard data={data} onRefresh={fetchDashboard} />;
  }

  return <EmployeeDashboard data={data} onRefresh={fetchDashboard} />;
};

export default Dashboard;
