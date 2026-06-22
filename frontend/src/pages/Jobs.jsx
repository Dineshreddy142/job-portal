import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import { Bookmark, MapPin, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const Jobs = () => {
  const { user } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyingJobId, setApplyingJobId] = useState(null);
  const [resume, setResume] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [savedJobs, setSavedJobs] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const jobsRes = await api.get('/jobs');
      setJobs(jobsRes.data);
      if (user?.role === 'JOB_SEEKER') {
        const [appsRes, savedRes] = await Promise.all([
          api.get(`/applications/applicant/${user.id}`),
          api.get(`/saved-jobs/${user.id}`)
        ]);
        setApplications(appsRes.data);
        setSavedJobs(savedRes.data);
      }
    } catch (error) {
      console.error("Error fetching data", error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSave = async (jobId) => {
    if (!user) {
      alert('Please login as a Job Seeker to save jobs.');
      return;
    }
    const isSaved = savedJobs.some(j => j.id === jobId);
    try {
      if (isSaved) {
        await api.delete(`/saved-jobs/${user.id}/${jobId}`);
        setSavedJobs(prev => prev.filter(j => j.id !== jobId));
      } else {
        await api.post(`/saved-jobs/${user.id}/${jobId}`);
        const jobToSave = jobs.find(j => j.id === jobId);
        setSavedJobs(prev => [...prev, jobToSave]);
      }
    } catch (err) {
      console.error('Error toggling save:', err);
      const msg = err.response?.data?.message || err.message || 'Check your connection';
      alert(`Failed to save/unsave job: ${msg}`);
    }
  };

  const isJobSaved = (jobId) => savedJobs.some(j => j.id === jobId);

  const handleApplySubmit = async (e, jobId) => {
    e.preventDefault();
    if (!resume) {
      alert('Please attach a PDF resume before submitting your application.');
      return;
    }
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('jobId', jobId);
    formData.append('resume', resume);
    try {
      const response = await api.post('/applications', formData);
      const savedApplication = response.data;

      setApplications(prevApplications => {
        const nextApplications = prevApplications.filter(app => String(app.jobId) !== String(savedApplication.jobId));
        return [savedApplication, ...nextApplications];
      });

      setApplyingJobId(null);
      setResume(null);
      alert('Application submitted successfully!');
    } catch (error) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Failed to apply. Check file size and format.';
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const hasApplied = (jobId) => applications.find(app => app.jobId === jobId);

  const filteredJobs = jobs.filter(job => 
    job.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    job.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.skills?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 transition-colors">
      {/* Search & Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-heading font-bold text-slate-900 dark:text-white mb-2 transition-colors">Explore Opportunities</h2>
          <p className="text-slate-500 dark:text-slate-400 transition-colors">Find your next career move among {jobs.length} open positions.</p>
        </div>
        
        <div className="w-full md:w-1/3 relative">
          <input 
            type="text" 
            placeholder="Search by title, location, or skills..." 
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none dark:text-white transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <svg className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-4 animate-pulse transition-colors">
              <div className="h-6 bg-slate-100 dark:bg-slate-800 rounded w-3/4"></div>
              <div className="h-4 bg-slate-50 dark:bg-slate-800/50 rounded w-1/2"></div>
              <div className="flex gap-2"><div className="h-8 bg-slate-50 dark:bg-slate-800/50 rounded w-20"></div><div className="h-8 bg-slate-50 dark:bg-slate-800/50 rounded w-20"></div></div>
              <div className="h-20 bg-slate-50 dark:bg-slate-800/50 rounded w-full"></div>
              <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded w-full mt-4"></div>
            </div>
          ))}
        </div>
      ) : jobs.length === 0 ? (
        <Card className="p-16 text-center flex flex-col items-center border-dashed border-2 bg-transparent dark:border-slate-800" hover={false}>
          <div className="text-6xl mb-6 grayscale opacity-50">💼</div>
          <h3 className="text-2xl font-heading font-bold text-slate-900 dark:text-white mb-2">No jobs available</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm">We're waiting for recruiters to post new opportunities. Check back later!</p>
          <Button onClick={fetchData} variant="secondary">Refresh Feed</Button>
        </Card>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-20 transition-colors">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-slate-500 dark:text-slate-400 text-lg transition-colors">No matches found for "<span className="font-bold text-slate-900 dark:text-white">{searchTerm}</span>"</p>
          <Button variant="ghost" onClick={() => setSearchTerm('')} className="mt-4">Clear all filters</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => {
            const application = hasApplied(job.id);
            return (
              <Card key={job.id} className="flex flex-col h-full group p-6">
                <div className="flex-grow">
                  <div className="flex justify-between items-start mb-4">
                    <div className="bg-slate-50 dark:bg-slate-800 w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-sm border border-slate-100 dark:border-slate-700 group-hover:bg-primary-50 dark:group-hover:bg-primary-500/10 group-hover:text-primary-600 transition-colors">
                      {job.title.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex items-center space-x-2">
                       {user?.role === 'JOB_SEEKER' && (
                         <button 
                            onClick={() => handleToggleSave(job.id)}
                            className={`p-2 rounded-lg border-2 transition-all ${
                              isJobSaved(job.id) 
                              ? 'bg-blue-50 border-[#0052cc] text-[#0052cc]' 
                              : 'bg-white border-slate-100 text-slate-300 hover:border-[#0052cc]/50 hover:text-[#0052cc]'
                            }`}
                         >
                            <Bookmark size={18} fill={isJobSaved(job.id) ? "currentColor" : "none"} />
                         </button>
                       )}
                       {application && (
                         <Badge variant={application.status === 'SHORTLISTED' ? 'green' : application.status === 'REJECTED' ? 'red' : 'blue'}>
                           {application.status}
                         </Badge>
                       )}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-heading font-bold text-slate-900 dark:text-white mb-1 group-hover:text-primary-600 transition-colors leading-tight">
                    {job.title}
                  </h3>
                  <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4 transition-colors">{job.recruiterName || 'Global Corp'}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-6">
                    <Badge variant="blue">📍 {job.location}</Badge>
                    <Badge variant="green">₹ {job.salary}</Badge>
                    <Badge variant="yellow">🕒 {job.jobType?.replace('_', ' ')}</Badge>
                    {job.deadline && (
                      <Badge variant={new Date(job.deadline) < new Date() ? 'red' : 'indigo'}>
                        ⌛ {new Date(job.deadline) < new Date() ? 'Expired' : `Ends: ${new Date(job.deadline).toLocaleDateString()}`}
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 mb-6 leading-relaxed transition-colors">
                    {job.description}
                  </p>

                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Required Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {job.skills?.split(',').map((skill, i) => (
                        <span key={i} className="text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700 transition-colors">
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 transition-colors">
                  {user?.role === 'JOB_SEEKER' ? (
                    application ? (
                      <Button disabled className="w-full !bg-slate-100 dark:!bg-slate-800 !text-slate-700 dark:!text-slate-400 !border !border-slate-200 dark:!border-slate-700 !opacity-100 !cursor-default shadow-sm transition-colors">
                        Application Sent
                      </Button>
                    ) : applyingJobId === job.id ? (
                      <form onSubmit={(e) => handleApplySubmit(e, job.id)} className="space-y-4">
                        <div className="bg-primary-50 dark:bg-primary-500/10 p-3 rounded-xl border border-primary-100 dark:border-primary-500/20 transition-colors">
                          <label className="text-[10px] font-bold text-primary-700 dark:text-primary-400 uppercase tracking-wider block mb-2">Resume (PDF Only)</label>
                          <input 
                            type="file" 
                            accept=".pdf"
                            onChange={(e) => setResume(e.target.files[0])}
                            className="text-xs text-primary-600 dark:text-primary-400 file:hidden"
                            required
                          />
                          <p className="mt-1 text-[10px] text-primary-400 dark:text-primary-500">{resume ? resume.name : 'No file selected'}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button type="submit" variant="emerald" className="flex-1" disabled={isSubmitting}>
                            {isSubmitting ? 'Submitting...' : 'Submit'}
                          </Button>
                          <Button type="button" variant="ghost" onClick={() => setApplyingJobId(null)} disabled={isSubmitting}>Cancel</Button>
                        </div>
                      </form>
                    ) : job.deadline && new Date(job.deadline) < new Date() ? (
                      <Button disabled className="w-full !bg-slate-50 dark:!bg-slate-900 !text-slate-400 !border-slate-200 dark:!border-slate-800 !opacity-100 cursor-not-allowed">
                        Deadline Passed
                      </Button>
                    ) : (
                      <Button onClick={() => setApplyingJobId(job.id)} className="w-full">
                        Apply Now
                      </Button>
                    )
                  ) : (
                    <p className="text-center text-xs text-slate-400 dark:text-slate-500 py-2 transition-colors">Login as seeker to apply</p>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Jobs;
