import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { 
  Sparkles, 
  Brain, 
  Target, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  User, 
  Search, 
  FileText,
  ChevronRight,
  Loader2,
  TrendingUp,
  BrainCircuit
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';

const AiMatcher = () => {
  const { user } = useContext(AuthContext);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user?.id) fetchMatches();
  }, [user]);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      setAnalyzing(true);
      setError(null);
      
      // Simulate AI analysis time for premium feel
      const startTime = Date.now();
      const response = await api.get(`/applications/ai-matcher/${user.id}`);
      const duration = Date.now() - startTime;
      
      // Ensure analysis animation plays for at least 2.5 seconds
      const minWait = 2500;
      if (duration < minWait) {
        await new Promise(resolve => setTimeout(resolve, minWait - duration));
      }
      
      setCandidates(response.data);
    } catch (err) {
      console.error("Match Fetch Error:", err);
      setError("Failed to initialize AI matching engine. Please try again.");
    } finally {
      setAnalyzing(false);
      setLoading(false);
    }
  };

  const filteredCandidates = candidates.filter(c => 
    c.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getScoreColor = (score) => {
    if (score >= 80) return 'emerald';
    if (score >= 50) return 'blue';
    return 'amber';
  };

  if (analyzing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-10 animate-in fade-in duration-1000">
        <div className="relative">
          <div className="w-32 h-32 rounded-full bg-blue-500/20 animate-ping absolute"></div>
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-2xl relative z-10 border-4 border-white/20">
            <BrainCircuit size={60} className="text-white animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-heading font-bold text-slate-900 dark:text-white tracking-tight">AI Matching Engine Active</h2>
          <div className="flex flex-col items-center gap-2">
            <p className="text-slate-500 dark:text-slate-400 font-medium text-lg">Analyzing resumes and cross-referencing job requirements...</p>
            <div className="flex gap-1.5 mt-2">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0s]"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
          {[
            { label: 'Keyword Extraction', icon: Zap },
            { label: 'Skill Validation', icon: Target },
            { label: 'Insight Generation', icon: Sparkles },
          ].map((item, i) => (
            <div key={i} className="flex items-center space-x-3 p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm animate-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${i * 200}ms` }}>
              <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                <item.icon size={18} />
              </div>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-tighter">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-8 md:p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 bg-blue-500/20 backdrop-blur-md rounded-lg border border-blue-400/30">
                <Sparkles size={20} className="text-blue-300" />
              </div>
              <span className="text-[10px] font-bold text-blue-300 uppercase tracking-[0.2em]">Next-Gen Recruitment</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-heading font-bold tracking-tight mb-2">AI Talent Matcher</h2>
            <p className="text-slate-400 text-lg font-medium max-w-xl">
              Our advanced matching engine has ranked <span className="text-white font-bold">{candidates.length}</span> candidates based on your specific job requirements.
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative glass border-white/10 rounded-2xl p-1.5 flex items-center">
              <Search className="ml-3 text-slate-400" size={18} />
              <input 
                type="text" 
                placeholder="Search candidates..." 
                className="bg-transparent border-none text-white text-sm px-3 py-2 outline-none w-48 placeholder:text-slate-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={fetchMatches} variant="ghost" className="bg-white/10 border border-white/20 text-white rounded-2xl">
              <Zap size={18} className="mr-2 text-yellow-400" />
              <span>Refresh Analysis</span>
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-5 glass border-rose-500/20 bg-rose-500/5 rounded-3xl text-rose-600 dark:text-rose-400 text-sm font-bold flex items-center space-x-4">
          <XCircle size={24} />
          <span>{error}</span>
        </div>
      )}

      {/* Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12 space-y-6">
          {filteredCandidates.length === 0 ? (
            <Card className="p-20 text-center border-dashed border-2 bg-white/50 dark:bg-slate-900/50 rounded-[3rem]" hover={false}>
              <div className="text-6xl mb-6">ðŸœï¸</div>
              <h3 className="text-2xl font-heading font-bold text-slate-900 dark:text-white mb-2">No Matches Found</h3>
              <p className="text-slate-500 dark:text-slate-400 font-medium">Try adjusting your job requirements or invite more candidates to apply.</p>
            </Card>
          ) : (
            filteredCandidates.map((candidate, index) => (
              <Card key={candidate.applicationId} className="p-0 border-transparent glass group overflow-hidden rounded-[2.5rem] shadow-xl hover:-translate-y-1 transition-all duration-300" hover={false}>
                <div className="flex flex-col lg:flex-row">
                  {/* Score Sidebar */}
                  <div className={`lg:w-48 bg-gradient-to-b from-${getScoreColor(candidate.matchScore)}-600/10 to-${getScoreColor(candidate.matchScore)}-600/5 p-8 flex flex-col items-center justify-center border-r border-slate-100 dark:border-slate-800 transition-colors`}>
                    <div className="relative w-24 h-24 mb-4">
                       <svg className="w-full h-full transform -rotate-90">
                         <circle className="text-slate-200 dark:text-slate-800" strokeWidth="8" stroke="currentColor" fill="transparent" r="42" cx="48" cy="48" />
                         <circle className={`text-${getScoreColor(candidate.matchScore)}-500`} strokeWidth="8" strokeDasharray={42 * 2 * Math.PI} strokeDashoffset={42 * 2 * Math.PI * (1 - candidate.matchScore / 100)} strokeLinecap="round" stroke="currentColor" fill="transparent" r="42" cx="48" cy="48" />
                       </svg>
                       <div className="absolute inset-0 flex flex-col items-center justify-center">
                         <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{candidate.matchScore}%</span>
                         <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Match</span>
                       </div>
                    </div>
                    <Badge variant={getScoreColor(candidate.matchScore)} className="text-[9px] uppercase tracking-widest px-3">
                      {candidate.matchScore >= 80 ? 'Top Pick' : 'Qualified'}
                    </Badge>
                  </div>

                  {/* Content Area */}
                  <div className="flex-1 p-8">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                      <div className="flex items-center space-x-6">
                         <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center shadow-lg border border-slate-100 dark:border-slate-800 group-hover:scale-110 transition-transform">
                           <User size={32} className={`text-${getScoreColor(candidate.matchScore)}-500`} />
                         </div>
                         <div>
                           <h4 className="text-2xl font-heading font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">{candidate.applicantName}</h4>
                           <p className="text-sm text-slate-500 font-medium">{candidate.applicantEmail}</p>
                           <div className="flex items-center mt-2 space-x-3">
                             <div className="flex items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                               <Target size={12} className="mr-1.5" />
                               Applied for: <span className="text-slate-900 dark:text-slate-200 ml-1.5">{candidate.jobTitle}</span>
                             </div>
                           </div>
                         </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <Button variant="secondary" className="rounded-xl font-bold" onClick={() => window.open(`http://localhost:8080/uploads/resumes/${candidate.resumePath}`, '_blank')}>
                          <FileText size={16} className="mr-2" />
                          View CV
                        </Button>
                        <Button className="rounded-xl font-bold bg-blue-600 text-white border-none shadow-lg shadow-blue-500/20">
                          Interview Now
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* AI Summary */}
                      <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                          <Brain size={40} className="text-blue-600" />
                        </div>
                        <h5 className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-[0.2em] mb-3 flex items-center">
                          <Sparkles size={12} className="mr-2" />
                          AI Match Insight
                        </h5>
                        <p className="text-sm text-slate-600 dark:text-slate-300 font-medium leading-relaxed italic">
                          "{candidate.aiSummary}"
                        </p>
                      </div>

                      {/* Skills Matrix */}
                      <div className="space-y-4">
                         <div>
                           <h5 className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em] mb-2 flex items-center">
                             <CheckCircle2 size={12} className="mr-2" />
                             Matching Skills
                           </h5>
                           <div className="flex flex-wrap gap-2">
                             {candidate.matchingSkills.length > 0 ? candidate.matchingSkills.map(skill => (
                               <Badge key={skill} variant="emerald" className="text-[9px] px-2.5 py-1">{skill}</Badge>
                             )) : <span className="text-xs text-slate-400 italic">No direct skill matches found.</span>}
                           </div>
                         </div>
                         <div>
                           <h5 className="text-[10px] font-bold text-rose-500 uppercase tracking-[0.2em] mb-2 flex items-center">
                             <XCircle size={12} className="mr-2" />
                             Skill Gaps
                           </h5>
                           <div className="flex flex-wrap gap-2">
                             {candidate.missingSkills.length > 0 ? candidate.missingSkills.map(skill => (
                               <Badge key={skill} variant="red" className="text-[9px] px-2.5 py-1 bg-rose-500/5 text-rose-500 border-rose-500/20">{skill}</Badge>
                             )) : <span className="text-xs text-emerald-500 font-bold">Perfect Skill Alignment!</span>}
                           </div>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AiMatcher;
