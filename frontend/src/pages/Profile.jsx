import React, { useState, useEffect, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { User, Mail, Shield, Calendar, Camera, FileText, Upload, Trash2, Eye, Bell, CheckCircle, XCircle, ShieldCheck, Building2, AlertTriangle } from 'lucide-react';
import SecureImage from '../components/common/SecureImage';


const Profile = () => {
  const { user, updateUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalJobsPosted: 0, shortlistedCandidates: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [position, setPosition] = useState(user?.position || '');
  const [notifyByEmail, setNotifyByEmail] = useState(user?.notifyByEmail ?? true);
  const [loadingSettings, setLoadingSettings] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchLatestUser = async () => {
      try {
        const res = await api.get(`/users/${user.id}`);
        if (updateUser) updateUser(res.data);
      } catch (err) { console.error('Error fetching latest user data'); }
    };
    if (user?.id) fetchLatestUser();
  }, []);

  useEffect(() => {
    if (user?.id) fetchStats();
  }, [user]);

  const fetchStats = async () => {
    if (user?.role === 'RECRUITER') {
      try {
        const res = await api.get(`/jobs/recruiter/${user.id}/stats`);
        setStats(res.data);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const updateData = { name };
      if (user?.role === 'RECRUITER') {
        updateData.position = position;
      }
      const res = await api.put(`/users/${user.id}`, updateData);
      if (updateUser) updateUser(res.data);
      alert('Profile updated successfully!');
      setIsEditing(false);
    } catch (err) {
      alert('Failed to update profile.');
      console.error(err);
    }
  };

  const handleToggleNotifications = async () => {
    try {
      setLoadingSettings(true);
      const res = await api.put(`/users/${user.id}`, { notifyByEmail: !notifyByEmail });
      setNotifyByEmail(res.data.notifyByEmail);
      if (updateUser) updateUser({ notifyByEmail: res.data.notifyByEmail });
      setLoadingSettings(false);
      alert('Notification preference updated');
    } catch (err) {
      setLoadingSettings(false);
      console.error(err);
      alert('Failed to update preference');
    }
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post(`/users/${user.id}/resume`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (updateUser) updateUser({ resumePath: res.data.resumePath });
      alert('Resume uploaded successfully!');
    } catch (err) {
      alert('Failed to upload resume.');
    }
  };

  const handleViewResume = () => {
    if (user?.resumePath) {
      const fileName = user.resumePath.split('\\').pop().split('/').pop();
      window.open(`http://localhost:8080/uploads/resumes/${fileName}`, '_blank');
    }
  };

  const handleDeleteResume = async () => {
    if (!window.confirm('Are you sure you want to delete your resume?')) return;
    try {
      await api.delete(`/users/${user.id}/resume`);
      if (updateUser) updateUser({ resumePath: null });
      alert('Resume deleted successfully!');
    } catch (err) {
      alert('Failed to delete resume.');
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
      if (updateUser) updateUser({ profilePicture: res.data.profilePicture });
      alert('Profile picture updated!');
    } catch (err) {
      alert('Failed to upload profile picture.');
    }
  };

  const handleIdCardUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post(`/users/${user.id}/company-id-card`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (updateUser) {
        updateUser({ 
          companyIdCard: res.data.companyIdCard,
          isVerified: res.data.isVerified 
        });
      }
      alert('Company ID Card uploaded successfully! A security admin will verify it shortly.');
    } catch (err) {
      console.error('ID Upload Error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Server error';
      alert(`Failed to upload ID card: ${errorMsg}`);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('WARNING: This will permanently delete your account and all associated data. This action cannot be undone. Are you sure?')) return;
    
    try {
      await api.delete(`/users/${user.id}`);
      alert('Your account has been deleted.');
      logout();
      navigate('/login');
    } catch (err) {
      alert('Failed to delete account.');
    }
  };


  // profilePicUrl calculation removed since SecureImage handles fetching
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 transition-colors">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-heading font-bold text-slate-900 dark:text-white transition-colors">Profile & Settings</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <Card className="lg:col-span-1 p-8 text-center flex flex-col items-center space-y-6" hover={false}>
          <div className="relative group cursor-pointer" onClick={handleProfilePicClick}>
            <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-slate-50 dark:border-slate-800 shadow-xl shadow-blue-500/10 relative bg-[#0052cc] flex items-center justify-center">
              {user?.profilePicture ? (
                <SecureImage src={user.profilePicture} alt="Profile" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
              ) : (
                <span className="text-white text-5xl font-bold uppercase">{user?.name?.charAt(0)}</span>
              )}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <Camera size={32} className="text-white" />
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleProfilePicChange}
            />
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white transition-colors">{user?.name}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium transition-colors">{user?.email}</p>
          </div>

          <Badge variant="blue" className="px-4 py-1 uppercase tracking-widest text-[10px]">
            {user?.role?.replace('_', ' ')}
          </Badge>

          {user?.role === 'RECRUITER' && (
            <div className="w-full pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-center space-x-12 text-slate-400 dark:text-slate-500 transition-colors">
               <div className="text-center">
                  <p className="text-slate-900 dark:text-white font-bold text-lg transition-colors">{stats.totalJobsPosted}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest">Jobs Posted</p>
               </div>
               <div className="text-center">
                  <p className="text-slate-900 dark:text-white font-bold text-lg transition-colors">{stats.shortlistedCandidates}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest">Hired/Selected</p>
               </div>
            </div>
          )}
        </Card>

        {/* Edit Info & Settings */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-8" hover={false}>
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-50 dark:border-slate-800">
              <h3 className="font-heading font-bold text-slate-900 dark:text-white text-lg transition-colors">Account Information</h3>
              {!isEditing && (
                <Button size="sm" variant="secondary" onClick={() => setIsEditing(true)}>Edit Profile</Button>
              )}
            </div>

            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center space-x-2 transition-colors">
                      <User size={12} />
                      <span>Full Name</span>
                    </label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/30 outline-none transition-all dark:text-white"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    ) : (
                      <p className="px-4 py-2.5 text-slate-700 dark:text-slate-300 font-medium transition-colors">{user?.name}</p>
                    )}
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center space-x-2 transition-colors">
                      <Mail size={12} />
                      <span>Email Address</span>
                    </label>
                    <p className="px-4 py-2.5 text-slate-400 dark:text-slate-500 font-medium bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-transparent italic transition-colors">
                      {user?.email}
                    </p>
                 </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center space-x-2 transition-colors">
                      <Shield size={12} />
                      <span>Account Type</span>
                    </label>
                    <p className="px-4 py-2.5 text-slate-700 dark:text-slate-300 font-bold flex items-center space-x-2 transition-colors">
                      {user?.role !== 'JOB_SEEKER' && (
                        <Badge variant={user?.isVerified ? "green" : "amber"}>
                          {user?.isVerified ? "Verified" : "Pending Verification"}
                        </Badge>
                      )}
                      <span className="text-xs uppercase tracking-tighter">{user?.role?.replace('_', ' ')}</span>
                    </p>
                  </div>

                 {user?.role === 'RECRUITER' && (
                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center space-x-2 transition-colors">
                      <User size={12} />
                      <span>Position in Company</span>
                    </label>
                    {isEditing ? (
                      <input 
                        type="text" 
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500/30 outline-none transition-all dark:text-white"
                        value={position}
                        onChange={(e) => setPosition(e.target.value)}
                        placeholder="e.g., Senior Hiring Manager"
                      />
                    ) : (
                      <p className="px-4 py-2.5 text-slate-700 dark:text-slate-300 font-medium transition-colors">{position || 'Not specified'}</p>
                    )}
                 </div>
                 )}

                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest flex items-center space-x-2 transition-colors">
                      <Calendar size={12} />
                      <span>Member Since</span>
                    </label>
                    <p className="px-4 py-2.5 text-slate-700 dark:text-slate-300 font-medium transition-colors">May 2024</p>
                 </div>
              </div>

              {isEditing && (
                <div className="flex space-x-3 pt-6 border-t border-slate-50 dark:border-slate-800 transition-colors">
                  <Button type="submit">Save Changes</Button>
                  <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                </div>
              )}
            </form>
          </Card>

          {/* Combined Settings (Notifications) */}
          <Card className="p-8" hover={false}>
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-blue-600">
                <Bell size={20} />
              </div>
              <h3 className="font-heading font-bold text-slate-900 dark:text-white text-lg transition-colors">Notification Preferences</h3>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 transition-colors">
              <div>
                <p className="font-bold text-slate-900 dark:text-white transition-colors">Email Notifications</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 transition-colors">Receive alerts for new jobs and applications</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  {notifyByEmail ? (
                    <CheckCircle size={16} className="text-green-500" />
                  ) : (
                    <XCircle size={16} className="text-slate-400" />
                  )}
                  <span className={`text-sm font-bold ${notifyByEmail ? 'text-green-500' : 'text-slate-400'}`}>
                    {notifyByEmail ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <Button 
                  size="sm" 
                  variant={notifyByEmail ? "secondary" : "primary"}
                  onClick={handleToggleNotifications} 
                  disabled={loadingSettings}
                >
                  {notifyByEmail ? 'Disable' : 'Enable'}
                </Button>
              </div>
            </div>
          </Card>

          {/* Company ID Verification (Recruiters Only) */}
          {user?.role === 'RECRUITER' && (
            <Card className="p-8" hover={false}>
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-lg text-indigo-600">
                  <ShieldCheck size={20} />
                </div>
                <h3 className="font-heading font-bold text-slate-900 dark:text-white text-lg transition-colors">Company Verification</h3>
              </div>
              
              <div className="p-6 rounded-2xl bg-indigo-50/50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-500/20 flex flex-col md:flex-row items-center gap-6">
                 <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-2xl shadow-md flex items-center justify-center text-indigo-600">
                    <Building2 size={32} />
                 </div>
                 <div className="flex-1 text-center md:text-left">
                    <p className="font-bold text-slate-900 dark:text-white">Verification Status</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {user?.isVerified 
                        ? "Your account is verified. You can post jobs and contact candidates." 
                        : "Upload your company ID card to be verified by our security team."}
                    </p>
                 </div>
                 {!user?.isVerified && (
                   <div className="relative">
                      <input 
                        type="file" 
                        id="id-card-upload" 
                        className="hidden" 
                        onChange={handleIdCardUpload}
                      />
                      <label 
                        htmlFor="id-card-upload" 
                        className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm cursor-pointer hover:bg-indigo-700 transition-colors inline-block"
                      >
                        {user?.companyIdCard ? 'Replace ID Card' : 'Upload ID Card'}
                      </label>
                   </div>
                 )}
              </div>
              
              {user?.companyIdCard && (
                <div className="mt-4 p-4 border border-slate-100 dark:border-slate-800 rounded-xl flex items-center justify-between">
                   <div className="flex items-center space-x-3">
                      <CheckCircle size={16} className="text-emerald-500" />
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate max-w-[200px]">
                        ID Card: {user.companyIdCard}
                      </span>
                   </div>
                   <Badge variant={user.isVerified ? "green" : "blue"} className="text-[9px]">
                     {user.isVerified ? "Verified Partner" : "Awaiting Audit"}
                   </Badge>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>


      {/* Resume Section for Seekers */}
      {user?.role === 'JOB_SEEKER' && (
        <div className="max-w-xl mx-auto pt-8 border-t border-slate-100 dark:border-slate-800">
          <Card className="p-8 bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm" hover={false}>
            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 bg-rose-50 dark:bg-rose-500/10 rounded-lg text-rose-500">
                <FileText size={20} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white transition-colors">Professional Resume</h3>
            </div>
            
            <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 flex flex-col items-center text-center space-y-4 mb-8">
               <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-2xl shadow-md flex items-center justify-center text-rose-500 relative group">
                  <FileText size={48} />
                  <div className="absolute -bottom-2 bg-rose-500 text-white text-[10px] font-bold px-2 py-1 rounded uppercase tracking-tighter">PDF</div>
               </div>
               <div>
                  <p className="font-bold text-slate-900 dark:text-white text-lg truncate w-full max-w-[300px]">
                    {user?.resumePath ? user.resumePath.split('\\').pop().split('/').pop() : 'No resume uploaded'}
                  </p>
                  <p className="text-xs text-slate-400 font-medium mt-1 uppercase tracking-widest">
                    {user?.resumePath ? 'Uploaded and Verified' : 'Please upload your resume to apply for jobs'}
                  </p>
               </div>
            </div>

            <div className="space-y-4">
               {user?.resumePath && (
                 <Button className="w-full bg-[#0052cc] py-4 text-sm font-bold flex items-center justify-center gap-3" onClick={handleViewResume}>
                    <Eye size={20} /> View Current Resume
                 </Button>
               )}
               
               <div className="relative">
                 <input 
                   type="file" 
                   id="resume-upload" 
                   className="hidden" 
                   accept=".pdf" 
                   onChange={handleResumeUpload}
                 />
                 <label 
                   htmlFor="resume-upload" 
                   className="w-full bg-white dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 py-4 text-sm font-bold flex items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/80 cursor-pointer rounded-xl transition-all"
                 >
                    <Upload size={20} /> {user?.resumePath ? 'Replace Resume' : 'Upload Resume'}
                 </label>
               </div>

               {user?.resumePath && (
                 <Button variant="ghost" className="w-full text-rose-500 border border-rose-100 dark:border-rose-500/20 py-4 text-sm font-bold flex items-center justify-center gap-3 hover:bg-rose-50 dark:hover:bg-rose-500/10" onClick={handleDeleteResume}>
                    <Trash2 size={20} /> Delete Resume
                 </Button>
               )}
            </div>
          </Card>
        </div>
      )}
      {/* Danger Zone */}
      <div className="pt-8 border-t border-slate-100 dark:border-slate-800">
        <Card className="p-8 border-rose-100 dark:border-rose-900/30 bg-rose-50/10" hover={false}>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-lg font-bold text-rose-600 mb-1 flex items-center gap-2">
                <AlertTriangle size={20} />
                Danger Zone
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Permanently delete your account and all associated data. This action is irreversible.
              </p>
            </div>
            <Button 
              variant="ghost" 
              className="text-rose-600 hover:bg-rose-50 border border-rose-100 dark:border-rose-900/50 px-8 font-bold"
              onClick={handleDeleteAccount}
            >
              Delete Account
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
