import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import SecurityDashboard from './SecurityDashboard';


import { AuthContext } from '../contexts/AuthContext';
import { 
  TrendingUp, 
  Briefcase, 
  Users, 
  UserCheck, 
  Clock,
  ArrowUpRight,
  MoreVertical,
  ExternalLink
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';

const RecruiterOverview = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  if (user?.role === 'SECURITY_ADMIN') return <SecurityDashboard />;


  const [stats, setStats] = useState(null);
  const [recentJobs, setRecentJobs] = useState([]);
  const [recentApps, setRecentApps] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      if (user.role === 'RECRUITER' || user.role === 'ADMIN') {
        fetchDashboardData();
      } else {
        setLoading(false);
      }
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const isAdm = user.role === 'ADMIN';
      const [statsRes, jobsRes, appsRes] = await Promise.all([
        api.get(isAdm ? '/admin/stats' : `/jobs/recruiter/${user.id}/stats`),
        api.get(isAdm ? '/jobs' : `/jobs/recruiter/${user.id}`),
        api.get(isAdm ? '/admin/users' : `/applications/recruiter/${user.id}`) // Just as a placeholder for apps if admin
      ]);
      setStats(statsRes.data);
      setRecentJobs(jobsRes.data.slice(0, 5));
      setRecentApps(appsRes.data.slice(0, 5));
    } catch (err) {
      console.error("Dashboard Fetch Error:", err);
      setError("Failed to sync dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Jobs Posted', count: stats?.totalJobsPosted || 0, icon: Briefcase, color: 'blue', growth: '+12%' },
    { title: 'Active Jobs', count: stats?.activeJobs || 0, icon: TrendingUp, color: 'emerald', growth: '+5%' },
    { title: 'Total Applicants', count: stats?.totalApplicationsReceived || 0, icon: Users, color: 'indigo', growth: '+18%' },
    { title: 'Shortlisted', count: stats?.shortlistedCandidates || 0, icon: UserCheck, color: 'rose', growth: '+8%' },
  ];

  // Chart Data Preparation
  const appsPerJobData = stats?.applicationsPerJob 
    ? Object.entries(stats.applicationsPerJob).map(([name, value]) => ({ 
        name: name.length > 15 ? name.substring(0, 12) + '...' : name, 
        fullName: name,
        value 
      })) 
    : [];

  const statusDistData = stats?.statusDistribution 
    ? Object.entries(stats.statusDistribution).map(([name, value]) => ({ 
        name: name.charAt(0) + name.slice(1).toLowerCase(), 
        value 
      })) 
    : [];

  const COLORS = ['#0052cc', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6'];

  if (loading) return <div className="animate-pulse space-y-8 p-8">
    <div className="h-10 bg-slate-100 rounded w-1/4"></div>
    <div className="grid grid-cols-4 gap-6">
      {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-100 rounded-2xl"></div>)}
    </div>
    <div className="grid grid-cols-2 gap-8">
       <div className="h-80 bg-slate-100 rounded-2xl"></div>
       <div className="h-80 bg-slate-100 rounded-2xl"></div>
    </div>
  </div>;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-8 md:p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
               <span className="px-3 py-1 bg-blue-500/20 backdrop-blur-md border border-blue-400/30 rounded-full text-[10px] font-bold uppercase tracking-widest text-blue-300">
                 Dashboard v2.0
               </span>
               <div className="flex items-center space-x-1.5">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Live System</span>
               </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight mb-2">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-indigo-200">{user?.name}</span>! 👋
            </h1>
            <p className="text-slate-400 text-lg font-medium max-w-xl">
              You have <span className="text-white">{stats?.totalApplicationsReceived || 0}</span> new applications to review today. Let's find your next star hire.
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="lg" 
              onClick={fetchDashboardData} 
              className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 shadow-xl rounded-2xl"
            >
              <Clock size={18} className="mr-2" />
              <span>Sync Dashboard</span>
            </Button>
            <button className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center rounded-2xl text-white hover:bg-white/20 transition-all shadow-xl">
              <MoreVertical size={20} />
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-5 glass border-rose-500/20 bg-rose-500/5 rounded-[2rem] text-rose-600 dark:text-rose-400 text-sm font-bold flex items-center space-x-4 animate-in shake duration-500">
          <div className="w-10 h-10 bg-rose-100 dark:bg-rose-500/20 rounded-xl flex items-center justify-center">âš ï¸</div>
          <span>{error}</span>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {statCards.map((stat, i) => (
          <Card key={i} className="p-8 border-transparent glass relative overflow-hidden group hover:-translate-y-2 transition-all duration-500 rounded-[2.5rem]" shadow="xl" hover={true}>
            <div className={`absolute top-0 right-0 w-32 h-32 bg-${stat.color}-500/10 rounded-full blur-3xl -translate-y-8 translate-x-8 group-hover:scale-150 transition-transform duration-700`}></div>
            
            <div className="flex justify-between items-start mb-6 relative z-10">
              <div className={`p-4 rounded-2xl bg-${stat.color}-500/10 text-${stat.color}-600 dark:text-${stat.color}-400 ring-1 ring-${stat.color}-500/20 shadow-lg shadow-${stat.color}-500/5`}>
                <stat.icon size={28} />
              </div>
              <div className="flex items-center space-x-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-[11px] bg-emerald-500/10 px-3 py-1.5 rounded-full ring-1 ring-emerald-500/20">
                <ArrowUpRight size={14} />
                <span>{stat.growth}</span>
              </div>
            </div>
            
            <div className="relative z-10">
              <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1">{stat.title}</p>
              <h4 className="text-4xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight">{stat.count}</h4>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <Card className="lg:col-span-8 p-8 border-transparent glass rounded-[2.5rem]" hover={false} shadow="xl">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="font-heading font-bold text-slate-900 dark:text-white text-xl">Application Trends</h3>
              <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-widest">Total applications across job posts</p>
            </div>
            <select className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold px-4 py-2 outline-none cursor-pointer">
              <option>Last 30 Days</option>
              <option>Last 60 Days</option>
            </select>
          </div>
          
          <div className="h-96 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={appsPerJobData}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={1}/>
                    <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} 
                  dy={15}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 700, fill: '#94a3b8' }} 
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                  contentStyle={{ 
                    borderRadius: '20px', 
                    border: 'none', 
                    boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', 
                    padding: '16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    backdropFilter: 'blur(10px)'
                  }}
                  itemStyle={{ fontWeight: 800, color: '#1e293b' }}
                  labelStyle={{ fontWeight: 600, color: '#64748b', marginBottom: '4px' }}
                />
                <Bar dataKey="value" fill="url(#barGradient)" radius={[10, 10, 4, 4]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="lg:col-span-4 p-8 border-transparent glass rounded-[2.5rem]" hover={false} shadow="xl">
          <h3 className="font-heading font-bold text-slate-900 dark:text-white text-xl mb-2">Application Status</h3>
          <p className="text-xs text-slate-400 font-medium mb-8 uppercase tracking-widest">Candidate funnel distribution</p>
          
          <div className="h-80 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistData}
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={105}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {statusDistData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    padding: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
               <span className="text-3xl font-heading font-extrabold text-slate-900 dark:text-white">{stats?.totalApplicationsReceived || 0}</span>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Total</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-8">
            {statusDistData.map((item, i) => (
              <div key={i} className="flex items-center space-x-3 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{item.name}</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white leading-none mt-0.5">{item.value}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Jobs Table */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="p-0 overflow-hidden border-transparent glass rounded-[2.5rem]" hover={false} shadow="xl">
            <div className="p-8 flex justify-between items-center border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-heading font-bold text-slate-900 dark:text-white text-xl">Recent Job Posts</h3>
                <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-widest">Manage your latest listings</p>
              </div>
              <Button variant="ghost" size="sm" className="text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-50 dark:hover:bg-blue-500/10">
                View All <ExternalLink size={14} className="ml-2" />
              </Button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-slate-100 dark:border-slate-800">
                    <th className="px-8 py-5">Job Details</th>
                    <th className="px-8 py-5">Location</th>
                    <th className="px-8 py-5">Status</th>
                    <th className="px-8 py-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {recentJobs.map(job => (
                    <tr key={job.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 dark:text-white text-base group-hover:text-blue-600 transition-colors leading-tight">{job.title}</span>
                          <div className="flex items-center space-x-2 mt-1.5">
                            <Badge variant="blue" className="text-[9px] px-2 py-0.5">{job.jobType?.replace('_', ' ')}</Badge>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                              {job.deadline ? `Ends ${new Date(job.deadline).toLocaleDateString()}` : `Posted ${new Date(job.createdAt).toLocaleDateString()}`}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                         <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm font-medium">
                           <span>{job.location}</span>
                         </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center space-x-2">
                           <div className={`w-2 h-2 rounded-full ${job.status === 'ACTIVE' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-400'}`}></div>
                           <span className={`text-xs font-bold uppercase tracking-widest ${job.status === 'ACTIVE' ? 'text-emerald-600' : 'text-slate-400'}`}>{job.status}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Recent Applicants */}
        <div className="lg:col-span-4 space-y-8">
           <Card className="p-8 border-transparent glass rounded-[2.5rem]" hover={false} shadow="xl">
             <div className="flex items-center justify-between mb-8">
                <h3 className="font-heading font-bold text-slate-900 dark:text-white text-xl">New Talent</h3>
                <span className="w-8 h-8 flex items-center justify-center bg-blue-500/10 text-blue-600 rounded-lg font-bold text-xs">
                  {recentApps.length}
                </span>
             </div>
             
             <div className="space-y-8">
               {recentApps.map(app => (
                 <div key={app.id} className="flex items-center justify-between group cursor-pointer">
                   <div className="flex items-center space-x-4">
                     <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-lg ring-1 ring-slate-200 dark:ring-slate-700 group-hover:scale-110 transition-transform shadow-sm">
                       {app.applicantName?.charAt(0)}
                     </div>
                     <div>
                       <p className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-blue-600 transition-colors">{app.applicantName}</p>
                       <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 truncate w-40 mt-0.5 uppercase tracking-tighter">{app.jobTitle}</p>
                     </div>
                   </div>
                   <div className={`w-2 h-2 rounded-full ${app.status === 'SHORTLISTED' ? 'bg-emerald-500' : 'bg-blue-500'}`}></div>
                 </div>
               ))}
             </div>
             
             <button className="w-full mt-10 py-4 glass border-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs rounded-2xl hover:bg-blue-500/5 transition-all uppercase tracking-widest">
               Review All Applications
             </button>
           </Card>

           <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 p-8 text-white shadow-2xl">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10">
                <h4 className="font-bold text-lg mb-2">Need help hiring?</h4>
                <p className="text-blue-100 text-xs leading-relaxed mb-6">Our AI-powered matching system can help you find the perfect candidate 2x faster.</p>
                <button 
                  onClick={() => navigate('/recruiter/ai-matcher')}
                  className="px-6 py-3 bg-white text-blue-600 font-bold text-xs rounded-xl shadow-xl hover:scale-105 transition-transform active:scale-95"
                >
                  Try AI Matcher
                </button>

              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default RecruiterOverview;
