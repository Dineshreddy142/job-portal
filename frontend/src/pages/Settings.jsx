import React, { useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../contexts/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';

const Settings = () => {
  const { user } = useContext(AuthContext) || {};
  const [notifyByEmail, setNotifyByEmail] = useState(user?.notifyByEmail ?? true);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    try {
      setLoading(true);
      const res = await api.put(`/users/${user.id}`, { notifyByEmail: !notifyByEmail });
      setNotifyByEmail(res.data.notifyByEmail);
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      stored.notifyByEmail = res.data.notifyByEmail;
      localStorage.setItem('user', JSON.stringify(stored));
      setLoading(false);
      alert('Notification preference updated');
    } catch (err) {
      setLoading(false);
      console.error(err);
      alert('Failed to update preference');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert('Select a file first');
    try {
      setLoading(true);
      const form = new FormData();
      form.append('file', file);
      const res = await api.post(`/users/${user.id}/resume`, form, { headers: { 'Content-Type': 'multipart/form-data' } });
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      stored.resumePath = res.data.resumePath;
      localStorage.setItem('user', JSON.stringify(stored));
      setLoading(false);
      alert('Resume uploaded');
    } catch (err) {
      setLoading(false);
      console.error(err);
      alert('Upload failed');
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 transition-colors">
      <h2 className="text-3xl font-heading font-bold text-slate-900 dark:text-white transition-colors">Settings</h2>

      <div className="grid grid-cols-1 gap-6">
        <Card className="p-6">
          <h3 className="font-bold mb-4 text-slate-900 dark:text-white transition-colors">Notifications</h3>
          <div className="flex items-center justify-between">
            <p className="text-slate-600 dark:text-slate-400 transition-colors">Email notifications</p>
            <div className="flex items-center space-x-3">
              <span className="font-bold text-sm text-slate-900 dark:text-white">{notifyByEmail ? 'On' : 'Off'}</span>
              <Button onClick={handleToggle} disabled={loading}>{notifyByEmail ? 'Disable' : 'Enable'}</Button>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-bold mb-4 text-slate-900 dark:text-white transition-colors">Resume</h3>
          <form onSubmit={handleUpload} className="space-y-4">
            <input 
              type="file" 
              className="block w-full text-sm text-slate-500 dark:text-slate-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-primary-50 file:text-primary-700
                dark:file:bg-primary-500/10 dark:file:text-primary-400
                hover:file:bg-primary-100 transition-all"
              onChange={(e) => setFile(e.target.files[0])} 
            />
            <div>
              <Button type="submit" disabled={loading}>Upload Resume</Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
