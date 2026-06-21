import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { Search, Filter, Eye, CheckCircle, XCircle, Clock, FileText, Download, Save, Briefcase, Users } from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';

const RecruiterApplicants = () => {
  const { user } = useContext(AuthContext);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [editingNotesId, setEditingNotesId] = useState(null);
  const [tempNotes, setTempNotes] = useState('');

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const [jobsRes, appsRes] = await Promise.all([
        api.get(`/jobs/recruiter/${user.id}`),
        api.get(`/applications/recruiter/${user.id}`)
      ]);
      setJobs(Array.isArray(jobsRes.data) ? jobsRes.data : []);
      setApplications(Array.isArray(appsRes.data) ? appsRes.data : []);
    } catch (err) { 
      console.error("Fetch error:", err);
      setJobs([]);
      setApplications([]);
    } finally { 
      setLoading(false); 
    }
  };

  const handleUpdateStatus = async (appId, status) => {
    try {
      await api.put(`/applications/${appId}/status?status=${status}`);
      fetchData();
    } catch (err) { alert('Failed to update status'); }
  };

  const handleUpdateNotes = async (appId) => {
    try {
      await api.put(`/applications/${appId}/notes`, { notes: tempNotes });
      setEditingNotesId(null);
      fetchData();
    } catch (err) { alert('Failed to save notes'); }
  };

  const handlePreviewResume = (app) => {
    if (!app.resumePath) {
      alert('No resume file is available for this applicant.');
      return;
    }
    window.open(`http://localhost:8080/uploads/resumes/${app.resumePath}`, '_blank', 'noopener,noreferrer');
  };

  const exportToCSV = () => {
    const headers = ["Applicant Name", "Email", "Job", "Status", "Applied At", "Notes"];
    const rows = filteredApps.map(app => [
      app.applicantName,
      app.applicantEmail,
      app.jobTitle,
      app.status,
      new Date(app.appliedAt).toLocaleDateString(),
      app.notes || ""
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `applicants_export_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
  };

  const filteredApps = applications.filter(app => {
    const matchesJob = selectedJobId === 'ALL' || app.jobId?.toString() === selectedJobId;
    const matchesStatus = statusFilter === 'ALL' || app.status === statusFilter;
    return matchesJob && matchesStatus;
  });

  if (loading) return <div className="text-center py-20 font-medium text-slate-500 dark:text-slate-400 animate-pulse">Retrieving Applications...</div>;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-8 md:p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <h2 className="text-4xl md:text-5xl font-heading font-bold tracking-tight mb-2">Talent Pipeline</h2>
            <p className="text-slate-400 text-lg font-medium max-w-xl">
              Monitor and manage candidate progress through your hiring funnel.
            </p>
          </div>
          <Button 
            onClick={exportToCSV} 
            variant="ghost" 
            className="glass border-white/20 text-white hover:bg-white/10 shadow-2xl rounded-2xl px-8 h-14 font-bold flex items-center"
          >
             <Download size={20} className="mr-2 text-blue-400" />
             <span>Export Report</span>
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      <Card className="p-8 border-transparent glass rounded-[2.5rem] shadow-xl" hover={false}>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
               <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1 block">Filter by Position</label>
               <div className="relative">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <select 
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer text-sm font-bold dark:text-white transition-all"
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                  >
                    <option value="ALL">All Active Jobs</option>
                    {jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}
                  </select>
               </div>
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] ml-1 block">Candidate Status</label>
               <div className="relative">
                  <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <select 
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500/20 cursor-pointer text-sm font-bold dark:text-white transition-all"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="ALL">All Applicants</option>
                    <option value="APPLIED">New Applied</option>
                    <option value="SHORTLISTED">Shortlisted</option>
                    <option value="REJECTED">Rejected</option>
                  </select>
               </div>
            </div>
         </div>
      </Card>

      {/* Applicants List */}
      <div className="space-y-8">
        {filteredApps.length === 0 ? (
          <Card className="p-20 text-center border-dashed border-2 border-slate-200 dark:border-slate-800 rounded-[3rem]" hover={false}>
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Users className="text-slate-300 dark:text-slate-700" size={40} />
            </div>
            <h3 className="text-xl font-heading font-bold text-slate-900 dark:text-white mb-2 transition-colors">No Candidates Found</h3>
            <p className="text-slate-500 dark:text-slate-400 font-medium max-w-sm mx-auto">Try adjusting your filters to find the right talent for your positions.</p>
          </Card>
        ) : (
          filteredApps.map(app => (
            <Card key={app.id} className="p-0 border-transparent glass group overflow-hidden rounded-[2.5rem] shadow-xl hover:-translate-y-1 transition-all duration-300" hover={false}>
              <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
                 <div className="flex items-center space-x-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center font-bold text-3xl border border-emerald-500/20 group-hover:scale-105 transition-transform duration-300">
                      {app.applicantName?.charAt(0) || 'A'}
                    </div>
                    <div>
                      <div className="flex items-center space-x-3 mb-1">
                        <h4 className="text-2xl font-heading font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">{app.applicantName || 'Anonymous Applicant'}</h4>
                        <Badge variant={app.status === 'SHORTLISTED' ? 'green' : app.status === 'REJECTED' ? 'red' : 'blue'} className="text-[9px] uppercase tracking-widest px-3 py-1">
                          {app.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-3">{app.applicantEmail}</p>
                      <div className="flex items-center space-x-4">
                         <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter bg-emerald-500/5 px-2.5 py-1 rounded-lg ring-1 ring-emerald-500/10">
                           {app.jobTitle}
                         </span>
                         <div className="flex items-center text-slate-400 text-[11px] font-bold uppercase tracking-widest">
                           <Clock size={12} className="mr-1.5" />
                           {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'N/A'}
                         </div>
                      </div>
                    </div>
                 </div>

                 <div className="flex flex-col md:items-end gap-4">
                    <div className="flex items-center space-x-3">
                       <Button 
                         variant={app.status === 'SHORTLISTED' ? 'emerald' : 'secondary'} 
                         onClick={() => handleUpdateStatus(app.id, 'SHORTLISTED')}
                         className="rounded-xl font-bold shadow-lg shadow-emerald-500/10"
                       >
                          Shortlist
                       </Button>
                       <Button 
                         variant="ghost" 
                         onClick={() => handleUpdateStatus(app.id, 'REJECTED')} 
                         className="text-rose-500 hover:bg-rose-500/10 rounded-xl font-bold"
                       >
                          Reject
                       </Button>
                    </div>
                    <Button
                      variant="ghost"
                      className="text-indigo-600 dark:text-indigo-400 flex items-center space-x-2 hover:bg-indigo-500/5 font-bold rounded-xl"
                      onClick={() => handlePreviewResume(app)}
                    >
                       <Eye size={18} />
                       <span>Preview Resume</span>
                    </Button>
                 </div>
              </div>

              {/* Internal Notes Bar */}
              <div className="px-8 py-5 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center gap-6 transition-colors">
                 <div className="flex-1">
                    {editingNotesId === app.id ? (
                      <div className="flex gap-3">
                         <input 
                           className="flex-1 bg-white dark:bg-slate-900 border-none rounded-xl px-5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 dark:text-white transition-all shadow-sm"
                           value={tempNotes}
                           onChange={(e) => setTempNotes(e.target.value)}
                           placeholder="Enter internal candidate feedback..."
                           autoFocus
                         />
                         <button onClick={() => handleUpdateNotes(app.id)} className="w-10 h-10 flex items-center justify-center bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20">
                           <Save size={18} />
                         </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between group/notes cursor-pointer" onClick={() => { setEditingNotesId(app.id); setTempNotes(app.notes || ''); }}>
                         <div className="flex items-center space-x-3">
                            <FileText size={16} className="text-slate-400" />
                            <p className="text-sm text-slate-500 dark:text-slate-400 italic font-medium">
                              {app.notes || 'Click to add internal interview notes or feedback...'}
                            </p>
                         </div>
                         <span className="text-[10px] font-bold text-indigo-600 opacity-0 group-hover/notes:opacity-100 transition-opacity uppercase tracking-widest">
                           Add Feedback
                         </span>
                      </div>
                    )}
                 </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default RecruiterApplicants;
