import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [tokenValid, setTokenValid] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!token) {
      setError('Reset link is missing or invalid.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', { token, newPassword });
      setMessage('Password updated successfully. Redirecting to login...');
      setTimeout(() => navigate('/login', { replace: true }), 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Unable to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const validate = async () => {
      if (!token) {
        setTokenValid(false);
        return;
      }
      try {
        const res = await api.get(`/auth/validate-token?token=${encodeURIComponent(token)}`);
        setTokenValid(res.data?.valid === true);
      } catch (err) {
        setTokenValid(false);
      }
    };
    validate();
  }, [token]);

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-2xl w-full p-8 sm:p-12 dark:bg-slate-900 transition-colors" hover={false}>
        <h3 className="text-3xl font-heading font-bold text-slate-900 dark:text-white mb-2 transition-colors">Choose a new password</h3>
        <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm transition-colors">Enter and confirm the new password for your account.</p>

        {tokenValid === false && (
          <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 px-4 py-3 rounded-xl mb-6 text-sm font-medium transition-colors">⚠️ This reset link is invalid or expired.</div>
        )}

        {error && <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 px-4 py-3 rounded-xl mb-6 text-sm font-medium transition-colors">⚠️ {error}</div>}
        {message && <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-xl mb-6 text-sm font-medium transition-colors">{message}</div>}

        {tokenValid === null ? (
          <div className="py-10 text-center text-slate-500 dark:text-slate-400">Validating reset link...</div>
        ) : tokenValid === false ? (
          <div className="py-10 text-center">
            <p className="text-slate-600 dark:text-slate-400 mb-4 transition-colors">This reset link is invalid or has expired.</p>
            <Link to="/forgot-password" university="font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">Request a new link</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 transition-colors">New Password</label>
            <input
              type="password"
              className="block w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-slate-400 dark:text-white"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2 transition-colors">Confirm Password</label>
            <input
              type="password"
              className="block w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-slate-400 dark:text-white"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <Button type="submit" className="w-full" size="lg" loading={loading}>
            Update password
          </Button>
          </form>
        )}

        <div className="mt-8 text-center">
          <Link to="/login" className="font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:underline underline-offset-4 transition-colors">
            Back to login
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default ResetPassword;