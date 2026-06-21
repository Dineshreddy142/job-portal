import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import { 
  ShieldCheck, 
  UserCheck, 
  AlertTriangle, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Building2,
  Clock,
  Search,
  ExternalLink,
  ShieldAlert,
  ShieldX
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import SecureImage from '../components/common/SecureImage';

const SecurityDashboard = () => {
  const { user } = useContext(AuthContext);
  const [recruiters, setRecruiters] = useState([]);
  const [verifiedRecruiters, setVerifiedRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingId, setViewingId] = useState(null);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'verified'

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const [unverifiedRes, verifiedRes] = await Promise.all([
        api.get('/security/unverified-recruiters'),
        api.get('/security/verified-recruiters')
      ]);
      setRecruiters(unverifiedRes.data);
      setVerifiedRecruiters(verifiedRes.data);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.message || err.message || "Failed to fetch recruiters.";
      setError(`Error (${err.response?.status || 'Network'}): ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id, verify) => {
    try {
      await api.post(`/security/verify/${id}?verify=${verify}`);
      fetchAll();
      setViewingId(null);
    } catch (err) {
      alert("Action failed.");
    }
  };

  const currentList = activeTab === 'pending' ? recruiters : verifiedRecruiters;

  const filteredRecruiters = currentList.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="flex justify-center items-center h-[60vh]"><div className="animate-spin text-4xl">ðŸ›¡ï¸</div></div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-900 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-10 opacity-10">
          <ShieldAlert size={150} />
        </div>
        <div className="relative z-10">
          <div className="flex items-center space-x-2 mb-4">
             <div className="p-1.5 bg-indigo-500/20 backdrop-blur-md rounded-lg border border-indigo-400/30">
               <ShieldCheck size={18} className="text-indigo-300" />
             </div>
             <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-[0.2em]">Platform Security</span>
          </div>
          <h2 className="text-4xl font-heading font-bold mb-2">Recruiter Verification Center</h2>
          <p className="text-slate-400 font-medium max-w-xl">
            Audit and verify company identities to maintain the highest standards of trust on Job Portal.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 p-1.5 bg-slate-100 dark:bg-slate-900 w-fit rounded-2xl border border-slate-200 dark:border-slate-800">
        <button 
          onClick={() => setActiveTab('pending')}
          className={`px-8 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'pending' ? 'bg-white dark:bg-slate-800 text-indigo-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <Clock size={16} />
          Pending Approval
          {recruiters.length > 0 && (
            <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.5 rounded-full ml-1">
              {recruiters.length}
            </span>
          )}
        </button>
        <button 
          onClick={() => setActiveTab('verified')}
          className={`px-8 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${activeTab === 'verified' ? 'bg-white dark:bg-slate-800 text-emerald-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
        >
          <CheckCircle size={16} />
          Verified Recruiters
        </button>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder={`Search ${activeTab} recruiters...`} 
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant={activeTab === 'pending' ? 'amber' : 'emerald'} className="px-4 py-1.5 rounded-full">
            {activeTab === 'pending' ? `${recruiters.length} Pending` : `${verifiedRecruiters.length} Verified`}
          </Badge>
          <Button variant="ghost" onClick={fetchAll}>ðŸ”„ Refresh</Button>
        </div>
      </div>

      {error && (
        <div className="p-6 bg-rose-50 border border-rose-100 rounded-3xl text-rose-600 font-bold flex items-center space-x-3">
          <AlertTriangle />
          <span>{error}</span>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredRecruiters.length === 0 ? (
          <div className="p-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem]">
            <div className="text-6xl mb-6">ðŸœï¸</div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No {activeTab} recruiters found</h3>
            <p className="text-slate-500 dark:text-slate-400">
              {activeTab === 'pending' ? 'All requests have been handled.' : 'No recruiters have been verified yet.'}
            </p>
          </div>
        ) : (
          filteredRecruiters.map(recruiter => (
            <Card key={recruiter.id} className="p-0 overflow-hidden border-slate-100 dark:border-slate-800 rounded-[2rem] hover:shadow-2xl transition-all duration-500" hover={false}>
               <div className="flex flex-col lg:flex-row items-stretch">
                  <div className="flex-1 p-8">
                     <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center space-x-5">
                           <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${activeTab === 'pending' ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600' : 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600'}`}>
                             <Building2 size={28} />
                           </div>
                           <div>
                              <h4 className="text-xl font-bold text-slate-900 dark:text-white">{recruiter.name}</h4>
                              <p className="text-slate-500 text-sm font-medium">{recruiter.email}</p>
                           </div>
                        </div>
                        <Badge variant={activeTab === 'pending' ? 'amber' : 'emerald'} className="flex items-center gap-1.5 px-3 py-1">
                          {activeTab === 'pending' ? <Clock size={12} /> : <CheckCircle size={12} />}
                          {activeTab === 'pending' ? 'Pending Review' : 'Verified Partner'}
                        </Badge>
                     </div>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6 border-y border-slate-50 dark:border-slate-800">
                        <div>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Company ID Verification</p>
                           {recruiter.companyIdCard ? (
                             <div className="flex items-center space-x-3 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                               <CheckCircle size={18} />
                               <span>ID Card Submitted</span>
                             </div>
                           ) : (
                             <div className="flex items-center space-x-3 text-rose-500 font-bold text-sm">
                               <AlertTriangle size={18} />
                               <span>ID Card Missing</span>
                             </div>
                           )}
                        </div>
                        <div>
                           <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Joined Date</p>
                           <p className="text-slate-700 dark:text-slate-300 font-bold">{new Date(recruiter.createdAt).toLocaleDateString()}</p>
                        </div>
                     </div>

                     <div className="flex items-center justify-between pt-6">
                        <div className="flex gap-4">
                           {recruiter.companyIdCard && (
                             <Button variant="secondary" onClick={() => setViewingId(recruiter)}>
                               <Eye size={16} className="mr-2" />
                               Inspect ID Card
                             </Button>
                           )}
                        </div>
                        <div className="flex gap-3">
                           {activeTab === 'pending' ? (
                             <>
                               <Button variant="ghost" className="text-rose-600 hover:bg-rose-50 rounded-xl" onClick={() => handleVerify(recruiter.id, false)}>
                                 <XCircle size={18} className="mr-2" />
                                 Reject
                               </Button>
                               <Button className="bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-600/20" onClick={() => handleVerify(recruiter.id, true)}>
                                 <UserCheck size={18} className="mr-2" />
                                 Verify Recruiter
                               </Button>
                             </>
                           ) : (
                             <Button variant="ghost" className="text-rose-600 hover:bg-rose-50 rounded-xl" onClick={() => handleVerify(recruiter.id, false)}>
                               <ShieldX size={18} className="mr-2" />
                               Revoke Verification
                             </Button>
                           )}
                        </div>
                     </div>
                  </div>
               </div>
            </Card>
          ))
        )}
      </div>

      {/* ID Card Modal */}
      {viewingId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4 animate-in zoom-in duration-300">
          <div className="w-full max-w-4xl bg-white dark:bg-slate-900 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl">
             <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                <div className="flex items-center space-x-3">
                   <ShieldCheck className="text-indigo-600" />
                   <h3 className="font-bold text-slate-900 dark:text-white">ID Card Inspection: {viewingId.name}</h3>
                </div>
                <Button variant="ghost" onClick={() => setViewingId(null)}>&times; Close</Button>
             </div>
             <div className="flex-1 bg-slate-50 dark:bg-black p-8 flex items-center justify-center">
                <SecureImage 
                  src={`/users/company-id-card/${viewingId.id}`} 
                  alt="Company ID Card" 
                  className="max-h-[60vh] rounded-2xl shadow-2xl border-4 border-white dark:border-slate-800"
                />
             </div>
             <div className="p-8 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-4">
               <Button variant="secondary" onClick={() => setViewingId(null)}>Back to List</Button>
               {activeTab === 'pending' && (
                 <Button className="bg-emerald-600 text-white" onClick={() => handleVerify(viewingId.id, true)}>Approve Identity</Button>
               )}
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecurityDashboard;
