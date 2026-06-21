import React from 'react';
import { Outlet } from 'react-router-dom';
import RecruiterSidebar from './RecruiterSidebar';
import RecruiterNavbar from './RecruiterNavbar';
import { AuthContext } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import api from '../services/api';

const RecruiterLayout = () => {
  const { user, loading, updateUser } = React.useContext(AuthContext);
  
  React.useEffect(() => {
    const refreshStatus = async () => {
      if (user?.id) {
        try {
          const res = await api.get(`/users/${user.id}`);
          if (res.data.isVerified !== user.isVerified) {
            updateUser({ isVerified: res.data.isVerified });
          }
        } catch (err) {
          console.error("Failed to refresh verification status", err);
        }
      }
    };
    refreshStatus();
  }, [user?.id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50 font-bold text-slate-400 animate-pulse">Loading Workspace...</div>;
  if (!user || (user.role !== 'RECRUITER' && user.role !== 'SECURITY_ADMIN' && user.role !== 'ADMIN')) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-[#f3f4f6] dark:bg-slate-950 transition-colors">
      <RecruiterSidebar />
      <div className="pl-64">
        <RecruiterNavbar />
        <main className="pt-28 pb-12 px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default RecruiterLayout;
