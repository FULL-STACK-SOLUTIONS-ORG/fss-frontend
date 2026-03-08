import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { FaSignOutAlt, FaUser } from 'react-icons/fa';

const WorkspaceLanding = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  const handleEnterWorkspace = () => {
    navigate('/tasks', { state: { view: 'tasks' } });
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col relative overflow-hidden font-sans text-slate-200">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-teal-900/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-blue-900/10 rounded-full blur-[100px]" />
      </div>

      {/* Top Right Profile Section */}
      <div className="absolute top-8 right-8 z-20 flex items-center gap-4 animate-fade-in-down">
        <div className="text-right hidden sm:block">
          <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Logged in as</p>
          <h2 className="text-xl font-bold text-white leading-none">Hi, {user.name?.split(' ')[0]}!</h2>
        </div>
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-teal-400 to-blue-600 p-0.5 shadow-[0_0_15px_rgba(20,184,166,0.3)]">
           <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center overflow-hidden">
              {user.avatar ? (
                <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <FaUser className="text-teal-400 text-lg" />
              )}
           </div>
        </div>
      </div>

      {/* Main Content Centered */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-10 w-full max-w-7xl mx-auto px-4">
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-slate-400 mb-12 text-sm tracking-[0.2em] uppercase font-medium"
        >
          Click below to enter your workspace
        </motion.p>

        {/* The Bubble */}
        <div className="relative group cursor-pointer" onClick={handleEnterWorkspace}>
           {/* Pulsing Outer Rings */}
           <motion.div 
             animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.1, 0.3] }}
             transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
             className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-500/20 to-blue-500/20 blur-xl"
           />
           <motion.div 
             animate={{ scale: [1.1, 1.2, 1.1], opacity: [0.1, 0.05, 0.1] }}
             transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
             className="absolute inset-0 rounded-full bg-teal-400/10 blur-2xl"
           />

           {/* Core Bubble */}
           <motion.div
             whileHover={{ scale: 1.02 }}
             whileTap={{ scale: 0.95 }}
             className="relative w-64 h-64 md:w-80 md:h-80 rounded-full bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/50 shadow-[0_0_50px_rgba(20,184,166,0.15)] flex flex-col items-center justify-center overflow-hidden transition-all duration-500 group-hover:shadow-[0_0_70px_rgba(20,184,166,0.3)] group-hover:border-teal-500/30"
           >
              {/* Inner Grid/Tech Pattern */}
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-teal-500/20 via-transparent to-transparent" />
              <div className="absolute inset-0" style={{ 
                  backgroundImage: 'radial-gradient(circle at center, rgba(20, 184, 166, 0.1) 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                  maskImage: 'radial-gradient(circle at center, black 40%, transparent 70%)'
              }}></div>
              
              {/* Rotating Rings (Simulated with div borders) */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute w-[80%] h-[80%] rounded-full border border-teal-500/10 border-dashed"
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="absolute w-[60%] h-[60%] rounded-full border border-blue-500/10 border-dotted"
              />

              {/* Text Content */}
              <motion.div className="z-10 text-center">
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-200 to-blue-200 bg-clip-text text-transparent tracking-tight mb-2">GROWTHUT AI</h1>
                  <div className="flex items-center justify-center gap-2 text-slate-500 text-xs font-mono">
                      <FaUser size={10} />
                      <span>{user.isDashboardApproved ? '2/46' : '0/46'}</span> {/* Placeholder for online/active */}
                  </div>
              </motion.div>

              {/* Shine Highlight */}
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent rounded-t-full pointer-events-none" />
           </motion.div>
        </div>

        {/* Bottom Status */}
        <div className="mt-16 text-center z-10">
           <p className="text-slate-600 text-sm">
             Ready to continue your journey?
           </p>
        </div>

      </div>

      {/* Right Sidebar Stats (Visual Only for now) */}
      <div className="hidden lg:flex absolute right-8 top-1/2 -translate-y-1/2 flex-col gap-6">
         <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800 w-48 text-right group hover:border-teal-500/20 transition-colors">
            <h4 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Active Today</h4>
            <div className="text-4xl font-thin text-white mb-[-5px]">00</div>
            <div className="text-sm text-slate-500 font-medium">Hours</div>
            <div className="text-4xl font-thin text-white mt-4 mb-[-5px]">00</div>
            <div className="text-sm text-slate-500 font-medium">Minutes</div>
         </div>
      </div>

      {/* Bottom Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-900 bg-slate-950 flex justify-end px-8 z-20">
         <button 
           onClick={handleLogout}
           className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider group"
         >
           <FaSignOutAlt className="group-hover:text-red-400 transition-colors" />
           Logout
         </button>
      </div>

    </div>
  );
};

export default WorkspaceLanding;
