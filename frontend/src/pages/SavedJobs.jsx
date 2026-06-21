import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { 
  Bookmark, 
  MapPin, 
  Briefcase, 
  Clock, 
  Trash2, 
  ExternalLink,
  Search,
  RefreshCw
} from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import { Link } from 'react-router-dom';

const SavedJobs = () => {
  const { user } = useContext(AuthContext);
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.id) fetchSavedJobs();
  }, [user]);

  const fetchSavedJobs = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/saved-jobs/${user.id}`);
      setSavedJobs(res.data);
    } catch (err) {
      console.error("Fetch Saved Jobs Error:", err);
      setError("Failed to load your saved jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (jobId) => {
    try {
      await api.delete(`/saved-jobs/${user.id}/${jobId}`);
      setSavedJobs(prev => prev.filter(job => job.id !== jobId));
    } catch (err) {
      console.error("Unsave Error:", err);
      alert("Failed to unsave job. Please try again.");
    }
  };

  const filteredJobs = savedJobs.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.recruiterName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-40 bg-slate-200 dark:bg-slate-800 rounded-[2.5rem]"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 bg-slate-100 dark:bg-slate-800/50 rounded-[2rem]"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-600 via-blue-600 to-blue-700 p-8 md:p-12 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-4">
               <span className="px-3 py-1 bg-white/20 backdrop-blur-md border border-white/30 rounded-full text-[10px] font-bold uppercase tracking-widest text-white">
                 Your Collection
               </span>
               <div className="flex items-center space-x-1.5">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.6)]"></div>
                  <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest">{savedJobs.length} Saved</span>
               </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-heading font-bold tracking-tight mb-2">
              Saved <span className="text-blue-200 text-transparent bg-clip-text bg-gradient-to-r from-blue-100 to-indigo-100">Opportunities</span>
            </h1>
            <p className="text-blue-100 text-lg font-medium max-w-xl">
              Keep track of the roles you're interested in. Review them carefully before applying.
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="lg" 
              onClick={fetchSavedJobs} 
              className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 shadow-xl rounded-2xl"
            >
              <RefreshCw size={18} className="mr-2" />
              <span>Sync List</span>
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-5 glass border-rose-500/20 bg-rose-500/5 rounded-[2rem] text-rose-600 dark:text-rose-400 text-sm font-bold flex items-center space-x-4">
          <div className="w-10 h-10 bg-rose-100 dark:bg-rose-500/20 rounded-xl flex items-center justify-center">âš ï¸</div>
          <span>{error}</span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search saved jobs..." 
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm focus:ring-2 focus:ring-blue-500/20 outline-none transition-all dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-4">
           <Link to="/jobs">
             <Button className="rounded-2xl px-8 py-4 shadow-lg shadow-blue-500/20">Browse More Jobs</Button>
           </Link>
        </div>
      </div>

      {/* Jobs Grid */}
      {filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="p-0 overflow-hidden border-transparent glass group hover:-translate-y-2 transition-all duration-500 rounded-[2.5rem]" hover={true} shadow="xl">
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xl ring-1 ring-blue-100 dark:ring-slate-700 shadow-inner">
                    {job.recruiterName?.charAt(0) || 'J'}
                  </div>
                  <Badge variant={job.status === 'ACTIVE' ? 'green' : 'gray'} className="text-[10px] uppercase tracking-widest font-bold">
                    {job.status}
                  </Badge>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-1">{job.title}</h3>
                    <p className="text-slate-500 dark:text-slate-400 font-bold text-sm mt-1">{job.recruiterName}</p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <div className="flex items-center text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                      <MapPin size={14} className="mr-1.5 text-blue-500" />
                      {job.location}
                    </div>
                    <div className="flex items-center text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                      <Briefcase size={14} className="mr-1.5 text-indigo-500" />
                      {job.jobType?.replace('_', ' ')}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800/50 flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {job.salary || 'Competitive'}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                      {job.deadline ? `Ends ${new Date(job.deadline).toLocaleDateString()}` : 'No Deadline'}
                    </span>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-2 gap-4">
                  <Link to={`/jobs/${job.id}`} className="w-full">
                    <Button variant="secondary" className="w-full rounded-xl text-xs font-bold border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
                      Details <ExternalLink size={14} className="ml-2" />
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    className="w-full rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10"
                    onClick={() => handleUnsave(job.id)}
                  >
                    <Trash2 size={14} className="mr-2" /> Unsave
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-20 flex flex-col items-center justify-center text-center border-dashed border-2 glass rounded-[3rem]" hover={false}>
          <div className="w-24 h-24 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center mb-8 animate-bounce">
            <Bookmark size={40} className="text-blue-500" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">No saved jobs yet</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-10 font-medium">
            Explore thousands of job opportunities and save the ones that catch your eye.
          </p>
          <Link to="/jobs">
            <Button size="lg" className="rounded-2xl px-12 py-4 shadow-xl shadow-blue-500/20">
              Start Exploring
            </Button>
          </Link>
        </Card>
      )}
    </div>
  );
};

export default SavedJobs;
