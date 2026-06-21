import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';

const MyApplications = () => {
  const { user } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) fetchApplications();
  }, [user]);

  const fetchApplications = async () => {
    try {
      const res = await api.get(`/applications/applicant/${user.id}`);
      setApplications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20 dark:text-slate-400">Loading your applications...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 transition-colors">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-heading font-bold text-slate-900 dark:text-white mb-2 transition-colors">My Applications</h2>
          <p className="text-slate-500 dark:text-slate-400 transition-colors">Track the status of your job applications in real-time.</p>
        </div>
      </div>

      {applications.length === 0 ? (
        <Card className="p-20 text-center flex flex-col items-center border-dashed border-2 bg-transparent dark:border-slate-800" hover={false}>
          <div className="text-6xl mb-6">ðŸ“‚</div>
          <h3 className="text-2xl font-heading font-bold text-slate-900 dark:text-white mb-2">No applications yet</h3>
          <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-sm">You haven't applied to any jobs. Start your search now and find your dream role!</p>
          <Button onClick={() => window.location.href = '/jobs'}>Explore Jobs</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {applications.map(app => (
            <Card key={app.id} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 group">
              <div className="flex items-center space-x-6">
                <div className="w-16 h-16 bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center text-2xl font-bold border border-primary-100 dark:border-primary-500/20 group-hover:bg-primary-600 group-hover:text-white transition-all">
                  {app.jobTitle?.charAt(0)}
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
                {app.notes && (
                   <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right transition-colors">Recruiter feedback available</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyApplications;
