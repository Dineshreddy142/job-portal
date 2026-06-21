import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { Plus, Edit2, Trash2, MapPin, Briefcase, IndianRupee, Clock, Search } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import DateTimePicker from '../components/common/DateTimePicker';

const RecruiterJobs = () => {
  const { user } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showJobForm, setShowJobForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  const [jobForm, setJobForm] = useState({ title: '', description: '', salary: '', location: '', skills: '', status: 'ACTIVE', jobType: 'FULL_TIME', deadline: '' });
  const [searchTerm, setSearchTerm] = useState('');

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
    fetchJobs();
  }, [user]);

  const fetchJobs = async () => {
    try {
      const res = await api.get(`/jobs/recruiter/${user.id}`);
      setJobs(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSaveJob = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) await api.put(`/jobs/${editingJobId}`, { ...jobForm });
      else await api.post('/jobs', { ...jobForm });
      setShowJobForm(false);
      resetJobForm();
      fetchJobs();
    } catch (err) { alert('Failed to save job'); }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await api.delete(`/jobs/${jobId}`);
      fetchJobs();
    } catch (err) { alert('Failed to delete job'); }
  };

  const resetJobForm = () => {
    setJobForm({ title: '', description: '', salary: '', location: '', skills: '', status: 'ACTIVE', jobType: 'FULL_TIME', deadline: '' });
    setIsEditing(false);
    setEditingJobId(null);
  };

  const openEditForm = (job) => {
    setJobForm({ ...job });
    setEditingJobId(job.id);
    setIsEditing(true);
    setShowJobForm(true);
  };

  const filteredJobs = jobs.filter(j => j.title.toLowerCase().includes(searchTerm.toLowerCase()));

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

  if (loading) return <div className="text-center py-20 font-medium text-slate-500 dark:text-slate-400 animate-pulse">Synchronizing Listings...</div>;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-8 md:p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h2 className="text-4xl md:text-5xl font-heading font-bold tracking-tight mb-2">Manage Listings</h2>
            <p className="text-slate-400 text-lg font-medium max-w-xl">
              Create and optimize your job postings to attract the best talent.
            </p>
          </div>
          <div className="flex items-center space-x-4">
             <div className="relative glass border-white/10 rounded-2xl p-1.5 flex items-center">
                <Search className="ml-3 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search titles..." 
                  className="bg-transparent border-none text-white text-sm px-3 py-2 outline-none w-48 placeholder:text-slate-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
              <Button 
                onClick={() => { 
                  if (!user.isVerified) {
                    alert("Your account is not verified by admin. You cannot post jobs yet.");
                    return;
                  }
                  resetJobForm(); 
                  setShowJobForm(true); 
                }} 
                size="lg" 
                className={`shadow-xl rounded-2xl px-8 ${!user.isVerified ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white border-none'}`}
                disabled={!user.isVerified}
              >
                <Plus size={20} className="mr-2" />
                <span>{user.isVerified ? 'Post New Job' : 'Awaiting Verification'}</span>
              </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredJobs.map(job => (
          <Card key={job.id} className="p-0 border-transparent glass group overflow-hidden hover:-translate-y-2 transition-all duration-500 rounded-[2.5rem]" shadow="xl" hover={false}>
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                 <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                   {job.title.charAt(0)}
                 </div>
                 <div className="flex items-center space-x-1.5 px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{job.status}</span>
                 </div>
              </div>
              
              <h3 className="text-2xl font-heading font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors leading-tight mb-4">{job.title}</h3>
              
              <div className="space-y-3 mb-8">
                <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm font-medium">
                  <MapPin size={16} className="mr-2 text-slate-400" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center text-slate-500 dark:text-slate-400 text-sm font-medium">
                  <Clock size={16} className="mr-2 text-slate-400" />
                  <span>{job.jobType?.replace('_', ' ')}</span>
                </div>
                <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-bold">
                  <IndianRupee size={16} className="mr-1" />
                  <span>{job.salary}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {job.skills?.split(',').slice(0, 3).map(skill => (
                  <span key={skill} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded-lg uppercase tracking-tight">
                    {skill.trim()}
                  </span>
                ))}
                {(job.skills?.split(',').length > 3) && (
                  <span className="px-3 py-1 bg-blue-50 dark:bg-blue-500/10 text-blue-600 text-[10px] font-bold rounded-lg">
                    +{job.skills.split(',').length - 3} more
                  </span>
                )}
              </div>
            </div>

            <div className="px-8 py-6 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
               <div className="flex items-center space-x-2">
                 <button onClick={() => openEditForm(job)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-xl transition-all">
                   <Edit2 size={18} />
                 </button>
                 <button onClick={() => handleDeleteJob(job.id)} className="w-10 h-10 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-all">
                   <Trash2 size={18} />
                 </button>
               </div>
               <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-white dark:bg-slate-900 px-3 py-1 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm">
                 {job.deadline ? `Due ${new Date(job.deadline).toLocaleDateString()}` : `Posted ${new Date(job.createdAt).toLocaleDateString()}`}
               </p>
            </div>
          </Card>
        ))}
      </div>

      {showJobForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
          <Card className="w-full max-w-2xl p-0 border-transparent glass rounded-[2.5rem] overflow-visible shadow-2xl" hover={false}>
             <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 transition-colors">
                <div>
                  <h3 className="text-2xl font-heading font-bold text-slate-900 dark:text-white">{isEditing ? 'Edit Listing' : 'Post New Opportunity'}</h3>
                  <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">Fill in the details for your new role</p>
                </div>
                <button onClick={() => setShowJobForm(false)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-rose-500 transition-colors">&times;</button>
             </div>
             
             <div className="p-8 max-h-[85vh] overflow-y-visible">
               <form id="jobForm" onSubmit={handleSaveJob} className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1 block">Job Title</label>
                     <input 
                       type="text" 
                       required 
                       className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 dark:text-white outline-none transition-all placeholder:text-slate-400" 
                       value={jobForm.title} 
                       onChange={e => setJobForm({...jobForm, title: e.target.value})} 
                       placeholder="e.g. Senior Software Architect"
                     />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1 block">Employment Type</label>
                     <select className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 dark:text-white outline-none transition-all cursor-pointer" value={jobForm.jobType} onChange={e => setJobForm({...jobForm, jobType: e.target.value})}>
                       <option value="FULL_TIME">Full Time</option>
                       <option value="PART_TIME">Part Time</option>
                       <option value="CONTRACT">Contract</option>
                       <option value="REMOTE">Remote</option>
                     </select>
                   </div>
                 </div>

                 {getSuggestedSkills().length > 0 && (
                   <div className="p-6 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl animate-in slide-in-from-top-4 duration-500">
                      <div className="flex justify-between items-center mb-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-xl">âœ¨</span>
                          <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Smart Skill Suggestions</span>
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
                          className="text-[10px] font-bold text-indigo-600 hover:underline uppercase"
                        >
                          Add All
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {getSuggestedSkills().map(skill => (
                          <button 
                            key={skill}
                            type="button"
                            onClick={() => addSkill(skill)}
                            className="group flex items-center space-x-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-indigo-100 dark:border-indigo-500/20 rounded-xl hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                          >
                             <Plus size={10} className="group-hover:scale-125 transition-transform" />
                             <span className="text-[11px] font-bold">{skill}</span>
                          </button>
                        ))}
                      </div>
                   </div>
                 )}

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1 block">Location</label>
                     <input type="text" className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 dark:text-white outline-none transition-all" value={jobForm.location} onChange={e => setJobForm({...jobForm, location: e.target.value})} placeholder="e.g. Remote / Bangalore" />
                   </div>
                   <div className="space-y-2">
                     <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1 block">Salary (LPA)</label>
                     <input type="text" className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 dark:text-white outline-none transition-all" value={jobForm.salary} onChange={e => setJobForm({...jobForm, salary: e.target.value})} placeholder="e.g. 12 - 18 LPA" />
                   </div>
                   <DateTimePicker 
                     label="Application Deadline" 
                     value={jobForm.deadline} 
                     onChange={val => setJobForm({...jobForm, deadline: val})} 
                   />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1 block">Required Skills (Comma separated)</label>
                    <input type="text" placeholder="React, Node.js, SQL" className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 dark:text-white outline-none transition-all" value={jobForm.skills} onChange={e => setJobForm({...jobForm, skills: e.target.value})} />
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1 block">Description</label>
                    <textarea required rows={4} className="w-full px-5 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-blue-500/20 dark:text-white outline-none transition-all" value={jobForm.description} onChange={e => setJobForm({...jobForm, description: e.target.value})} placeholder="Outline the responsibilities and requirements..." />
                 </div>
               </form>
             </div>

             <div className="p-8 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end space-x-4">
                <Button variant="ghost" onClick={() => setShowJobForm(false)} className="text-slate-500 font-bold px-6">Cancel</Button>
                <Button type="submit" form="jobForm" size="lg" className="px-10 rounded-2xl shadow-xl shadow-blue-500/20">{isEditing ? 'Update Listing' : 'Publish Job'}</Button>
             </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default RecruiterJobs;
