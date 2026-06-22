import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { 
  MapPin, 
  Briefcase, 
  Clock, 
  DollarSign, 
  ChevronLeft, 
  Building2, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Bookmark
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isApplying, setIsApplying] = useState(false);
  const [resume, setResume] = useState(null);
  const [hasApplied, setHasApplied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');

  useEffect(() => {
    fetchJobDetails();
  }, [id, user]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const [jobRes, appsRes, savedRes] = await Promise.all([
        api.get(`/jobs/${id}`),
        user ? api.get(`/applications/applicant/${user.id}`) : Promise.resolve({ data: [] }),
        user ? api.get(`/saved-jobs/${user.id}`) : Promise.resolve({ data: [] })
      ]);
      
      setJob(jobRes.data);
      setHasApplied(appsRes.data.some(app => String(app.jobId) === String(id)));
      setIsSaved(savedRes.data.some(sj => String(sj.id) === String(id)));
    } catch (err) {
      console.error("Error fetching job details:", err);
      setError("Job not found or failed to load details.");
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();
    if (!resume) {
      alert("Please upload your resume first.");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('jobId', id);
    formData.append('resume', resume);

    try {
      await api.post('/applications', formData);
      setHasApplied(true);
      setIsApplying(false);
      alert("Application submitted successfully!");
    } catch (err) {
      console.error("Application error:", err);
      alert(err.response?.data?.message || "Failed to submit application.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleSave = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      if (isSaved) {
        await api.delete(`/saved-jobs/${user.id}/${id}`);
      } else {
        await api.post(`/saved-jobs/${user.id}/${id}`);
      }
      setIsSaved(!isSaved);
    } catch (err) {
      console.error("Error toggling save:", err);
    }
  };

  const handleReport = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/login');
      return;
    }
    try {
      await api.post('/reports', {
        reporterId: user.id,
        reportedJobId: id,
        reportedUserId: job.recruiterId,
        reason: reportReason
      });
      setShowReportModal(false);
      alert("Report submitted successfully. Our team will review this shortly.");
    } catch (err) {
      console.error("Report error:", err);
      alert("Failed to submit report.");
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
      <AlertCircle size={48} className="text-rose-500" />
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{error}</h2>
      <Button onClick={() => navigate('/jobs')} variant="secondary">Back to Jobs</Button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-slate-500 hover:text-blue-600 font-bold text-sm transition-colors group"
      >
        <ChevronLeft size={20} className="mr-1 group-hover:-translate-x-1 transition-transform" />
        Back to listings
      </button>

      {/* Main Header Card */}
      <Card className="p-8 md:p-12 border-transparent glass relative overflow-hidden rounded-[2.5rem]" hover={false} shadow="xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
            <div className="flex items-start md:items-center space-x-6">
              <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-3xl shadow-inner ring-1 ring-blue-100 dark:ring-slate-700">
                {job.title.charAt(0)}
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-heading font-bold text-slate-900 dark:text-white mb-2 leading-tight">
                  {job.title}
                </h1>
                <div className="flex flex-wrap items-center gap-y-2 gap-x-4">
                  <span className="flex items-center text-slate-500 dark:text-slate-400 font-bold text-sm">
                    <Building2 size={16} className="mr-1.5 text-blue-500" />
                    {job.recruiterName || 'Global Tech Solutions'}
                  </span>
                  <span className="flex items-center text-slate-500 dark:text-slate-400 font-bold text-sm">
                    <MapPin size={16} className="mr-1.5 text-rose-500" />
                    {job.location}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button 
                onClick={handleToggleSave}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center border-2 transition-all shadow-sm ${
                  isSaved 
                  ? 'bg-blue-50 border-blue-500 text-blue-600' 
                  : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-300 hover:border-blue-500/50 hover:text-blue-500'
                }`}
              >
                <Bookmark size={24} fill={isSaved ? "currentColor" : "none"} />
              </button>
              
              {hasApplied ? (
                <div className="flex items-center px-8 py-4 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold rounded-2xl border border-emerald-100 dark:border-emerald-500/20">
                  <CheckCircle2 size={20} className="mr-2" />
                  Application Sent
                </div>
              ) : (
                <Button 
                  size="lg" 
                  onClick={() => setIsApplying(true)}
                  className="px-12 py-4 rounded-2xl shadow-xl shadow-blue-500/20"
                  disabled={job.deadline && new Date(job.deadline) < new Date()}
                >
                  {job.deadline && new Date(job.deadline) < new Date() ? 'Deadline Passed' : 'Apply Now'}
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-10 border-t border-slate-100 dark:border-slate-800">
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Salary Range</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
                <DollarSign size={18} className="mr-1 text-emerald-500" />
                {job.salary}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Job Type</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
                <Briefcase size={18} className="mr-1 text-indigo-500" />
                {job.jobType?.replace('_', ' ')}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Application Deadline</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
                <Clock size={18} className="mr-1 text-rose-500" />
                {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'No Deadline'}
              </p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Status</p>
              <Badge variant={job.status === 'ACTIVE' ? 'green' : 'gray'}>{job.status}</Badge>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Description & Skills */}
        <div className="lg:col-span-8 space-y-8">
          <Card className="p-8 md:p-10 border-transparent glass rounded-[2.5rem]" hover={false}>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Job Description</h3>
            <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
              {job.description.split('\n').map((para, i) => (
                <p key={i} className="mb-4">{para}</p>
              ))}
            </div>

            <div className="mt-12">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Required Skills</h3>
              <div className="flex flex-wrap gap-2.5">
                {job.skills?.split(',').map((skill, i) => (
                  <span key={i} className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 shadow-sm">
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Apply Section */}
        <div className="lg:col-span-4">
          <div className="sticky top-8 space-y-8">
            {isApplying ? (
              <Card className="p-8 border-transparent glass rounded-[2.5rem] shadow-2xl" hover={false}>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Submit Application</h3>
                <form onSubmit={handleApply} className="space-y-6">
                  <div className="p-6 border-2 border-dashed border-blue-200 dark:border-blue-500/20 rounded-[2rem] bg-blue-50/30 dark:bg-blue-500/5 text-center group hover:border-blue-500 transition-colors cursor-pointer relative">
                    <input 
                      type="file" 
                      accept=".pdf" 
                      required 
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => setResume(e.target.files[0])}
                    />
                    <div className="flex flex-col items-center">
                      <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center text-blue-500 shadow-sm mb-4 group-hover:scale-110 transition-transform">
                        <FileText size={24} />
                      </div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">
                        {resume ? resume.name : 'Upload Resume'}
                      </p>
                      <p className="text-xs text-slate-400 font-medium">PDF only, max 5MB</p>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-3">
                    <Button 
                      type="submit" 
                      className="w-full rounded-2xl py-4" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Submitting...' : 'Send Application'}
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full rounded-2xl py-4" 
                      onClick={() => setIsApplying(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Card>
            ) : (
              <Card className="p-8 border-transparent bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-[2.5rem] shadow-2xl" hover={false}>
                 <h3 className="text-xl font-bold mb-4">About this role</h3>
                 <p className="text-blue-100 text-sm leading-relaxed mb-8 font-medium">
                   This position is currently active and accepting applications. We recommend submitting your interest as soon as possible.
                 </p>
                 <div className="space-y-4">
                    <div className="flex items-center space-x-3 text-sm font-bold">
                       <CheckCircle2 size={18} className="text-blue-300" />
                       <span>Remote friendly</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm font-bold">
                       <CheckCircle2 size={18} className="text-blue-300" />
                       <span>Full benefits package</span>
                    </div>
                 </div>
              </Card>
            )}
            
            <div className="pt-4 flex justify-center">
                <button 
                  onClick={() => setShowReportModal(true)}
                  className="text-sm font-bold text-slate-400 hover:text-rose-500 flex items-center transition-colors"
                >
                  <AlertCircle size={16} className="mr-1.5" />
                  Report this job
                </button>
             </div>
           </div>
         </div>
       </div>

       {/* Report Modal */}
       {showReportModal && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
           <Card className="w-full max-w-md p-8 rounded-[2rem] shadow-2xl animate-in zoom-in-95 duration-200">
             <div className="flex items-center space-x-3 text-rose-500 mb-6">
               <AlertCircle size={28} />
               <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Report Job</h3>
             </div>
             <p className="text-slate-600 dark:text-slate-400 font-medium mb-6">
               Help us keep the platform safe. Why are you reporting this job?
             </p>
             <form onSubmit={handleReport} className="space-y-6">
               <div className="space-y-3">
                 {['Suspicious/Scam', 'Offensive Content', 'Spam/Duplicate', 'Incorrect Information', 'Other'].map(reason => (
                   <label key={reason} className="flex items-center space-x-3 p-4 rounded-xl border border-slate-200 dark:border-slate-700 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                     <input 
                       type="radio" 
                       name="reportReason" 
                       value={reason}
                       required
                       onChange={(e) => setReportReason(e.target.value)}
                       className="w-4 h-4 text-rose-600 focus:ring-rose-500"
                     />
                     <span className="font-bold text-slate-700 dark:text-slate-300">{reason}</span>
                   </label>
                 ))}
               </div>
               <div className="flex gap-4 pt-4">
                 <Button variant="secondary" className="flex-1" type="button" onClick={() => setShowReportModal(false)}>Cancel</Button>
                 <Button className="flex-1 bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-500/30" type="submit">Submit Report</Button>
               </div>
             </form>
           </Card>
         </div>
       )}
     </div>
   );
};

export default JobDetails;
