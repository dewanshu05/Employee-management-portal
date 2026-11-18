import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardLayout from './layouts/DashboardLayout';
import LoadingSpinner from './components/common/LoadingSpinner';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import RegisterOrganization from './pages/auth/RegisterOrganization';
import ForgotPassword from './pages/auth/ForgotPassword';
import PendingApproval from './pages/auth/PendingApproval';
import Dashboard from './pages/dashboard/Dashboard';
import OrganizationsManagement from './pages/organizations/OrganizationsManagement';
import EmployeeList from './pages/employees/EmployeeList';
import AddEmployee from './pages/employees/AddEmployee';
import EditEmployee from './pages/employees/EditEmployee';
import EmployeeDetails from './pages/employees/EmployeeDetails';
import LeaveApplication from './pages/leaves/LeaveApplication';
import LeaveApproval from './pages/leaves/LeaveApproval';
import LeaveHistory from './pages/leaves/LeaveHistory';
import AttendanceTracker from './pages/attendance/AttendanceTracker';
import AttendanceHistory from './pages/attendance/AttendanceHistory';
import DepartmentManagement from './pages/departments/DepartmentManagement';
import ReportsAnalytics from './pages/reports/ReportsAnalytics';
import MyProfile from './pages/profile/MyProfile';
import PayrollOverview from './pages/payroll/PayrollOverview';
import SystemSettings from './pages/settings/SystemSettings';
import NotFound from './pages/NotFound';

// Role Guard Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingSpinner label="Authenticating session..." fullScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.status === 'pending') {
    return <Navigate to="/pending-approval" replace state={{ user }} />;
  }

  if (user?.status === 'inactive') {
    return <Navigate to="/login" replace state={{ message: 'Account deactivated' }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Public Route Guard (Redirects to dashboard if already signed in)
const PublicRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner label="Checking credentials..." fullScreen />;
  }

  if (isAuthenticated) {
    if (user?.status === 'pending') {
      return <Navigate to="/pending-approval" replace state={{ user }} />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication & Recovery Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/admin/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/hr/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/employee/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route path="/register" element={<Register />} />
          <Route path="/register-organization" element={<RegisterOrganization />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/pending-approval" element={<PendingApproval />} />

          {/* Protected Application Routes wrapped in DashboardLayout */}
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            {/* Index Redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Dashboard (Role-specific view) */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Employee Management (HR & Super Admin) */}
            <Route
              path="/employees"
              element={
                <ProtectedRoute allowedRoles={['admin', 'hr']}>
                  <EmployeeList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employees/new"
              element={
                <ProtectedRoute allowedRoles={['admin', 'hr']}>
                  <AddEmployee />
                </ProtectedRoute>
              }
            />
            <Route
              path="/employees/:id/edit"
              element={
                <ProtectedRoute allowedRoles={['admin', 'hr']}>
                  <EditEmployee />
                </ProtectedRoute>
              }
            />
            <Route path="/employees/:id" element={<EmployeeDetails />} />

            {/* Leave Management */}
            <Route path="/leaves/apply" element={<LeaveApplication />} />
            <Route
              path="/leaves/approvals"
              element={
                <ProtectedRoute allowedRoles={['admin', 'hr']}>
                  <LeaveApproval />
                </ProtectedRoute>
              }
            />
            <Route path="/leaves/history" element={<LeaveHistory />} />

            {/* Attendance Management */}
            <Route path="/attendance/track" element={<AttendanceTracker />} />
            <Route path="/attendance/history" element={<AttendanceHistory />} />

            {/* Department Management */}
            <Route path="/departments" element={<DepartmentManagement />} />

            {/* Reports and Analytics (HR & Super Admin) */}
            <Route
              path="/reports"
              element={
                <ProtectedRoute allowedRoles={['admin', 'hr']}>
                  <ReportsAnalytics />
                </ProtectedRoute>
              }
            />

            {/* Master Platform Governance (Platform Maker Only) */}
            <Route
              path="/organizations"
              element={
                <ProtectedRoute allowedRoles={['master']}>
                  <OrganizationsManagement />
                </ProtectedRoute>
              }
            />

            {/* Profile & Payroll (All Roles) */}
            <Route path="/profile" element={<MyProfile />} />
            <Route path="/payroll" element={<PayrollOverview />} />

            {/* System Settings (Super Admin & Master) */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute allowedRoles={['admin', 'master']}>
                  <SystemSettings />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* 404 Not Found Catch-All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
