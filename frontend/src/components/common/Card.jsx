import React from 'react';

const Card = ({ children, className = '', hover = true }) => {
  return (
    <div className={`bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all duration-300 ${hover ? 'hover:shadow-xl dark:hover:shadow-blue-900/10 hover:-translate-y-1' : ''} ${className}`}>
      {children}
    </div>
  );
};

export default Card;
