import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import { 
  Users, 
  Briefcase, 
  TrendingUp, 
  Shield, 
  Trash2, 
  Lock, 
  Eye, 
  BarChart3,
  PieChart,
  ArrowUpRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart as RePieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ totalUsers: 0, totalJobs: 0, totalApplications: 0, totalRecruiters: 0 });
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.pathname.includes('jobs') ? 'JOBS' : 'USERS');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (location.pathname.includes('jobs')) setActiveTab('JOBS');
    else if (location.pathname.includes('users')) setActiveTab('USERS');
  }, [location.pathname]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes, jobsRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users'),
        api.get('/jobs')
      ]);
      setStats(statsRes.data);
      setUsers(usersRes.data);
      setJobs(jobsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await api.put(`/admin/users/${userId}/toggle-status`);
      fetchData();
    } catch (err) {
      alert('Action failed');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job listing?')) return;
    try {
      await api.delete(`/admin/jobs/${jobId}`);
      fetchData();
    } catch (err) {
      alert('Failed to delete job');
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesRole = filterRole === 'ALL' || u.role === filterRole;
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const filteredJobs = jobs.filter(j => 
    j.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) return <div className="text-center py-20 font-bold text-slate-500 dark:text-slate-400">Initializing Administrator Hub...</div>;

  // Prepare chart data
  const appsPerJobData = stats.applicationsPerJob 
    ? Object.entries(stats.applicationsPerJob).map(([name, value]) => ({ 
        name: name.length > 15 ? name.substring(0, 12) + '...' : name, 
        fullName: name,
        value 
      })) 
    : [];

  const statusDistData = stats.statusDistribution 
    ? Object.entries(stats.statusDistribution).map(([name, value]) => ({ 
        name: name.charAt(0) + name.slice(1).toLowerCase(), 
        value 
      })) 
    : [];

  const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6'];

  return (
    <div className="space-y-10 animate-in fade-in duration-500 transition-colors">
      {/* Platform Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-primary-600 font-bold text-xs uppercase tracking-[0.3em] mb-2">
            <Shield size={14} />
            <span>Secure Admin Panel</span>
          </div>
          <h2 className="text-4xl font-heading font-bold text-slate-900 dark:text-white transition-colors">Platform Oversight</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">Global management and system health monitoring.</p>
        </div>
        <Button variant="secondary" onClick={fetchData}>ðŸ”„ Refresh System Data</Button>
      </div>

      {/* Global Metrics - Only show on dashboard page */}
      {location.pathname.includes('dashboard') && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Accounts', value: stats.totalUsers, icon: <Users />, color: 'indigo', trend: '+12%' },
              { label: 'Live Listings', value: stats.totalJobs, icon: <Briefcase />, color: 'blue', trend: '+5%' },
              { label: 'Total Applications', value: stats.totalApplications, icon: <TrendingUp />, color: 'emerald', trend: '+18%' },
              { label: 'Verified Recruiters', value: stats.totalRecruiters, icon: <Shield />, color: 'rose', trend: '+8%' },
            ].map((stat, i) => (
              <Card key={i} className="p-6 border-b-4 border-b-primary-500" hover={true}>
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-primary-600 transition-colors shadow-sm">
                    {stat.icon}
                  </div>
                  <div className="flex items-center space-x-1 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-lg">
                    <ArrowUpRight size={12} />
                    <span>{stat.trend}</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">{stat.label}</p>
                  <p className="text-3xl font-heading font-bold text-slate-900 dark:text-white transition-colors">{stat.value}</p>
                </div>
              </Card>
            ))}
          </div>

          {/* Analytics Visualization Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
             <Card className="lg:col-span-8 p-8" hover={false}>
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-lg font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
                     <BarChart3 size={20} className="text-primary-600" />
                     <span>Application Trends</span>
                   </h3>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Global metrics</p>
                </div>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={appsPerJobData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} 
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 600, fill: '#94a3b8' }} 
                      />
                      <Tooltip 
                        cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      />
                      <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
             </Card>

             <Card className="lg:col-span-4 p-8" hover={false}>
                <div className="flex items-center justify-between mb-8">
                   <h3 className="text-lg font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
                     <PieChart size={20} className="text-primary-600" />
                     <span>Application Status</span>
                   </h3>
                   <Badge variant="blue">System-wide</Badge>
                </div>
                <div className="h-64 w-full relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={statusDistData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {statusDistData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-2xl font-bold dark:text-white">{stats.totalApplications}</span>
                    <span className="text-[8px] uppercase tracking-widest text-slate-400 font-bold">Total</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {statusDistData.map((item, i) => (
                    <div key={i} className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase">{item.name}</span>
                      <span className="text-xs font-bold dark:text-white ml-auto">{item.value}</span>
                    </div>
                  ))}
                </div>
             </Card>
          </div>
        </>
      )}

      {/* Main Management Section - Only show on users or jobs pages, or as a fallback */}
      {!location.pathname.includes('dashboard') && (
        <div className="space-y-6">
        <div className="flex items-center space-x-1 p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl w-fit transition-colors">
          <button 
            onClick={() => setActiveTab('USERS')}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'USERS' ? 'bg-white dark:bg-slate-800 text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Manage Users
          </button>
          <button 
            onClick={() => setActiveTab('JOBS')}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${activeTab === 'JOBS' ? 'bg-white dark:bg-slate-800 text-primary-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Manage Job Listings
          </button>
        </div>

        <Card className="p-0 overflow-hidden border-slate-200 dark:border-slate-800" hover={false}>
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50 dark:bg-slate-900/50 transition-colors">
            <h3 className="text-xl font-heading font-bold text-slate-900 dark:text-white">
              {activeTab === 'USERS' ? 'Platform Accounts' : 'Job Repository'}
            </h3>
            <div className="flex flex-col md:flex-row gap-3">
              <input 
                type="text" 
                placeholder={activeTab === 'USERS' ? "Search by name or email..." : "Search by job title..."} 
                className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 outline-none w-full md:w-64 dark:text-white transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {activeTab === 'USERS' && (
                <select 
                  className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 outline-none cursor-pointer font-medium dark:text-white transition-all"
                  value={filterRole}
                  onChange={(e) => setFilterRole(e.target.value)}
                >
                  <option value="ALL">All Roles</option>
                  <option value="ADMIN">Administrators</option>
                  <option value="RECRUITER">Recruiters</option>
                  <option value="JOB_SEEKER">Job Seekers</option>
                </select>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            {activeTab === 'USERS' ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 transition-colors">
                    <th className="px-6 py-4">User Details</th>
                    <th className="px-6 py-4">Platform Role</th>
                    <th className="px-6 py-4">Account Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-lg bg-primary-100 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400 flex items-center justify-center font-bold text-xs uppercase transition-colors">
                            {u.name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white text-sm transition-colors">{u.name || 'Unknown User'}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={u.role === 'ADMIN' ? 'red' : u.role === 'RECRUITER' ? 'blue' : 'gray'}>
                          {u.role.replace('_', ' ')}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center space-x-1.5 ${u.status ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'} font-bold text-[10px] uppercase tracking-widest transition-colors`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${u.status ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                          <span>{u.status ? 'Active' : 'Deactivated'}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                           <Button size="sm" variant="ghost" className="h-8 w-8 p-0 flex items-center justify-center text-slate-400 hover:text-primary-600"><Eye size={16} /></Button>
                           <Button 
                             size="sm" 
                             variant={u.status ? 'danger' : 'success'} 
                             onClick={() => handleToggleStatus(u.id)}
                             disabled={u.id === user.id}
                             className="text-[10px]"
                           >
                             {u.status ? 'Deactivate' : 'Reactivate'}
                           </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100 dark:border-slate-800 transition-colors">
                    <th className="px-6 py-4">Job Listing</th>
                    <th className="px-6 py-4">Recruiter / Company</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredJobs.map(j => (
                    <tr key={j.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900 dark:text-white text-sm transition-colors">{j.title}</p>
                        <p className="text-xs text-slate-500 transition-colors">{j.location}</p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[10px] font-bold transition-colors">ðŸ¢</div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors">{j.recruiterName || 'System'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={j.status === 'ACTIVE' ? 'green' : 'gray'}>
                          {j.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                           <Button size="sm" variant="ghost" className="h-8 w-8 p-0 flex items-center justify-center text-slate-400 hover:text-primary-600"><Eye size={16} /></Button>
                           <Button 
                             size="sm" 
                             variant="ghost" 
                             className="h-8 w-8 p-0 flex items-center justify-center text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                             onClick={() => handleDeleteJob(j.id)}
                           >
                             <Trash2 size={16} />
                           </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>
      )}
    </div>
  );
};

export default AdminDashboard;
