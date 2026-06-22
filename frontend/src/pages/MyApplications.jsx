import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { Brain, Sparkles, CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react';

const MyApplications = () => {
  const { user } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedAppId, setExpandedAppId] = useState(null);

  useEffect(() => {
    if (user?.id) fetchApplications();
  }, [user]);

  const fetchApplications = async () => {
    try {
      const [appRes, scoreRes] = await Promise.all([
        api.get(`/applications/applicant/${user.id}`),
        api.get(`/applications/applicant/${user.id}/ai-scores`)
      ]);
      
      const apps = appRes.data;
      const scores = scoreRes.data;
      
      const merged = apps.map(app => {
        const scoreData = scores.find(s => s.applicationId === app.id);
        return { ...app, aiMatch: scoreData };
      });
      
      setApplications(merged);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (!score) return 'slate';
    if (score >= 80) return 'emerald';
    if (score >= 50) return 'blue';
    return 'amber';
  };

  const toggleExpand = (appId) => {
    setExpandedAppId(expandedAppId === appId ? null : appId);
  };

  if (loading) return <div className="text-center py-20 dark:text-slate-400">Loading your applications...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 transition-colors">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-heading font-bold text-slate-900 dark:text-white mb-2 transition-colors">My Applications</h2>
          <p className="text-slate-500 dark:text-slate-400 transition-colors">Track the status and ATS match scores of your job applications in real-time.</p>
        </div>
      </div>

      {applications.length === 0 ? (
        <Card className="p-20 text-center flex flex-col items-center border-dashed border-2 bg-transparent dark:border-slate-800" hover={false}>
          <div className="text-6xl mb-6">📂</div>
          <h3 className="text-2xl font-heading font-bold text-slate-900 dark:text-white mb-2">No applications yet</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm">You haven't applied to any jobs. Start your search now and find your dream role!</p>
          <Button onClick={() => window.location.href = '/jobs'}>Explore Jobs</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {applications.map(app => (
            <Card key={app.id} className="p-0 overflow-hidden flex flex-col group transition-all duration-300" hover={false}>
              <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900">
                <div className="flex items-center space-x-6">
                  <div className="relative w-16 h-16 flex-shrink-0">
                    {app.aiMatch ? (
                       <svg className="w-full h-full transform -rotate-90">
                         <circle className="text-slate-100 dark:text-slate-800" strokeWidth="6" stroke="currentColor" fill="transparent" r="28" cx="32" cy="32" />
                         <circle className={`text-${getScoreColor(app.aiMatch.matchScore)}-500`} strokeWidth="6" strokeDasharray={28 * 2 * Math.PI} strokeDashoffset={28 * 2 * Math.PI * (1 - app.aiMatch.matchScore / 100)} strokeLinecap="round" stroke="currentColor" fill="transparent" r="28" cx="32" cy="32" />
                       </svg>
                    ) : (
                       <div className="w-full h-full bg-primary-50 dark:bg-primary-500/10 rounded-2xl border border-primary-100 dark:border-primary-500/20"></div>
                    )}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                       {app.aiMatch ? (
                         <span className="text-sm font-extrabold text-slate-900 dark:text-white">{app.aiMatch.matchScore}%</span>
                       ) : (
                         <span className="text-xl font-bold text-primary-600 dark:text-primary-400">{app.jobTitle?.charAt(0)}</span>
                       )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-xl font-heading font-bold text-slate-900 dark:text-white group-hover:text-primary-600 transition-colors">{app.jobTitle}</h4>
                    <div className="flex items-center space-x-3 text-sm text-slate-500 dark:text-slate-400 font-medium mt-1 transition-colors">
                      <span>Applied on: {new Date(app.appliedAt).toLocaleDateString()}</span>
                      <span className="w-1 h-1 bg-slate-300 dark:bg-slate-700 rounded-full"></span>
                      <span>ID: #{app.id}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col md:items-end gap-3">
                  <Badge variant={
                    app.status === 'SHORTLISTED' ? 'green' : 
                    app.status === 'REJECTED' ? 'red' : 'blue'
                  } className="px-4 py-1 text-sm uppercase">
                    {app.status}
                  </Badge>
                  {app.aiMatch && (
                     <button 
                       onClick={() => toggleExpand(app.id)}
                       className="flex items-center text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest hover:text-blue-700 transition-colors"
                     >
                       <Sparkles size={12} className="mr-1" />
                       {expandedAppId === app.id ? 'Hide ATS Insights' : 'View ATS Insights'}
                       {expandedAppId === app.id ? <ChevronUp size={14} className="ml-1" /> : <ChevronDown size={14} className="ml-1" />}
                     </button>
                  )}
                </div>
              </div>

              {/* Collapsible ATS Insights Section */}
              {expandedAppId === app.id && app.aiMatch && (
                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 animate-in slide-in-from-top-2 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* AI Summary */}
                    <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 relative overflow-hidden shadow-sm">
                      <div className="absolute top-0 right-0 p-4 opacity-5">
                        <Brain size={40} className="text-blue-600" />
                      </div>
                      <h5 className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] mb-3 flex items-center">
                        <Sparkles size={12} className="mr-2" />
                        AI ATS Analysis
                      </h5>
                      <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed italic">
                        "{app.aiMatch.aiSummary}"
                      </p>
                    </div>

                    {/* Skills Matrix */}
                    <div className="space-y-4">
                       <div>
                         <h5 className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em] mb-2 flex items-center">
                           <CheckCircle2 size={12} className="mr-2" />
                           Matching Skills Found
                         </h5>
                         <div className="flex flex-wrap gap-2">
                           {app.aiMatch.matchingSkills.length > 0 ? app.aiMatch.matchingSkills.map(skill => (
                             <Badge key={skill} variant="emerald" className="text-[9px] px-2.5 py-1">{skill}</Badge>
                           )) : <span className="text-xs text-slate-400 italic">No direct skill matches found in resume.</span>}
                         </div>
                       </div>
                       <div>
                         <h5 className="text-[10px] font-bold text-rose-500 uppercase tracking-[0.2em] mb-2 flex items-center">
                           <XCircle size={12} className="mr-2" />
                           Missing Keywords / Gaps
                         </h5>
                         <div className="flex flex-wrap gap-2">
                           {app.aiMatch.missingSkills.length > 0 ? app.aiMatch.missingSkills.map(skill => (
                             <Badge key={skill} variant="red" className="text-[9px] px-2.5 py-1 bg-rose-500/5 text-rose-500 border-rose-500/20">{skill}</Badge>
                           )) : <span className="text-xs text-emerald-500 font-bold">Perfect Keyword Alignment!</span>}
                         </div>
                       </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplications;
