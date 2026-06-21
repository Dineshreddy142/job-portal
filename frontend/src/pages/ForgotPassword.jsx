import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setMessage('A reset link has been sent! Please check your email (and spam folder).');
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-2xl w-full p-8 sm:p-12 dark:bg-slate-900 transition-colors" hover={false}>
        <h3 className="text-3xl font-heading font-bold text-slate-900 dark:text-white mb-2 transition-colors">Reset your password</h3>
        <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm transition-colors">Enter the email address associated with your account.</p>

        {error && <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 px-4 py-3 rounded-xl mb-6 text-sm font-medium transition-colors">⚠️ {error}</div>}
        {message && <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-xl mb-6 text-sm font-medium transition-colors">{message}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 transition-colors">Email Address</label>
            <input
              type="email"
              className="block w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-slate-400 dark:text-white"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              required
            />
          </div>

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Send reset link
          </Button>
        </form>

        <div className="mt-8 text-center">
          <Link to="/login" className="font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:underline underline-offset-4 transition-colors">
            Back to login
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPassword;