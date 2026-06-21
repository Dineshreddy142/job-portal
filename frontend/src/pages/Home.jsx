import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const Badge = ({ children, variant = 'gray', className = '' }) => {
  const variants = {
    blue: 'bg-primary-50 text-primary-700 border-primary-100',
    gray: 'bg-slate-100 text-slate-700 border-slate-200',
  };
  return (
    <span className={`inline-flex items-center rounded-full font-bold border text-[10px] uppercase tracking-widest ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

const Home = () => {
  return (
    <div className="space-y-24 py-10 transition-colors">
      {/* Hero Section */}
      <section className="flex flex-col lg:flex-row items-center justify-between gap-12">
        <div className="lg:w-1/2 space-y-8 text-center lg:text-left">
          <Badge variant="blue" className="px-4 py-1">✨ Next Gen Job Board</Badge>
          <h1 className="text-5xl lg:text-7xl font-heading font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.1] transition-colors">
            Find your <span className="text-primary-600 dark:text-primary-400">dream job</span> with confidence.
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed transition-colors">
            Connecting the world's most innovative companies with top-tier talent. 
            Join 10,000+ professionals who have found their career match here.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <Link to="/jobs">
              <Button size="lg" className="px-10 h-14 text-lg">Browse Openings</Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="secondary" className="px-10 h-14 text-lg">Post a Job</Button>
            </Link>
          </div>
          <div className="flex items-center justify-center lg:justify-start space-x-4 text-sm text-slate-400 dark:text-slate-500 transition-colors">
            <div className="flex -space-x-2">
              {[1,2,3,4].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 transition-colors"></div>
              ))}
            </div>
            <p>Trusted by <span className="text-slate-900 dark:text-white font-bold">500+</span> companies</p>
          </div>
        </div>
        
        <div className="lg:w-1/2 relative">
          <div className="absolute inset-0 bg-primary-500 rounded-full blur-[100px] opacity-10 -z-10"></div>
          <Card className="p-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border-white dark:border-slate-800" hover={false}>
            <div className="bg-slate-900 dark:bg-black rounded-xl overflow-hidden shadow-2xl transition-colors">
              <div className="p-4 border-b border-white/10 flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
              </div>
              <div className="p-8 space-y-6">
                <div className="h-4 bg-white/10 rounded w-1/2"></div>
                <div className="h-10 bg-white/5 rounded w-full"></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-20 bg-white/5 rounded"></div>
                  <div className="h-20 bg-white/5 rounded"></div>
                </div>
                <div className="h-4 bg-white/10 rounded w-3/4"></div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          { label: 'Active Jobs', value: '2.5k+', icon: '💼' },
          { label: 'Daily Applications', value: '10k+', icon: '📥' },
          { label: 'Happy Users', value: '50k+', icon: '😊' },
          { label: 'Success Rate', value: '94%', icon: '🚀' },
        ].map((stat, i) => (
          <div key={i} className="text-center space-y-2">
            <p className="text-3xl font-heading font-extrabold text-slate-900 dark:text-white transition-colors">{stat.value}</p>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest transition-colors">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Featured Roles Section */}
      <section className="space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-heading font-bold text-slate-900 dark:text-white transition-colors">Featured Categories</h2>
          <p className="text-slate-500 dark:text-slate-400 transition-colors">Explore roles in the fastest growing industries.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {['Engineering', 'Design', 'Marketing', 'Sales'].map((cat, i) => (
            <Card key={i} className="p-8 text-center space-y-4 group">
              <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl mx-auto flex items-center justify-center text-2xl group-hover:bg-primary-600 group-hover:text-white transition-all">
                {['💻', '🎨', '📈', '🤝'][i]}
              </div>
              <h4 className="font-bold text-slate-900 dark:text-white transition-colors">{cat}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 transition-colors">400+ Open Positions</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
