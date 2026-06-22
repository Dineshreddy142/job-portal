import React, { useState, useContext, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import Button from '../components/common/Button';
import Card from '../components/common/Card';
import { Briefcase, User as UserIcon } from 'lucide-react';

const GOOGLE_CLIENT_ID = '66384967054-gnb5tj4m3d0ugje7m4dhs7jnt1j5mqnb.apps.googleusercontent.com';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  
  // For new Google users who need to select a role
  const [needsRole, setNeedsRole] = useState(false);
  const [pendingGoogleCode, setPendingGoogleCode] = useState(null);

  const { login, loginWithGoogle, completeGoogleLogin, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');
  
  const googleClientRef = useRef(null);
  const [pendingGoogleToken, setPendingGoogleToken] = useState(null);

  const redirectByRole = useCallback((role) => {
    if (role === 'ADMIN') navigate('/admin/dashboard', { replace: true });
    else if (role === 'RECRUITER') navigate('/recruiter/dashboard', { replace: true });
    else if (role === 'SECURITY_ADMIN') navigate('/recruiter/security/dashboard', { replace: true });
    else navigate('/jobs', { replace: true });
  }, [navigate]);

  useEffect(() => {
    if (user) redirectByRole(user.role);
  }, [user, redirectByRole]);

  const handleGoogleCallback = async (response) => {
    if (response.error) {
       setError('Google authentication failed or was cancelled.');
       return;
    }
    
    setError('');
    setGoogleLoading(true);
    try {
      const data = await loginWithGoogle(response.code);
      
      if (data.status === 'NEW_USER_ROLE_REQUIRED') {
        // Store the server-issued pendingToken (NOT the auth code)
        setPendingGoogleToken(data.pendingToken);
        setNeedsRole(true);
      } else {
        redirectByRole(data.role);
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Google sign-in failed. Please try again.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const completeGoogleLoginWithRole = async (selectedRole) => {
    setError('');
    setGoogleLoading(true);
    try {
      // Use completeGoogleLogin with the server-issued pendingToken
      const data = await completeGoogleLogin(pendingGoogleToken, selectedRole);
      redirectByRole(data.role);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Failed to complete registration.');
    } finally {
      setGoogleLoading(false);
    }
  };

  // Initialize Google OAuth2 Code Client
  useEffect(() => {
    const initGoogle = () => {
      if (window.google) {
        googleClientRef.current = window.google.accounts.oauth2.initCodeClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: 'email profile https://www.googleapis.com/auth/gmail.readonly',
          callback: handleGoogleCallback,
        });
      }
    };

    if (window.google) {
      initGoogle();
    } else {
      const script = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
      if (script) {
        script.addEventListener('load', initGoogle);
        return () => script.removeEventListener('load', initGoogle);
      }
    }
  }, []); // Run once on mount

  const handleGoogleClick = () => {
    if (googleClientRef.current) {
        googleClientRef.current.requestCode();
    } else {
        setError('Google login is still loading. Please wait.');
    }
  };

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
      redirectByRole(data.role);
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
            <img src="/logo.png" alt="Job Portal Logo" className="w-16 h-16 rounded-2xl shadow-lg mb-6" />
            <h2 className="text-4xl font-heading font-bold mb-4 tracking-tight">Welcome to Job Portal</h2>
            <p className="text-primary-100 text-lg">Your gateway to the world's best talent and top opportunities.</p>
          </div>
          
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
            <h3 className="text-3xl font-heading font-bold text-slate-900 dark:text-white mb-2 transition-colors">
              {needsRole ? 'Complete Profile' : 'Log in'}
            </h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm transition-colors">
              {needsRole 
                ? 'Please select your role to complete registration.' 
                : 'Enter your credentials to access your dashboard.'}
            </p>
            
            {error && (
              <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 px-4 py-3 rounded-xl mb-6 text-sm font-medium transition-colors">
                ⚠️ {error}
              </div>
            )}

            {successMessage && (
              <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 px-4 py-3 rounded-xl mb-6 text-sm font-medium transition-colors">
                ✅ {successMessage}
              </div>
            )}

            {needsRole ? (
              <div className="space-y-4">
                <button
                  onClick={() => completeGoogleLoginWithRole('JOB_SEEKER')}
                  disabled={googleLoading}
                  className="w-full flex items-center p-4 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all text-left"
                >
                  <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/20 text-primary-600 rounded-full flex items-center justify-center mr-4">
                    <UserIcon size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">I am a Job Seeker</h4>
                    <p className="text-xs text-slate-500 mt-1">I want to find and apply for jobs.</p>
                  </div>
                </button>
                
                <button
                  onClick={() => completeGoogleLoginWithRole('RECRUITER')}
                  disabled={googleLoading}
                  className="w-full flex items-center p-4 border-2 border-slate-200 dark:border-slate-700 rounded-xl hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition-all text-left"
                >
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 rounded-full flex items-center justify-center mr-4">
                    <Briefcase size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white">I am a Recruiter</h4>
                    <p className="text-xs text-slate-500 mt-1">I want to post jobs and find candidates.</p>
                  </div>
                </button>
                
                {googleLoading && <p className="text-center text-sm text-slate-500 mt-4">Completing registration...</p>}
                
                <button 
                  onClick={() => setNeedsRole(false)} 
                  className="w-full text-center text-sm text-slate-500 hover:text-slate-700 mt-4 underline underline-offset-2"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                {/* Custom Google Sign-In Button */}
                <button
                  onClick={handleGoogleClick}
                  disabled={googleLoading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all duration-200 text-slate-700 dark:text-slate-200 font-semibold text-sm shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed mb-6"
                >
                  {googleLoading ? (
                    <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 48 48">
                      <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.7 33.5 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-9 20-20 0-1.3-.1-2.7-.4-4z" />
                      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.6 8.3 6.3 14.7z" />
                      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.4-5l-6.2-5.2C29.4 35.5 26.8 36 24 36c-5.3 0-9.7-3.5-11.3-8.3l-6.5 5C9.5 39.6 16.2 44 24 44z" />
                      <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.4 4.3-4.4 5.8l6.2 5.2C40.7 35.6 44 30.3 44 24c0-1.3-.1-2.7-.4-4z" />
                    </svg>
                  )}
                  {googleLoading ? 'Signing in...' : 'Sign in with Google'}
                </button>

                {/* Divider */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-slate-700"></div>
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 font-medium uppercase tracking-wider">
                      or sign in with email
                    </span>
                  </div>
                </div>

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
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Login;
