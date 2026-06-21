import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Register from './pages/Register';
import RecruiterDashboard from './pages/RecruiterDashboard';
import AdminDashboard from './pages/AdminDashboard';
import RecruiterLayout from './layouts/RecruiterLayout';
import RecruiterOverview from './pages/RecruiterOverview';
import SavedJobs from './pages/SavedJobs';
import RecruiterJobs from './pages/RecruiterJobs';
import RecruiterApplicants from './pages/RecruiterApplicants';
import Profile from './pages/Profile';
import Jobs from './pages/Jobs';
import MyApplications from './pages/MyApplications';
import Notifications from './pages/Notifications';
import MainLayout from './layouts/MainLayout';
import Dashboard from './pages/Dashboard';
import JobDetails from './pages/JobDetails';
import { ResumeUpload, Analytics, Reports } from './pages/PlaceholderPages';

import Home from './pages/Home';
import Interviews from './pages/Interviews';
import AiMatcher from './pages/AiMatcher';
import SecurityDashboard from './pages/SecurityDashboard';



const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes (no auth required) */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/register" element={<Register />} />

        {/* Recruiter Dashboard Routes (Sidebar Layout) â€” Recruiter & Security Admin only */}
        <Route path="/recruiter" element={
          <ProtectedRoute allowedRoles={['RECRUITER', 'SECURITY_ADMIN', 'ADMIN']}>
            <RecruiterLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<RecruiterOverview />} />
          <Route path="jobs" element={<RecruiterJobs />} />
          <Route path="applicants" element={<RecruiterApplicants />} />
          <Route path="ai-matcher" element={<AiMatcher />} />
          <Route path="security/dashboard" element={
            <ProtectedRoute allowedRoles={['SECURITY_ADMIN', 'ADMIN']}>
              <SecurityDashboard />
            </ProtectedRoute>
          } />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Main Layout Routes â€” require authentication */}
        <Route element={<MainLayout />}>
          {/* Public home page */}
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetails />} />

          {/* Protected routes â€” any authenticated user */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/notifications" element={
            <ProtectedRoute>
              <Notifications />
            </ProtectedRoute>
          } />

          {/* Job Seeker routes */}
          <Route path="/my-applications" element={
            <ProtectedRoute allowedRoles={['JOB_SEEKER']}>
              <MyApplications />
            </ProtectedRoute>
          } />
          <Route path="/saved-jobs" element={
            <ProtectedRoute allowedRoles={['JOB_SEEKER']}>
              <SavedJobs />
            </ProtectedRoute>
          } />
          <Route path="/resume-upload" element={
            <ProtectedRoute allowedRoles={['JOB_SEEKER']}>
              <ResumeUpload />
            </ProtectedRoute>
          } />
          <Route path="/interviews" element={
            <ProtectedRoute>
              <Interviews />
            </ProtectedRoute>
          } />

          {/* Admin routes */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/jobs" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/reports" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <Reports />
            </ProtectedRoute>
          } />
          <Route path="/admin/security" element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <SecurityDashboard />
            </ProtectedRoute>
          } />

          {/* Recruiter analytics */}
          <Route path="/recruiter/analytics" element={
            <ProtectedRoute allowedRoles={['RECRUITER']}>
              <Analytics />
            </ProtectedRoute>
          } />
        </Route>
        
        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

    </BrowserRouter>
  );
};

const AppWrapper = () => (
  <AuthProvider>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </AuthProvider>
);

export default AppWrapper;
