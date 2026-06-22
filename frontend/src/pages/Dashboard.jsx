import React, { useState, useEffect, useContext, useRef } from 'react';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { 
  MapPin, 
  Briefcase, 
  Eye,
  XCircle,
  FileText,
  Upload,
  Trash2,
  RefreshCw,
  ChevronRight,
  Bookmark,
  CheckCircle2,
  ExternalLink,
  Download,
  Edit3
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [savedJobs, setSavedJobs] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);
  const { updateUserState } = useContext(AuthContext); // Assuming we add this to sync state

  useEffect(() => {
    if (user?.id) fetchDashboardData();
  }, [user]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Recommended Jobs (Primary jobs list)
      let allJobs = [];
      try {
        const jobsRes = await api.get('/jobs');
        allJobs = jobsRes.data;
      } catch (err) { console.error('Failed to fetch jobs:', err); }

      // 2. Fetch Applications
      let userApps = [];
      try {
        const appsRes = await api.get(`/applications/applicant/${user.id}`);
        userApps = appsRes.data;
      } catch (err) { console.error('Failed to fetch applications:', err); }

      // 3. Fetch Saved Jobs
      let userSaved = [];
      try {
        const savedRes = await api.get(`/saved-jobs/${user.id}`);
        userSaved = savedRes.data;
      } catch (err) { console.error('Failed to fetch saved jobs:', err); }

      // 4. Fetch Notifications for Activity Feed
      let userNotifications = [];
      try {
        const notifRes = await api.get(`/notifications/${user.id}`);
        userNotifications = notifRes.data;
      } catch (err) { console.error('Failed to fetch notifications:', err); }

      const savedIds = new Set(userSaved.map(j => j.id));
      
      setRecommendedJobs(allJobs.slice(0, 3).map(j => ({ ...j, isSaved: savedIds.has(j.id) })));
      setApplications(userApps.slice(0, 5));
      setSavedJobs(userSaved);

      // Use Notifications as activities
      const mappedActivities = userNotifications.map(n => ({
        id: n.id,
        title: n.message,
        date: n.timestamp,
        type: n.message.toLowerCase().includes('applied') || n.message.toLowerCase().includes('application') ? 'APPLICATION' : 'SAVE',
        status: n.message.toLowerCase().includes('shortlisted') ? 'SHORTLISTED' : 
                n.message.toLowerCase().includes('rejected') ? 'REJECTED' : null
      })).slice(0, 6);
      
      setActivities(mappedActivities);
    } catch (err) {
      console.error('General Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePicClick = () => {
    fileInputRef.current?.click();
  };

  const handleProfilePicChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post(`/users/${user.id}/profile-picture`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Update local storage and context if possible
      const updatedUser = { ...user, profilePicture: res.data.profilePicture };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      if (updateUserState) updateUserState(updatedUser);
      window.location.reload(); // Quick way to refresh all components using the pic
    } catch (err) {
      alert('Failed to upload profile picture');
    }
  };

  const profilePicUrl = user?.profilePicture 
    ? `http://localhost:8080${user.profilePicture}?t=${new Date().getTime()}`
    : null;

  const handleToggleSave = async (jobId, currentStatus) => {
    try {
      if (currentStatus) {
        await api.delete(`/saved-jobs/${user.id}/${jobId}`);
      } else {
        await api.post(`/saved-jobs/${user.id}/${jobId}`);
      }
      // Refresh dashboard data to update UI
      fetchDashboardData();
    } catch (err) {
      console.error('Error toggling save:', err);
      const msg = err.response?.data?.message || err.message || 'Check your connection';
      alert(`Failed to save/unsave job: ${msg}`);
    }
  };

  if (loading) return <div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0052cc]"></div></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12">
      
      {/* Top Row: Recommendations */}
      <div className="grid grid-cols-1 gap-6">
        {/* Recommended Jobs */}
        <Card className="p-8 bg-white border-slate-100 shadow-sm" hover={false}>
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-slate-900">Recommended Jobs</h3>
            <Link to="/jobs" className="text-[#0052cc] font-bold text-sm hover:underline">View All</Link>
          </div>
          <div className="space-y-6">
            {recommendedJobs.map((job, i) => (
              <div key={job.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 group">
                <div className="flex items-center space-x-5">
                   <div className="w-12 h-12 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform">
                     {i === 0 ? 'G' : i === 1 ? 'M' : 'A'}
                   </div>
                   <div>
                     <h4 className="font-bold text-slate-900 group-hover:text-[#0052cc] transition-colors">{job.title}</h4>
                     <p className="text-sm text-slate-500">{job.companyName || (i === 0 ? 'Google' : i === 1 ? 'Microsoft' : 'Amazon')}</p>
                     <div className="flex items-center gap-4 mt-1 text-[11px] font-medium text-slate-400">
                        <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                        <span className="flex items-center gap-1">💰 {job.salary}</span>
                     </div>
                   </div>
                </div>
                <div className="flex items-center space-x-3">
                   <Link to={`/jobs/${job.id}`}>
                     <Button variant="secondary" size="sm" className="bg-blue-50 border-none text-[#0052cc] text-xs font-bold px-4">View Details</Button>
                   </Link>
                   <button 
                      onClick={() => handleToggleSave(job.id, job.isSaved)}
                      className={`p-2.5 rounded-lg border-2 transition-all ${
                        job.isSaved 
                        ? 'bg-blue-50 border-[#0052cc] text-[#0052cc] shadow-sm' 
                        : 'bg-white border-slate-200 text-slate-400 hover:border-[#0052cc]/50 hover:text-[#0052cc]'
                      }`}
                   >
                      <Bookmark size={20} fill={job.isSaved ? "currentColor" : "none"} />
                   </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Middle Row: Applications */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* Application Status */}
        <Card className="p-0 overflow-hidden bg-white border-slate-100 shadow-sm" hover={false}>
          <div className="p-6 border-b border-slate-50 flex justify-between items-center">
            <h3 className="font-bold text-slate-900">Application Status</h3>
            <Link to="/my-applications" className="text-[#0052cc] font-bold text-sm hover:underline">View All Applications</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">
                  <th className="px-6 py-4">Job Title</th>
                  <th className="px-6 py-4">Company</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Applied On</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {applications.length > 0 ? applications.map((app, i) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-slate-900 text-sm">{app.jobTitle}</td>
                    <td className="px-6 py-4 text-sm text-slate-500 font-medium">
                       <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded bg-slate-100 flex items-center justify-center text-[10px]">{i === 0 ? 'G' : 'M'}</span>
                          <span>{i === 0 ? 'Google' : 'Microsoft'}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={
                        app.status === 'SHORTLISTED' ? 'green' : 
                        app.status === 'REJECTED' ? 'red' : 'blue'
                      } className="text-[10px] px-3 py-1 font-bold">
                        {app.status === 'APPLIED' ? 'Under Review' : app.status === 'SHORTLISTED' ? 'Interview Scheduled' : app.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 font-medium">{new Date(app.appliedAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <button className="p-2 bg-blue-50 text-[#0052cc] rounded-lg hover:bg-blue-100 transition-all shadow-sm">
                             <Eye size={16} />
                          </button>
                          <button className="px-3 py-1.5 bg-rose-50 text-rose-500 text-[10px] font-bold rounded-lg border border-rose-100 hover:bg-rose-100 transition-all">
                             Withdraw
                          </button>
                       </div>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" className="px-6 py-10 text-center text-slate-400 italic">No applications found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Bottom Row: Activity & Saved Jobs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity Feed */}
        <Card className="lg:col-span-2 p-8" hover={false}>
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-slate-900">Recent Activity</h3>
            <RefreshCw size={18} className="text-slate-300 hover:rotate-180 transition-all cursor-pointer" onClick={fetchDashboardData} />
          </div>
          <div className="space-y-8 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
            {activities.length > 0 ? activities.map((activity, i) => (
              <div key={i} className="relative pl-10 group">
                <div className={`absolute left-0 w-8 h-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center z-10 transition-transform group-hover:scale-110 ${
                  activity.type === 'APPLICATION' ? 'bg-blue-500 text-white' : 'bg-emerald-500 text-white'
                }`}>
                  {activity.type === 'APPLICATION' ? <Briefcase size={12} /> : <Bookmark size={12} />}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">{activity.title}</p>
                  <p className="text-[11px] text-slate-400 font-medium uppercase tracking-wider mt-1">
                    {new Date(activity.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                  {activity.status && (
                    <div className="mt-2">
                       <Badge variant={activity.status === 'SHORTLISTED' ? 'green' : activity.status === 'REJECTED' ? 'red' : 'blue'} className="text-[9px] px-2 py-0">
                         {activity.status}
                       </Badge>
                    </div>
                  )}
                </div>
              </div>
            )) : (
              <div className="py-10 text-center text-slate-400 italic">No recent activity.</div>
            )}
          </div>
        </Card>

        {/* Quick Saved Jobs (Compact) */}
        <div className="lg:col-span-1 space-y-6">
           <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900">Saved Jobs</h3>
              <Link to="/saved-jobs" className="text-[#0052cc] text-xs font-bold hover:underline">View All</Link>
           </div>
           <div className="space-y-4">
              {savedJobs.slice(0, 4).map((job, i) => (
                <div key={job.id} className="p-4 bg-white border border-slate-100 rounded-xl hover:shadow-md transition-all group flex items-center justify-between">
                   <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center font-bold text-slate-400 group-hover:text-[#0052cc] transition-colors">
                         {job.title.charAt(0)}
                      </div>
                      <div>
                         <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{job.title}</h4>
                         <p className="text-[10px] text-slate-400">{job.location}</p>
                      </div>
                   </div>
                   <Bookmark size={16} fill="#0052cc" className="text-[#0052cc]" />
                </div>
              ))}
              {savedJobs.length === 0 && (
                <div className="p-8 text-center border-2 border-dashed border-slate-100 rounded-2xl text-slate-300 text-xs italic">
                   No jobs saved yet
                </div>
              )}
           </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
