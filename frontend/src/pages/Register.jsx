import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('JOB_SEEKER');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Info, 2: OTP
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpSentTo, setOtpSentTo] = useState('');

  const { register, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    if (user.role === 'ADMIN') navigate('/admin/dashboard', { replace: true });
    else if (user.role === 'RECRUITER') navigate('/recruiter/dashboard', { replace: true });
    else navigate('/jobs', { replace: true });
  }, [user, navigate]);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password || !role) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/send-otp', { email });
      setOtpSentTo(email);
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send OTP. Please check your email.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step === 1) {
      await handleSendOtp(e);
      return;
    }
    
    setError('');
    if (!otp) {
      setError('Please enter the verification code.');
      return;
    }

    setLoading(true);
    try {
      await register(name, email, password, role, otp);
      logout();
      navigate('/login', { state: { message: 'Account created successfully! Please log in to continue.' } });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Check if OTP is correct.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card className="max-w-4xl w-full flex overflow-hidden min-h-[600px]" hover={false}>
        {/* Left Side: Branding */}
        <div className="hidden lg:flex w-1/2 bg-slate-900 p-12 flex-col justify-between relative overflow-hidden text-white">
          <div className="relative z-10">
            <h2 className="text-4xl font-heading font-bold mb-4 tracking-tight leading-tight">Start your journey with us today</h2>
            <p className="text-slate-400 text-lg">Join thousands of companies and job seekers already using our platform.</p>
          </div>
          
          <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-primary-600 rounded-full blur-[120px] opacity-20"></div>
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-primary-400 border border-white/10">
                ðŸš€
              </div>
              <div>
                <h4 className="font-bold">Fast & Intuitive</h4>
                <p className="text-sm text-slate-500">Apply to jobs in seconds.</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-emerald-400 border border-white/10">
                ðŸ›¡ï¸
              </div>
              <div>
                <h4 className="font-bold">Secure Data</h4>
                <p className="text-sm text-slate-500">Your privacy is our priority.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="w-full lg:w-1/2 p-8 sm:p-12 bg-white dark:bg-slate-900 transition-colors">
          <div className="max-w-md mx-auto">
            <h3 className="text-3xl font-heading font-bold text-slate-900 dark:text-white mb-2 transition-colors">Create Account</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm transition-colors">Join the platform to unlock full features.</p>
            
            {error && (
              <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 px-4 py-3 rounded-xl mb-6 text-sm font-medium transition-colors">
                âš ï¸ {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {step === 1 ? (
                <>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 transition-colors">Full Name</label>
                    <input
                      type="text"
                      className="block w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all dark:text-white"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 transition-colors">Email Address</label>
                    <input
                      type="email"
                      className="block w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all dark:text-white"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 transition-colors">Password</label>
                    <input
                      type="password"
                      className="block w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all dark:text-white"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5 transition-colors">I am a...</label>
                    <select
                      className="block w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all appearance-none cursor-pointer dark:text-white"
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                    >
                      <option value="JOB_SEEKER">Job Seeker (Finding a job)</option>
                      <option value="RECRUITER">Recruiter (Hiring talent)</option>
                    </select>
                  </div>
                </>
              ) : (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="bg-blue-50 dark:bg-blue-500/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                    <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                      We've sent a 6-digit verification code to <span className="font-bold">{otpSentTo}</span>. Please enter it below.
                    </p>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1.5">Verification Code</label>
                    <input
                      type="text"
                      maxLength="6"
                      className="block w-full px-4 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-[#0052cc] rounded-xl text-center text-2xl font-bold tracking-[0.5em] outline-none transition-all dark:text-white"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      required
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setStep(1)}
                    className="text-xs font-bold text-slate-400 hover:text-[#0052cc] transition-colors"
                  >
                    â† Back to info
                  </button>
                </div>
              )}

              <div className="pt-4">
                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg" 
                  loading={loading}
                >
                  {step === 1 ? 'Send Verification Code' : 'Verify & Create Account'}
                </Button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
              <p className="text-slate-500 dark:text-slate-400 text-sm transition-colors">
                Already have an account?{' '}
                <Link to="/login" className="font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 decoration-2 hover:underline underline-offset-4">
                  Log in instead
                </Link>
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Register;
