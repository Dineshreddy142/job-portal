import React, { useContext, useState } from 'react';
import { Search, Bell, Moon, Sun, ChevronDown, CheckCircle, Clock } from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import SecureImage from '../components/common/SecureImage';

const RecruiterNavbar = () => {
  const { user } = useContext(AuthContext);
  const { darkMode, toggleDarkMode } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);

  const notifications = [
    { id: 1, title: 'New Application', message: 'John Doe applied for "Web Developer"', time: '2 min ago', read: false },
    { id: 2, title: 'Job Status Updated', message: 'Your "Frontend" job is now live', time: '1 hour ago', read: true },
    { id: 3, title: 'Interview Scheduled', message: 'Meeting with Sarah at 4 PM', time: '5 hours ago', read: false },
  ];

  return (
    <div className="h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 fixed top-0 left-64 right-0 z-40 px-8 flex items-center justify-between transition-colors">
      {/* Search Bar */}
      <div className="relative w-96">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          <Search size={18} />
        </span>
        <input 
          type="text" 
          placeholder="Search jobs or applicants..." 
          className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-transparent focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500/30 focus:ring-4 focus:ring-blue-500/5 py-2.5 pl-12 pr-4 rounded-xl text-sm transition-all outline-none dark:text-white"
        />
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-6">
        <button 
          onClick={toggleDarkMode}
          className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full relative"
          >
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-300">
               <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Notifications</h4>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest cursor-pointer hover:underline">Mark all read</span>
               </div>
               <div className="max-h-96 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className={`px-5 py-4 border-b border-slate-50 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors cursor-pointer ${!n.read ? 'bg-blue-50/30 dark:bg-blue-500/5' : ''}`}>
                       <div className="flex justify-between items-start mb-1">
                          <p className="text-xs font-bold text-slate-900 dark:text-white">{n.title}</p>
                          <span className="text-[10px] text-slate-400">{n.time}</span>
                       </div>
                       <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{n.message}</p>
                    </div>
                  ))}
               </div>
               <div className="px-5 py-3 text-center bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700">
                  <button className="text-[10px] font-bold text-slate-400 hover:text-slate-900 dark:hover:text-white uppercase tracking-widest transition-colors">
                    View All Activity
                  </button>
               </div>
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>

        <button className="flex items-center space-x-3 group">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{user?.name || 'Recruiter'}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              {user?.role === 'ADMIN' ? 'System Admin' : user?.role === 'SECURITY_ADMIN' ? 'Security Team' : 'Hiring Manager'}
            </p>
          </div>
          <div className="w-10 h-10 rounded-xl overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm ring-1 ring-blue-50 dark:ring-blue-900/20 bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            {user?.profilePicture ? (
              <SecureImage 
                src={user.profilePicture} 
                alt="Profile" 
                className="w-10 h-10 rounded-full border-2 border-indigo-500/30 group-hover:border-indigo-400 transition-all object-cover shadow-sm"
              />
            ) : (
              <span className="text-blue-700 dark:text-blue-400 font-bold text-sm">
                {user?.name?.charAt(0) || 'R'}
              </span>
            )}
          </div>
          <ChevronDown size={16} className="text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
        </button>
      </div>
    </div>
  );
};

export default RecruiterNavbar;
