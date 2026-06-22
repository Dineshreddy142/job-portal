import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';

const RecruiterDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({ totalJobsPosted: 0, totalApplicationsReceived: 0, activeJobs: 0, shortlistedCandidates: 0 });
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [appsLoading, setAppsLoading] = useState(false);
  
  // Search & Filters
  const [jobSearch, setJobSearch] = useState('');
  const [applicantSearch, setApplicantSearch] = useState('');
  
  // States
  const [showJobForm, setShowJobForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  const [jobForm, setJobForm] = useState({ title: '', description: '', salary: '', location: '', skills: '', status: 'ACTIVE', jobType: 'FULL_TIME' });
  const [viewingResume, setViewingResume] = useState(null);
  const [loading, setLoading] = useState(true);

  // Notes state
  const [editingNotesId, setEditingNotesId] = useState(null);
  const [tempNotes, setTempNotes] = useState('');

  const SKILL_MAP = {
    'java full stack': 'Java, Spring Boot, MySQL, HTML, CSS, JavaScript',
    'frontend developer': 'HTML, CSS, JavaScript, React.js, UI Design',
    'backend developer': 'Java, Spring Boot, REST API, MySQL',
    'web developer': 'HTML, CSS, JavaScript, Bootstrap',
    'software engineer intern': 'Core Java, Problem Solving, Database Basics',
    'data analyst': 'Python, Excel, SQL, Power BI',
    'ai/ml engineer': 'Python, Machine Learning, TensorFlow, Data Analysis',
    'ui/ux designer': 'Figma, Adobe XD, Wireframing, Creativity',
    'cloud engineer': 'AWS, Docker, Kubernetes, Linux',
    'devops engineer': 'Git, Jenkins, Docker, CI/CD',
    'hr executive': 'Communication, Recruitment, MS Office',
    'marketing executive': 'Digital Marketing, SEO, Communication Skills',
    'customer support executive': 'Communication, Problem Solving, Teamwork',
    'business analyst': 'Data Analysis, Documentation, Communication',
    'project coordinator': 'Leadership, Planning, Team Management',
    'ai': 'Python, PyTorch/TensorFlow, LLM fine-tuning, RAG, MLOps',
    'machine learning': 'Python, PyTorch/TensorFlow, LLM, Statistics, Pandas/NumPy',
    'cloud': 'AWS/Azure, Docker, Kubernetes, Terraform, Cloud Security',
    'architect': 'AWS/Azure, Docker, Kubernetes, Terraform, Cloud Security',
    'cybersecurity': 'Network security, Ethical hacking, Incident response, SIEM, IAM',
    'qa': 'Selenium, Playwright, Python/Java, API testing, Performance testing',
  };

  useEffect(() => {
    if (user?.id) fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [statsRes, jobsRes] = await Promise.all([
        api.get(`/jobs/recruiter/${user.id}/stats`),
        api.get(`/jobs/recruiter/${user.id}`)
      ]);
      setStats(statsRes.data);
      setJobs(jobsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJob = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) await api.put(`/jobs/${editingJobId}`, { ...jobForm });
      else await api.post('/jobs', { ...jobForm });
      setShowJobForm(false);
      resetJobForm();
      fetchData();
    } catch (err) { 
      const msg = err.response?.data?.error || err.response?.data?.message || 'Failed to save job. Ensure all fields are filled.';
      alert(msg);
    }
  };

  const handleDeleteJob = async (jobId, e) => {
    e.stopPropagation();
    if (!window.confirm("Delete this job?")) return;
    try {
      await api.delete(`/jobs/${jobId}`);
      if (selectedJob?.id === jobId) { setSelectedJob(null); setApplications([]); }
      fetchData();
    } catch (err) { alert('Delete failed'); }
  };

  const fetchApplications = async (job) => {
    setSelectedJob(job);
    setAppsLoading(true);
    try {
      const res = await api.get(`/applications/job/${job.id}`);
      setApplications(res.data);
      // Scroll to applicants on mobile
      if (window.innerWidth < 1024) {
        document.getElementById('applicants-panel')?.scrollIntoView({ behavior: 'smooth' });
      }
    } catch (err) { 
      console.error(err); 
      alert('Failed to load applicants');
    } finally {
      setAppsLoading(false);
    }
  };

  const handleUpdateStatus = async (applicationId, status) => {
    try {
      await api.put(`/applications/${applicationId}/status?status=${status}`);
      fetchApplications(selectedJob);
      const statsRes = await api.get(`/jobs/recruiter/${user.id}/stats`);
      setStats(statsRes.data);
    } catch (err) { alert('Status update failed'); }
  };

  const handleUpdateNotes = async (applicationId) => {
    try {
      await api.put(`/applications/${applicationId}/notes`, { notes: tempNotes }, {
        headers: { 'Content-Type': 'application/json' }
      });
      setEditingNotesId(null);
      fetchApplications(selectedJob);
    } catch (err) { alert('Notes update failed'); }
  };

  const downloadCSV = () => {
    if (!selectedJob || applications.length === 0) return;
    const headers = ['Name', 'Email', 'Status', 'Applied At', 'Notes'];
    const rows = applications.map(app => [
      app.applicantName,
      app.applicantEmail,
      app.status,
      new Date(app.appliedAt).toLocaleDateString(),
      app.notes || ''
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `applicants_${selectedJob.title.replace(/\s+/g, '_')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredJobs = jobs.filter(job => 
    job.title?.toLowerCase().includes(jobSearch.toLowerCase()) || 
    job.skills?.toLowerCase().includes(jobSearch.toLowerCase())
  );

  const filteredApplicants = applications.filter(app => 
    app.applicantName?.toLowerCase().includes(applicantSearch.toLowerCase()) || 
    app.applicantEmail?.toLowerCase().includes(applicantSearch.toLowerCase())
  );

  const resetJobForm = () => {
    setJobForm({ title: '', description: '', salary: '', location: '', skills: '', status: 'ACTIVE', jobType: 'FULL_TIME' });
    setIsEditing(false);
    setEditingJobId(null);
  };

  const getSuggestedSkills = () => {
    if (!jobForm.title) return [];
    const match = Object.keys(SKILL_MAP).find(key => jobForm.title.toLowerCase().includes(key));
    if (!match) return [];
    
    const suggested = SKILL_MAP[match].split(', ');
    return suggested.filter(s => !jobForm.skills.toLowerCase().includes(s.toLowerCase()));
  };

  const addSkill = (skill) => {
    const combined = jobForm.skills 
      ? `${jobForm.skills}, ${skill}`
      : skill;
    setJobForm({...jobForm, skills: combined});
  };

  const openEditForm = (job, e) => {
    e.stopPropagation();
    setJobForm({ ...job });
    setEditingJobId(job.id);
    setIsEditing(true);
    setShowJobForm(true);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500 transition-colors">
      {/* 1. Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-heading font-bold text-slate-900 dark:text-white mb-2 transition-colors">Recruiter Dashboard</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium transition-colors">Welcome back, {user.name}. Here's what's happening today.</p>
        </div>
        <div className="flex gap-3">
           <Button variant="secondary" onClick={fetchData}>🔄 Sync Data</Button>
           <Button 
            onClick={() => { 
              if (!user.isVerified) {
                alert("Account not verified. You cannot post jobs until admin approves your profile.");
                return;
              }
              resetJobForm(); 
              setShowJobForm(true); 
            }}
            className={!user.isVerified ? 'bg-slate-400 cursor-not-allowed opacity-50' : ''}
            disabled={!user.isVerified}
           >
            {user.isVerified ? '+ Create New Listing' : '🚫 Verification Pending'}
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Jobs', value: stats.totalJobsPosted, icon: '💼', color: 'indigo' },
          { label: 'Total Applicants', value: stats.totalApplicationsReceived, icon: '📥', color: 'blue' },
          { label: 'Active Openings', value: stats.activeJobs, icon: '🟢', color: 'emerald' },
          { label: 'Shortlisted', value: stats.shortlistedCandidates, icon: 'â­', color: 'amber' },
        ].map((stat, i) => (
          <Card key={i} className="p-6 flex items-center space-x-4 border-l-4 border-l-primary-500" hover={false}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl bg-slate-50 dark:bg-slate-800 text-primary-600 dark:text-primary-400 transition-colors">
              {stat.icon}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">{stat.label}</p>
              <p className="text-2xl font-heading font-bold text-slate-900 dark:text-white transition-colors">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* 2. Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Job Management */}
        <div className="lg:col-span-6 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-heading font-bold text-slate-800 dark:text-slate-200 transition-colors">Your Listings</h3>
            <div className="relative w-1/2">
              <input 
                type="text" 
                placeholder="Search jobs..." 
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 outline-none dark:text-white transition-all"
                value={jobSearch}
                onChange={(e) => setJobSearch(e.target.value)}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">ðŸ”</span>
            </div>
          </div>

          <div className="space-y-4">
            {filteredJobs.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 transition-colors">
                No jobs found.
              </div>
            ) : (
              filteredJobs.map(job => (
                <Card 
                  key={job.id} 
                  onClick={() => fetchApplications(job)}
                  className={`p-5 cursor-pointer border-2 transition-all ${selectedJob?.id === job.id ? 'border-primary-500 bg-primary-50/10 dark:bg-primary-500/5' : 'border-slate-100 dark:border-slate-800'}`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="text-lg font-bold text-slate-900 dark:text-white leading-tight transition-colors">{job.title}</h4>
                    <div className="flex gap-2">
                      <Badge variant={job.status === 'ACTIVE' ? 'green' : 'gray'}>{job.status}</Badge>
                      <Badge variant="blue">{job.jobType?.replace('_', ' ')}</Badge>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 transition-colors">
                    <span>ðŸ“ {job.location}</span>
                    <span>💰 {job.salary}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-slate-100 dark:border-slate-800 transition-colors">
                    <button 
                      className="text-primary-600 dark:text-primary-400 font-bold text-xs hover:underline outline-none"
                      onClick={(e) => { e.stopPropagation(); fetchApplications(job); }}
                    >
                      View Applicants â†’
                    </button>
                    <div className="flex space-x-2">
                      <Button variant="ghost" size="sm" onClick={(e) => openEditForm(job, e)}>Edit</Button>
                      <Button variant="ghost" size="sm" onClick={(e) => handleDeleteJob(job.id, e)} className="text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10">Delete</Button>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Right Column: Applicants & Insights */}
        <div className="lg:col-span-6 space-y-6" id="applicants-panel">
          <Card className="overflow-hidden border-slate-200 dark:border-slate-800 min-h-[600px]" hover={false}>
            <div className="bg-slate-900 dark:bg-slate-950 text-white p-5 flex justify-between items-center transition-colors">
              <div>
                <h3 className="font-bold">
                  {selectedJob ? `Applicants for ${selectedJob.title}` : 'Candidate Review'}
                </h3>
                {selectedJob && <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">{applications.length} Candidates total</p>}
              </div>
              {selectedJob && applications.length > 0 && (
                <Button variant="emerald" size="sm" onClick={downloadCSV}>📥 Export CSV</Button>
              )}
            </div>
            
            <div className="p-4 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
              <input 
                type="text" 
                placeholder="Filter applicants by name or email..." 
                className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 outline-none dark:text-white transition-all"
                value={applicantSearch}
                onChange={(e) => setApplicantSearch(e.target.value)}
                disabled={!selectedJob}
              />
            </div>

            <div className="p-6 max-h-[700px] overflow-y-auto space-y-6">
              {appsLoading ? (
                <div className="text-center py-20 transition-colors">
                  <div className="animate-spin text-4xl mb-4 text-primary-600 dark:text-primary-400">⌛</div>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">Fetching candidates...</p>
                </div>
              ) : !selectedJob ? (
                <div className="text-center py-20 text-slate-400 dark:text-slate-500 flex flex-col items-center transition-colors">
                  <div className="text-6xl mb-6">🎯</div>
                  <p className="text-sm font-medium">Select a job from the list to start reviewing talent.</p>
                </div>
              ) : filteredApplicants.length === 0 ? (
                <div className="text-center py-10 text-slate-400 dark:text-slate-500 text-sm transition-colors">No applicants found matching your filter.</div>
              ) : (
                filteredApplicants.map(app => (
                  <div key={app.id} className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm space-y-5 transition-colors">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-primary-100 dark:bg-primary-500/10 text-primary-700 dark:text-primary-400 rounded-full flex items-center justify-center font-bold transition-colors">
                          {app.applicantName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white transition-colors">{app.applicantName}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium transition-colors">{app.applicantEmail}</p>
                        </div>
                      </div>
                      <Badge variant={app.status === 'SHORTLISTED' ? 'green' : app.status === 'REJECTED' ? 'red' : 'blue'}>
                        {app.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                       <select 
                        className="text-[11px] font-bold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white rounded-lg px-3 py-2 outline-none cursor-pointer transition-colors"
                        value={app.status}
                        onChange={(e) => handleUpdateStatus(app.id, e.target.value)}
                      >
                        <option value="APPLIED">SET STATUS: APPLIED</option>
                        <option value="SHORTLISTED">SHORTLISTED</option>
                        <option value="REJECTED">REJECTED</option>
                      </select>
                      <Button size="sm" variant="secondary" onClick={() => setViewingResume(`http://localhost:8080/uploads/resumes/${app.resumePath}`)}>
                        ðŸ‘ï¸ Preview CV
                      </Button>
                    </div>

                    {/* Notes Section */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800 transition-colors">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Internal Notes</p>
                        {editingNotesId === app.id ? (
                           <div className="flex gap-2">
                             <button onClick={() => handleUpdateNotes(app.id)} className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">Save</button>
                             <button onClick={() => setEditingNotesId(null)} className="text-[10px] font-bold text-rose-500 dark:text-rose-400 uppercase">Cancel</button>
                           </div>
                        ) : (
                           <button onClick={() => { setEditingNotesId(app.id); setTempNotes(app.notes || ''); }} className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase">Edit</button>
                        )}
                      </div>
                      {editingNotesId === app.id ? (
                        <textarea 
                          className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-lg p-2 text-xs outline-none h-20 transition-all"
                          value={tempNotes}
                          onChange={(e) => setTempNotes(e.target.value)}
                          placeholder="Add feedback about this candidate..."
                        />
                      ) : (
                        <p className="text-xs text-slate-600 dark:text-slate-400 italic transition-colors">
                          {app.notes || 'No notes added yet. Click edit to add feedback.'}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Modals & Overlays */}
      {showJobForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <Card className="w-full max-w-2xl p-8 dark:bg-slate-900" hover={false}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-heading font-bold text-slate-900 dark:text-white transition-colors">{isEditing ? 'Update Listing' : 'Post New Opportunity'}</h3>
              <button onClick={() => setShowJobForm(false)} className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 transition-colors text-2xl">&times;</button>
            </div>
            <form onSubmit={handleSaveJob} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 block transition-colors">Job Title</label>
                  <input type="text" required className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none dark:text-white transition-all" value={jobForm.title} onChange={e => setJobForm({...jobForm, title: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 block transition-colors">Status</label>
                  <select className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none dark:text-white transition-all" value={jobForm.status} onChange={e => setJobForm({...jobForm, status: e.target.value})}>
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="CLOSED">CLOSED</option>
                  </select>
                </div>
                <div className="col-span-2 md:col-span-1">
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 block transition-colors">Job Type</label>
                  <select className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none dark:text-white transition-all" value={jobForm.jobType} onChange={e => setJobForm({...jobForm, jobType: e.target.value})}>
                    <option value="FULL_TIME">FULL TIME</option>
                    <option value="PART_TIME">PART TIME</option>
                    <option value="CONTRACT">CONTRACT</option>
                    <option value="REMOTE">REMOTE</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 block transition-colors">Location</label>
                  <input type="text" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none dark:text-white transition-all" value={jobForm.location} onChange={e => setJobForm({...jobForm, location: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 block transition-colors">Salary Range</label>
                  <input type="text" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none dark:text-white transition-all" value={jobForm.salary} onChange={e => setJobForm({...jobForm, salary: e.target.value})} />
                </div>
              </div>

              {getSuggestedSkills().length > 0 && (
                <div className="p-4 bg-primary-50 dark:bg-primary-500/5 border border-primary-100 dark:border-primary-500/10 rounded-2xl animate-in slide-in-from-top-2 duration-300">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">âœ¨</span>
                      <span className="text-[10px] font-bold text-primary-600 dark:text-primary-400 uppercase tracking-widest">Suggested Skills</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => {
                        const newSkills = getSuggestedSkills();
                        const combined = jobForm.skills 
                          ? `${jobForm.skills}, ${newSkills.join(', ')}`
                          : newSkills.join(', ');
                        setJobForm({...jobForm, skills: combined});
                      }}
                      className="text-[9px] font-bold text-primary-600 hover:underline uppercase"
                    >
                      Add All
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {getSuggestedSkills().map(skill => (
                      <button 
                        key={skill}
                        type="button"
                        onClick={() => addSkill(skill)}
                        className="flex items-center space-x-1 px-2.5 py-1 bg-white dark:bg-slate-800 border border-primary-100 dark:border-primary-500/20 rounded-lg hover:bg-primary-600 hover:text-white transition-all shadow-sm text-[10px] font-bold"
                      >
                         <span>+ {skill}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 block transition-colors">Required Skills (Comma separated)</label>
                <input type="text" placeholder="React, Node.js, SQL" className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none dark:text-white transition-all" value={jobForm.skills} onChange={e => setJobForm({...jobForm, skills: e.target.value})} />
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 block transition-colors">Detailed Description</label>
                <textarea required rows={4} className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/20 outline-none dark:text-white transition-all" value={jobForm.description} onChange={e => setJobForm({...jobForm, description: e.target.value})} />
              </div>
              <Button type="submit" size="lg" className="w-full">{isEditing ? 'Save Changes' : 'Post Job Listing'}</Button>
            </form>
          </Card>
        </div>
      )}

      {viewingResume && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/90 dark:bg-black/90 backdrop-blur-md p-4 animate-in zoom-in duration-300">
          <div className="w-full max-w-5xl h-[90vh] bg-white dark:bg-slate-900 rounded-2xl overflow-hidden flex flex-col shadow-2xl transition-colors">
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950 transition-colors">
              <span className="font-bold text-slate-900 dark:text-white text-sm">Resume Previewer</span>
              <Button variant="ghost" size="sm" onClick={() => setViewingResume(null)}>Close</Button>
            </div>
            <iframe src={viewingResume} className="w-full flex-1 bg-white" />
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterDashboard;
