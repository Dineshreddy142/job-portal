import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');

  useEffect(() => {
    if (!user) return;
    if (user.role === 'ADMIN') navigate('/admin/dashboard', { replace: true });
    else if (user.role === 'RECRUITER') navigate('/recruiter/dashboard', { replace: true });
    else if (user.role === 'SECURITY_ADMIN') navigate('/recruiter/security/dashboard', { replace: true });
    else navigate('/jobs', { replace: true });
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.role === 'ADMIN') navigate('/admin/dashboard');
      else if (data.role === 'RECRUITER') navigate('/recruiter/dashboard');
      else if (data.role === 'SECURITY_ADMIN') navigate('/recruiter/security/dashboard');
      else navigate('/jobs');
    } catch (err) {
      const message = err.response?.data?.error;
      setError(message === 'Bad credentials' ? 'Invalid Email or Password' : message || 'Invalid Email or Password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-4xl w-full flex overflow-hidden min-h-[500px]" hover={false}>
        {/* Left Side: Illustration & Branding */}
        <div className="hidden lg:flex w-1/2 bg-primary-600 p-12 flex-col justify-between relative overflow-hidden text-white">
          <div className="relative z-10">
            <h2 className="text-4xl font-heading font-bold mb-4 tracking-tight">Welcome to Job Portal</h2>
            <p className="text-primary-100 text-lg">Your gateway to the world's best talent and top opportunities.</p>
          </div>
          
          {/* Decorative shapes */}
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-primary-500 rounded-full blur-3xl opacity-50"></div>
          <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 w-64 h-64 bg-primary-700 rounded-full blur-3xl opacity-50"></div>
          
          <div className="relative z-10 flex items-center space-x-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg backdrop-blur-sm"></div>
            <span className="font-bold">Premium Experience</span>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 bg-white dark:bg-slate-900 transition-colors">
          <div className="max-w-md mx-auto">
            <h3 className="text-3xl font-heading font-bold text-slate-900 dark:text-white mb-2 transition-colors">Log in</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm transition-colors">Enter your credentials to access your dashboard.</p>
            
            {error && (
              <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 px-4 py-3 rounded-xl mb-6 text-sm font-medium transition-colors">
                âš ï¸ {error}
              </div>
            )}

            {successMessage && (
              <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 px-4 py-3 rounded-xl mb-6 text-sm font-medium transition-colors">
                âœ… {successMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
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

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">Password</label>
                  <Link to="/forgot-password" className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300">Forgot password?</Link>
                </div>
                <input
                  type="password"
                  className="block w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-slate-400 dark:text-white"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>

              <div className="pt-2">
                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg" 
                  loading={loading}
                >
                  Log in to account
                </Button>
              </div>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors">
                Don't have an account?{' '}
                <Link to="/register" className="font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 decoration-2 hover:underline underline-offset-4">
                  Sign up for free
                </Link>
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Login;
