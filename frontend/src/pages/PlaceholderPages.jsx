import React from 'react';
import Card from '../components/common/Card';

const PlaceholderPage = ({ title, icon }) => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 animate-in fade-in duration-700">
    <Card className="p-20 text-center max-w-lg border-dashed border-2 bg-white/50 dark:bg-slate-900/50" hover={false}>
      <div className="text-6xl mb-6">{icon}</div>
      <h2 className="text-3xl font-heading font-bold text-slate-900 dark:text-white mb-2">{title}</h2>
      <p className="text-slate-500 dark:text-slate-400 font-medium"> This feature is currently under development and will be available in the next update. </p>
    </Card>
  </div>
);

export const ResumeUpload = () => <PlaceholderPage title="Resume Management" icon="📄" />;
export const Analytics = () => <PlaceholderPage title="Performance Analytics" icon="📊" />;
export const Reports = () => <PlaceholderPage title="System Reports" icon="📈" />;
export const ManageUsers = () => <PlaceholderPage title="Manage Users" icon="👥" />; // If separate from dashboard
