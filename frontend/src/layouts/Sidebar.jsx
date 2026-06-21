import React, { useContext, useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  LayoutDashboard, 
  Search, 
  Briefcase, 
  ClipboardList, 
  Bookmark, 
  UserCircle, 
  Settings, 
  LogOut,
  Users,
  BarChart3,
  FileText,
  PlusCircle,
  ShieldCheck,
  Bell,
  MessageSquare
} from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user?.id) fetchUnreadCount();
    
    // Refresh every minute to keep it updated
    const interval = setInterval(() => {
      if (user?.id) fetchUnreadCount();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [user]);

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get(`/notifications/${user.id}`);
      const count = res.data.filter(n => !n.read).length;
      setUnreadCount(count);
    } catch (err) { console.error('Sidebar notification fetch failed'); }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const seekerItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Browse Jobs', path: '/jobs', icon: Search },
    { name: 'Applied Jobs', path: '/my-applications', icon: ClipboardList },
    { name: 'Saved Jobs', path: '/saved-jobs', icon: Bookmark },
    { name: 'My Interviews', path: '/interviews', icon: MessageSquare },
    { name: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
    { name: 'Profile Setting', path: '/profile', icon: UserCircle },
  ];

  const recruiterItems = [
    { name: 'Dashboard', path: '/recruiter/dashboard', icon: LayoutDashboard },
    { name: 'Post Job', path: '/recruiter/post-job', icon: PlusCircle },
    { name: 'Manage Jobs', path: '/recruiter/jobs', icon: Briefcase },
    { name: 'Applications', path: '/recruiter/applicants', icon: Users },
    { name: 'Profile Setting', path: '/recruiter/profile', icon: UserCircle },
    { name: 'Analytics', path: '/recruiter/analytics', icon: BarChart3 },
  ];

  const securityItems = [
    { name: 'Dashboard', path: '/recruiter/dashboard', icon: LayoutDashboard },
    { name: 'Security Center', path: '/recruiter/security/dashboard', icon: ShieldCheck },
    { name: 'Profile Setting', path: '/recruiter/profile', icon: UserCircle },
  ];


  const adminItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Recruiter Verification', path: '/admin/security', icon: ShieldCheck },
    { name: 'Manage Users', path: '/admin/users', icon: Users },
    { name: 'Manage Jobs', path: '/admin/jobs', icon: Briefcase },
    { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
    { name: 'Profile Setting', path: '/profile', icon: UserCircle },
  ];

  const getItems = () => {
    if (!user) return [];
    if (user.role === 'ADMIN') return adminItems;
    if (user.role === 'SECURITY_ADMIN') return securityItems;
    if (user.role === 'RECRUITER') return recruiterItems;

    return seekerItems;
  };

  const navItems = getItems();

  return (
    <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-100 dark:border-slate-800 h-screen fixed left-0 top-0 flex flex-col z-50 transition-colors">
      {/* Sidebar Logo */}
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#0052cc] rounded-lg flex items-center justify-center text-white shadow-sm">
            <Briefcase size={22} fill="currentColor" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-heading font-bold text-slate-900 dark:text-white leading-tight">Job Portal</span>
            <span className="text-[10px] text-slate-400 font-medium tracking-tight">Find Your Dream Job</span>
          </div>
        </div>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 px-3 space-y-1 mt-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => `
              flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 group
              ${isActive 
                ? 'bg-[#0052cc] text-white shadow-md' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'}
            `}
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center space-x-3">
                  <item.icon size={18} className={isActive ? 'text-white' : ''} />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                {item.badge && (
                  <span className="w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout Section */}
      <div className="p-4 border-t border-slate-50 dark:border-slate-800">
        <button 
          onClick={handleLogout}
          className="flex items-center space-x-3 px-4 py-3 w-full text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-all duration-200"
        >
          <LogOut size={18} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
