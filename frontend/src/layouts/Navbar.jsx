import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun, Menu, X, Search, Bell } from 'lucide-react';
import Button from '../components/common/Button';
import SecureImage from '../components/common/SecureImage';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (user?.id) fetchNotifications();
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get(`/notifications/${user.id}`);
      setNotifications(res.data);
    } catch (err) { console.error('Failed to fetch notifications'); }
  };

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) { console.error('Failed to mark read'); }
  };

  const markAllAsRead = async () => {
    try {
      const unread = notifications.filter(n => !n.read);
      await Promise.all(unread.map(n => api.put(`/notifications/${n.id}/read`)));
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) { console.error('Failed to mark all as read'); }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 px-8 py-3 sticky top-0 z-40 transition-colors">
      <div className="flex justify-between items-center max-w-[1600px] mx-auto">
        
        {/* Search Bar (Hidden for Job Seekers) */}
        {user?.role !== 'JOB_SEEKER' && (
          <div className="flex-1 max-w-xl relative group">
            <input 
              type="text" 
              placeholder="Search jobs, companies..." 
              className="w-full pl-6 pr-12 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-[#0052cc]/20 focus:border-[#0052cc] outline-none transition-all dark:text-white"
            />
            <Search size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#0052cc] transition-colors" />
          </div>
        )}
        {user?.role === 'JOB_SEEKER' && <div className="flex-1" />} {/* Spacer */}

        {/* Right Side Actions */}
        <div className="flex items-center space-x-6">
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-slate-500 hover:text-[#0052cc] transition-colors"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="p-4 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Notifications</h3>
                  <button 
                    onClick={markAllAsRead}
                    className="text-[10px] font-bold text-[#0052cc] hover:underline uppercase tracking-wider"
                  >
                    Mark all as read
                  </button>
                </div>
                <div className="max-h-96 overflow-y-auto scrollbar-hide">
                  {notifications.length > 0 ? notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => !n.read && markAsRead(n.id)}
                      className={`p-4 border-b border-slate-50 dark:border-slate-800 cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${!n.read ? 'bg-blue-50/30 dark:bg-[#0052cc]/5' : ''}`}
                    >
                      <div className="flex gap-3">
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${!n.read ? 'bg-[#0052cc]' : 'bg-slate-200 dark:bg-slate-700'}`}></div>
                        <div>
                          <p className={`text-xs leading-relaxed ${!n.read ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-500'}`}>
                            {n.message}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-1 font-medium">
                            {new Date(n.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="p-8 text-center text-slate-400 text-xs italic">
                      You're all caught up!
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Theme Toggle */}
          <button 
            onClick={toggleDarkMode}
            className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-[#0052cc] dark:hover:text-blue-400 transition-all border border-slate-100 dark:border-slate-700 shadow-sm"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {user ? (
            <div className="flex items-center space-x-3 pl-6 border-l border-slate-100 dark:border-slate-800">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-100 dark:border-slate-800 bg-[#0052cc] flex items-center justify-center shadow-sm">
                 {user?.profilePicture ? (
                   <SecureImage 
                     src={user.profilePicture} 
                     alt="Profile" 
                     className="w-10 h-10 rounded-full border-2 border-indigo-500/30 group-hover:border-indigo-400 transition-all object-cover"
                   />
                 ) : (
                   <span className="text-white font-bold text-base uppercase">
                     {user?.name?.charAt(0) || 'U'}
                   </span>
                 )}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{user?.name || 'Guest'}</span>
                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-tight">{user?.role?.replace('_', ' ') || 'Visitor'}</span>
              </div>
              <button onClick={handleLogout} className="text-slate-400 hover:text-rose-500 transition-colors">
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-4 pl-6 border-l border-slate-100 dark:border-slate-800">
              <Link to="/login">
                <button className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-[#0052cc] transition-colors">Login</button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="px-6">Sign Up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
