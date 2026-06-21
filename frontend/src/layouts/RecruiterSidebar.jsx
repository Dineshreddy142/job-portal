import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  MessageSquare, 
  Bell, 
  UserCircle, 
  LogOut,
  PlusCircle,
  ShieldCheck
} from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const RecruiterSidebar = () => {
  const { logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const navItems = user?.role === 'SECURITY_ADMIN' 
    ? [
        { name: 'Security Center', path: '/recruiter/security/dashboard', icon: LayoutDashboard },
        { name: 'Profile Setting', path: '/recruiter/profile', icon: UserCircle },
      ]
    : [
        { name: 'Dashboard', path: '/recruiter/dashboard', icon: LayoutDashboard },
        { name: 'Manage Jobs', path: '/recruiter/jobs', icon: Briefcase },
        { name: 'Applicants', path: '/recruiter/applicants', icon: Users },
        { name: 'Profile Setting', path: '/recruiter/profile', icon: UserCircle },
      ];

  return (
    <div className="w-64 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 h-screen fixed left-0 top-0 flex flex-col z-50 transition-all shadow-xl">
      <div className="p-8">
        <div className="flex items-center space-x-3 group cursor-pointer">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl flex items-center justify-center text-white font-bold text-2xl shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">J</div>
          <div className="flex flex-col">
            <span className="text-xl font-heading font-bold text-slate-900 dark:text-white tracking-tighter leading-none">Job Portal</span>
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] mt-1">
              {user?.role === 'SECURITY_ADMIN' ? 'Security Team' : 'Recruiter'}
            </span>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `
              flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all duration-300 relative group
              ${isActive 
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold shadow-lg shadow-blue-500/20' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white'}
            `}
          >
            <item.icon size={20} className={({ isActive }) => isActive ? 'text-white' : 'group-hover:scale-110 transition-transform'} />
            <span className="text-sm tracking-wide">{item.name}</span>
            {/* Subtle glow effect for active item */}
          </NavLink>
        ))}
      </nav>

      <div className="p-6">
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 mb-6 border border-slate-100 dark:border-slate-700">
           <div className="flex items-center space-x-3 mb-3">
             <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Status</span>
           </div>
           <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-medium">All systems operational. No reported issues.</p>
        </div>

        <button 
          onClick={() => { logout(); navigate('/login'); }}
          className="flex items-center space-x-3 px-4 py-3 w-full text-slate-500 dark:text-slate-400 hover:text-rose-600 hover:bg-rose-500/5 rounded-2xl transition-all duration-300 font-bold text-sm"
        >
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default RecruiterSidebar;
