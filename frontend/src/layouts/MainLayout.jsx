import React, { useContext } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

import { AuthContext } from '../contexts/AuthContext';

const MainLayout = () => {
  const { user } = useContext(AuthContext);

  return (
    <div className="min-h-screen flex bg-[#f8fafc] dark:bg-slate-950 transition-colors font-sans">
      {user && <Sidebar />}
      
      <div className={`flex-1 flex flex-col min-w-0 ${user ? 'pl-64' : ''}`}>
        <Navbar />
        <main className="flex-grow w-full px-8 py-8">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
};

export default MainLayout;
