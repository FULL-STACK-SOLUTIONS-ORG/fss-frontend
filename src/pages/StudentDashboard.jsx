
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { programModuleAPI, progressAPI } from '../services/api';
import { FaBook, FaCheckCircle, FaCircle, FaList, FaExternalLinkAlt, FaBars, FaTimes, FaLock, FaUser } from 'react-icons/fa';
import StudentProfile from '../components/student/StudentProfile';
import StudentSocialMediaTracker from '../components/student/StudentSocialMediaTracker';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState(location.state?.view === 'profile' ? 'profile' : null);
  const [activeTab, setActiveTab] = useState('Technical');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [progress, setProgress] = useState(null);
  const [checkedTaskDetails, setCheckedTaskDetails] = useState({}); // Map of taskId -> { status, adminComment }
  const [taskLinks, setTaskLinks] = useState({});
  const [localCheckedIds, setLocalCheckedIds] = useState([]);
  const [editingTaskIds, setEditingTaskIds] = useState([]);
  const isInitialLoadDone = React.useRef(false);


  // 1. Initial Load from LocalStorage
  useEffect(() => {
    if (user?._id && !isInitialLoadDone.current) {
       const storedIds = JSON.parse(localStorage.getItem(`fss_draft_checked_ids_${user._id}`) || '[]');
       const storedLinks = JSON.parse(localStorage.getItem(`fss_draft_task_links_${user._id}`) || '{}');
       if (storedIds.length > 0) setLocalCheckedIds(storedIds);
       if (Object.keys(storedLinks).length > 0) setTaskLinks(storedLinks);
       isInitialLoadDone.current = true;
    }
  }, [user?._id]);

  // 2. Merge with Progress from Backend
  useEffect(() => {
    if (progress?.checkedTasks) {
       const links = {};
       const checkedIds = [];
       progress.checkedTasks.forEach(t => {
           const tid = t.taskId.toString();
           if (t.submissionLink) links[tid] = t.submissionLink;
           checkedIds.push(tid);
       });
       setTaskLinks(prev => ({ ...prev, ...links }));
       setLocalCheckedIds(prev => Array.from(new Set([...prev, ...checkedIds])));
    }
  }, [progress]);

  // 3. Persist Drafts to LocalStorage
  useEffect(() => {
    if (user?._id && isInitialLoadDone.current) {
        localStorage.setItem(`fss_draft_checked_ids_${user._id}`, JSON.stringify(localCheckedIds));
    }
  }, [localCheckedIds, user?._id]);

  useEffect(() => {
    if (user?._id && isInitialLoadDone.current) {
        localStorage.setItem(`fss_draft_task_links_${user._id}`, JSON.stringify(taskLinks));
    }
  }, [taskLinks, user?._id]);

  useEffect(() => {
    if (location.state?.view === 'profile') {
      setSelectedModule('profile');
    } else if (location.state?.view === 'tasks') {
      // When switching to tasks view, reset to default module
      if (modules.length > 0) {
        const unlockedModules = modules.filter(m => !m.isLocked);
        if (unlockedModules.length > 0) {
          setSelectedModule(unlockedModules[unlockedModules.length - 1]);
        }
      }
    }
  }, [location.state, modules]);

  useEffect(() => {
    if (user && !user.isDashboardApproved) {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchModules();
    fetchProgress();
  }, []);

  const fetchModules = async () => {
    try {
      const response = await programModuleAPI.getAll();
      if (response.success) {
        setModules(response.data);
        // Only set default module if we're not showing the profile
        if (response.data.length > 0 && location.state?.view !== 'profile') {
          const unlockedModules = response.data.filter(m => !m.isLocked);
          if (unlockedModules.length > 0) {
            // Default to the last available module (highest order)
            setSelectedModule(unlockedModules[unlockedModules.length - 1]);
          } else {
            setSelectedModule(null);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch modules:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProgress = async () => {
      try {
          const response = await progressAPI.getProgress();
          if (response.success && response.progress) {
              setProgress(response.progress);
              
              const details = {};
              if (response.progress.checkedTasks) {
                  response.progress.checkedTasks.forEach(t => {
                      const tid = t.taskId.toString();
                      details[tid] = {
                          status: t.status || 'pending',
                          adminComment: t.adminComment,
                          verifiedAt: t.verifiedAt
                      };
                  });
              }
              setCheckedTaskDetails(details);
          }
      } catch (error) {
          console.error("Failed to fetch progress:", error);
      }
  };

  const CATEGORIES = ['Technical', 'Miscellaneous', 'Personal Branding'];

  if (!user || !user.isDashboardApproved) {
    return null;
  }

  // Get review for current module
  // Get review for current module
  const currentReview = progress?.moduleReviews?.find(r => r.moduleId === selectedModule?._id);
  const checkedTaskIds = localCheckedIds;

  const handleToggleTask = (taskIdRaw, explicitLink) => {
      const taskId = taskIdRaw.toString();
      if (explicitLink === undefined) {
          // Simple toggle (usually from Undo/X button)
          setLocalCheckedIds(prev => {
              const isChecked = prev.includes(taskId);
              if (isChecked) {
                  setEditingTaskIds(e => e.filter(id => id !== taskId));
                  return prev.filter(id => id !== taskId);
              }
              return [...prev, taskId];
          });
      } else {
          // Main button click
          const isChecked = localCheckedIds.includes(taskId);
          const isEditing = editingTaskIds.includes(taskId);

          if (!isChecked) {
              // Mark as complete
              setLocalCheckedIds(prev => [...prev, taskId]);
          } else if (!isEditing) {
              // Enter edit mode
              setEditingTaskIds(prev => [...prev, taskId]);
          } else {
              // Save changes
              setEditingTaskIds(prev => prev.filter(id => id !== taskId));
          }
      }
  };

  const handleRequestReview = async () => {
      if (!selectedModule) return;

      
      try {
          const response = await progressAPI.requestReview(selectedModule._id);
          if (response.success) {
              setProgress(prev => ({
                  ...prev,
                  moduleReviews: response.moduleReviews
              }));
              // alert('Review request submitted successfully!');
          }
      } catch (error) {
          console.error('Failed to request review:', error);
          // alert('Failed to submit review request.');
      }
  };

  const handleSubmitAll = async () => {
    if (!selectedModule) return;
    
    try {
        const moduleTaskIds = selectedModule.tasks.map(t => t._id);
        const tasksToSubmit = localCheckedIds
             .filter(id => moduleTaskIds.includes(id))
             .map(id => ({
                 taskId: id,
                 submissionLink: taskLinks[id]
             }));

        const response = await progressAPI.submitAllTasks(selectedModule._id, tasksToSubmit);
        if (response.success) {
             setProgress(prev => ({
                ...prev,
                checkedTasks: response.checkedTasks
            }));
            
             const details = {};
             if (response.checkedTasks) {
                 response.checkedTasks.forEach(t => {
                     const tid = t.taskId.toString();
                     details[tid] = {
                         status: t.status || 'pending',
                         adminComment: t.adminComment,
                         verifiedAt: t.verifiedAt
                     };
                 });
             }
             setCheckedTaskDetails(details);
             
             // NEW: Automatically request review when Submit All is clicked
             await handleRequestReview();

             // Clear local drafts after successful submission
             if (user?._id) {
                 localStorage.removeItem(`fss_draft_checked_ids_${user._id}`);
                 localStorage.removeItem(`fss_draft_task_links_${user._id}`);
             }
        }
    } catch (error) {
        console.error('Failed to submit all tasks:', error);
    }
  };

  const allTasksCompleted = selectedModule?.tasks?.every(t => checkedTaskIds.includes(t._id.toString()));
  const allTasksVerified = selectedModule?.tasks?.length > 0 && selectedModule.tasks.every(t => checkedTaskDetails[t._id.toString()]?.status === 'approved');
  const hasRejectedTasks = selectedModule?.tasks?.some(t => checkedTaskDetails[t._id.toString()]?.status === 'rejected');
  const rejectedTaskCount = selectedModule?.tasks?.filter(t => checkedTaskDetails[t._id.toString()]?.status === 'rejected').length || 0;
  const reviewStatus = currentReview?.reviewRequestStatus || 'none';

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-950 via-teal-900 to-teal-950 pt-16 flex">
       {/* Mobile Sidebar Toggle - Hide when profile is active */}
       {selectedModule !== 'profile' && (
         <button 
          className="lg:hidden fixed bottom-4 right-4 z-50 bg-teal-600 text-white p-3 rounded-full shadow-lg"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <FaBars />
        </button>
       )}

      {/* Sidebar - Modules List - Hide when profile is active */}
      {selectedModule !== 'profile' && (
        <aside className={`fixed lg:sticky top-16 h-[calc(100vh-4rem)] w-64 bg-teal-900/95 backdrop-blur-sm border-r border-teal-800/50 overflow-y-auto transition-transform duration-300 z-40 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}>
          <div className="p-4 border-b border-teal-800/50">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FaBook className="text-teal-400" /> Modules
            </h2>
          </div>
          <nav className="p-2 space-y-1">
            {loading ? (
               <div className="text-center py-4 text-teal-300">Loading...</div>
            ) : modules.length === 0 ? (
               <div className="text-center py-4 text-teal-300">No modules available</div>
            ) : (
               modules.map((module) => (
                <button
                  key={module._id}
                  disabled={module.isLocked}
                  onClick={() => {
                    if (!module.isLocked) {
                      setSelectedModule(module);
                      setIsSidebarOpen(false);
                    }
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-colors flex items-center gap-3 ${
                    selectedModule?._id === module._id
                      ? 'bg-teal-800/60 text-teal-200 border border-teal-500/40'
                      : module.isLocked 
                        ? 'text-teal-700 cursor-not-allowed opacity-70' 
                        : 'text-teal-300 hover:bg-teal-800/40 hover:text-white'
                  }`}
                >
                  {module.isLocked ? (
                      <FaLock className="w-4 h-4 text-slate-500" />
                  ) : (
                      <div className={`w-2 h-2 rounded-full ${selectedModule?._id === module._id ? 'bg-teal-400' : 'bg-slate-600'}`} />
                  )}
                  
                  <div className="flex-1 truncate">
                     <div className="text-xs font-bold uppercase tracking-wider opacity-70">Module {module.moduleNumber}</div>
                     <div className="font-medium truncate">{module.title}</div>
                  </div>
                </button>
              ))
            )}
          </nav>
        </aside>
      )}

      
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto bg-transparent p-4 lg:p-8">
        {/* Mobile Header */}
        <header className="flex lg:hidden justify-between items-center mb-6">
          <h1 className="text-xl font-bold text-white truncate">
             {selectedModule === 'profile' ? 'Student Profile' : selectedModule ? selectedModule.title : 'Tasks'}
          </h1>
          {selectedModule !== 'profile' && (
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800"
            >
              <FaBars />
            </button>
          )}
        </header>

        {selectedModule === 'profile' ? (
            <StudentProfile />
        ) : selectedModule ? (
        <div className="max-w-7xl mx-auto">


{/* Grid Layout for Task Container and Review Summary */}
{/* Grid Layout: Tasks (Left) - Flow (Middle) - Review (Right) */}
             <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Task Container - Left Side */}
                <div className="xl:col-span-7">
                  <div className="bg-teal-900/60 backdrop-blur-md rounded-2xl border border-teal-800/50 overflow-hidden shadow-xl h-full">
                    <div className="flex border-b border-teal-800/50 overflow-x-auto">
                      {CATEGORIES.map(category => (
                        <button
                          key={category}
                          onClick={() => setActiveTab(category)}
                          className={`flex-1 px-4 py-3 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                            activeTab === category
                              ? 'bg-teal-600 text-white'
                              : 'text-teal-300 hover:bg-teal-800/50 hover:text-white'
                          }`}
                        >
                          {category}
                        </button>
                      ))}
                    </div>

                    <div className="p-6 min-h-[500px] flex flex-col relative">
                        
                        {/* Social Media Tracker for Personal Branding */}
                        {activeTab === 'Personal Branding' && (
                          <div className="mb-8">
                            <StudentSocialMediaTracker moduleId={selectedModule._id} />
                          </div>
                        )}
                        
                        <div className="flex-1 space-y-6">
                          {selectedModule.tasks && selectedModule.tasks.filter(t => t.category === activeTab).length > 0 ? (
                            selectedModule.tasks
                              .filter(t => t.category === activeTab)
                              .map((task, idx) => (
                                <div key={task._id || idx} className="bg-slate-900/40 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50 hover:border-teal-500/40 transition-all group flex gap-5 relative overflow-hidden">
                                    {/* ... rest of task mapping ... */}
                                    {/* Ordered Numbering */}
                                    <div className="flex-shrink-0 flex flex-col items-center">
                                        <div className="w-8 h-8 rounded-lg bg-teal-800/40 border border-teal-700/40 flex items-center justify-center text-teal-300 font-bold text-[11px] shadow-inner">
                                            {idx + 1}
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex justify-between items-start gap-4">
                                            <p className={`text-[12px] font-medium leading-relaxed whitespace-pre-wrap transition-colors ${checkedTaskIds.includes(task._id) ? 'text-slate-500' : 'text-slate-100 group-hover:text-teal-400'}`}>
                                                {task.description || task.title}
                                            </p>
                                            {task.link && (
                                                <a 
                                                    href={task.link} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="p-2 bg-transparent text-teal-500/60 hover:text-teal-400 transition-all border border-teal-500/20 rounded-lg"
                                                    title="Task Reference"
                                                >
                                                    <FaExternalLinkAlt size={12} />
                                                </a>
                                            )}
                                        </div>

                                        <div className={`mt-6 flex items-center gap-3 ${!task.requiresLink ? 'justify-end' : ''}`}>
                                            {/* Link Input Section */}
                                            {task.requiresLink && (
                                                <div className="relative flex-1">
                                                    <input
                                                        type="text"
                                                        disabled={checkedTaskIds.includes(task._id) && !editingTaskIds.includes(task._id)}
                                                        placeholder={checkedTaskIds.includes(task._id) ? "Submission Link" : "Submission Link..."}
                                                        value={taskLinks[task._id] || ''}
                                                        onChange={(e) => setTaskLinks({ ...taskLinks, [task._id]: e.target.value })}
                                                        className={`w-full border rounded-lg px-3 py-1.5 text-[11px] transition-all outline-none ${
                                                            checkedTaskIds.includes(task._id) && !editingTaskIds.includes(task._id)
                                                            ? 'bg-teal-900/40 border-teal-800/30 text-teal-600 cursor-not-allowed'
                                                            : 'bg-teal-900/80 border-teal-500/30 text-teal-100 focus:ring-2 focus:ring-teal-500/50'
                                                        }`}
                                                    />
                                                </div>
                                            )}

                                            {/* Combined Action Button with Slower Flip Animation */}
                                            <div className="perspective-1000 relative h-8 w-24">
                                                <motion.button
                                                    onClick={() => handleToggleTask(task._id, taskLinks[task._id.toString()])}
                                                    initial={false}
                                                    animate={{ 
                                                        rotateX: checkedTaskIds.includes(task._id.toString()) ? (editingTaskIds.includes(task._id.toString()) ? 0 : 180) : 0,
                                                        scale: 1
                                                    }}
                                                    whileHover={{ scale: 1.02 }}
                                                    whileTap={{ scale: 0.98 }}
                                                    transition={{ 
                                                        rotateX: { type: "spring", stiffness: 120, damping: 25 },
                                                        duration: 0.8
                                                    }}
                                                    className={`w-full h-full rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all preserve-3d ${
                                                        editingTaskIds.includes(task._id)
                                                        ? 'bg-transparent text-teal-400 border-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.1)]' 
                                                        : checkedTaskIds.includes(task._id)
                                                            ? 'bg-transparent text-teal-500/40 border-slate-700/50 hover:text-teal-400'
                                                            : 'bg-transparent text-emerald-500 border-emerald-500/40 hover:bg-emerald-500/5 shadow-[0_0_10px_rgba(16,185,129,0.05)]'
                                                    }`}
                                                >
                                                    <span className="absolute inset-0 flex items-center justify-center backface-hidden">
                                                        {editingTaskIds.includes(task._id) ? 'Save' : 'Complete'}
                                                    </span>
                                                    <span className="absolute inset-0 flex items-center justify-center backface-hidden rotate-x-180">
                                                        {checkedTaskDetails[task._id.toString()]?.status === 'rejected' ? 'Resubmit' : 'Modify'}
                                                    </span>
                                                </motion.button>
                                            </div>

                                            {/* Compact Unmark/Undo Option */}
                                            {checkedTaskIds.includes(task._id) && (
                                                <button 
                                                    onClick={() => handleToggleTask(task._id)}
                                                    className="p-1.5 text-slate-600 hover:text-red-400 transition-colors"
                                                    title="Unmark Task"
                                                >
                                                    <FaTimes size={10} />
                                                </button>
                                            )}
                                        </div>

                                        {/* Status Feedback */}
                                        {checkedTaskIds.includes(task._id) && checkedTaskDetails[task._id] && (
                                            <div className="mt-4 flex flex-col gap-2 p-4 rounded-xl bg-teal-900/40 border border-teal-800/30">
                                                <div className="flex items-center gap-3">
                                                    {checkedTaskDetails[task._id].status === 'approved' && (
                                                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-green-500/10 text-green-400 border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                                                            Verified
                                                        </span>
                                                    )}
                                                    {checkedTaskDetails[task._id].status === 'rejected' && (
                                                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-400 border border-red-500/20 shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                                                            Rejected
                                                        </span>
                                                    )}
                                                    {checkedTaskDetails[task._id].status === 'pending' && (
                                                        <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 shadow-[0_0_15px_rgba(234,179,8,0.1)]">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-bounce"></span>
                                                            Under Review
                                                        </span>
                                                    )}
                                                </div>
                                                {checkedTaskDetails[task._id].adminComment && (
                                                    <div className="text-xs text-slate-400 font-medium italic pl-3 border-l-2 border-slate-600 mt-1">
                                                        Admin: "{checkedTaskDetails[task._id].adminComment}"
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                              ))
                          ) : (
                            <div className="text-center py-20 bg-teal-900/20 rounded-3xl border border-dashed border-teal-800/40">
                              <p className="text-slate-400 text-sm font-medium">No tasks found in {activeTab}.</p>
                            </div>
                          )}
                        </div>

                        {/* Submit All - Normal Flow At Bottom */}
                        {selectedModule.tasks && selectedModule.tasks.length > 0 && (
                          <div className="mt-8 pt-6 border-t border-teal-800/50 flex flex-col items-center gap-3">
                              {hasRejectedTasks && (
                                  <div className="text-red-400 text-xs font-bold bg-red-500/10 px-4 py-2 rounded-lg border border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)] flex items-center gap-2 animate-pulse">
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                      </svg>
                                      {rejectedTaskCount} task{rejectedTaskCount !== 1 ? 's' : ''} rejected. Fix & Resubmit.
                                  </div>
                              )}
                              <button
                                  onClick={handleSubmitAll}
                                  disabled={!allTasksCompleted || allTasksVerified || (reviewStatus === 'pending' && !hasRejectedTasks)}
                                  className={`relative h-9 w-32 rounded-full font-bold text-[11px] uppercase tracking-wider transition-all transform hover:scale-105 overflow-hidden border ${
                                      (!allTasksCompleted || allTasksVerified || (reviewStatus === 'pending' && !hasRejectedTasks))
                                      ? 'bg-transparent border-slate-700 text-slate-600 cursor-not-allowed' 
                                      : 'bg-transparent border-teal-500/50 text-teal-400 hover:bg-teal-500/10 hover:border-teal-400 shadow-[0_0_20px_rgba(20,184,166,0.1)]'
                                  }`}
                              >
                                  <AnimatePresence mode="wait" initial={false}>
                                      <motion.div
                                          key={allTasksVerified ? 'verified' : (reviewStatus === 'pending' ? 'pending' : 'submit')}
                                          initial={{ y: -20, opacity: 0 }}
                                          animate={{ y: 0, opacity: 1 }}
                                          exit={{ y: 20, opacity: 0 }}
                                          transition={{ duration: 0.2 }}
                                          className="absolute inset-0 flex items-center justify-center gap-1"
                                      >
                                          {allTasksVerified ? <><FaCheckCircle size={14} /> Verified</> : (hasRejectedTasks ? 'Resubmit All' : (reviewStatus === 'pending' ? 'Reviewing' : (!allTasksCompleted ? 'Finish Tasks' : 'Submit All')))}
                                      </motion.div>
                                  </AnimatePresence>

                              </button>
                          </div>
                        )}
                     </div>
                  </div>
                </div>

                {/* Flow Chart - Middle */}
                <div className="xl:col-span-2 flex flex-col items-center justify-center py-8 relative">
                   {/* Vertical Line Background */}
                   <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-teal-800/50 -z-10 transform -translate-x-1/2"></div>
                   
                   {/* Step 3: Join Meet */}
                   <div className="w-full px-4 mb-4">
                      {reviewStatus === 'scheduled' && currentReview?.meetLink ? (
                          <a 
                             href={currentReview.meetLink}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="w-full py-3 bg-transparent border-2 border-blue-500 text-blue-400 font-bold rounded-xl shadow-[0_0_10px_rgba(59,130,246,0.2)] hover:bg-blue-500/10 transform hover:scale-105 transition-all text-sm flex flex-col items-center gap-1 z-10 relative block text-center"
                          >
                             <span>Join Meet</span>
                             {currentReview.meetDate && (
                                <span className="text-[10px] opacity-90 font-mono mt-1 block bg-blue-500/10 px-2 py-0.5 rounded">
                                    {new Date(currentReview.meetDate).toLocaleString([], { 
                                        weekday: 'short', 
                                        month: 'short', 
                                        day: 'numeric', 
                                        hour: '2-digit', 
                                        minute:'2-digit',
                                        hour12: true
                                    })}
                                </span>
                             )}
                          </a>
                      ) : (currentReview?.reviewRequestStatus === 'completed') ? (
                          <div className="w-full py-3 bg-transparent border-2 border-blue-500 text-blue-400 font-bold rounded-xl shadow-lg flex justify-center items-center gap-1 z-10 relative">
                             <span>Completed</span>
                          </div>
                      ) : (
                          <div className="w-full py-3 bg-teal-900/50 border border-teal-800 text-teal-500 font-bold rounded-xl text-center text-sm z-10 relative opacity-50">
                             Join Meet
                          </div>
                      )}
                   </div>

                   {/* Step 4: Watch Recording */}
                   <div className="w-full px-4">
                      {currentReview?.recordingLink && (
                          <a 
                             href={currentReview.recordingLink}
                             target="_blank"
                             rel="noopener noreferrer"
                             className="w-full py-3 bg-transparent border-2 border-red-500 text-red-400 font-bold rounded-xl shadow-[0_0_10px_rgba(239,68,68,0.2)] hover:bg-red-500/10 transform hover:scale-105 transition-all text-sm flex justify-center items-center gap-1 z-10 relative block text-center"
                          >
                             <span>Watch Recording</span>
                          </a>
                      )}
                   </div>


                </div>

                {/* Review Summary Container - Right Side */}
                <div className="xl:col-span-3">
                  <div className="bg-teal-900/60 backdrop-blur-md rounded-2xl border border-teal-800/50 overflow-hidden shadow-xl h-full flex flex-col">
                    <div className="p-4 border-b border-teal-800/50 bg-teal-800/30">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        Review Summary
                      </h3>
                    </div>
                    <div className="p-6 flex-1">
                      {(() => {
                        if (!currentReview && reviewStatus === 'none') {
                            return (
                                <div className="text-center py-12 text-slate-500 italic h-full flex items-center justify-center">
                                    <p>Complete tasks and apply for review to see feedback here.</p>
                                </div>
                            );
                        }

                        if (reviewStatus === 'pending') {
                            return (
                                <div className="text-center py-12 h-full flex flex-col items-center justify-center">
                                     <div className="w-16 h-16 bg-yellow-500/10 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-yellow-500/30 animate-pulse">
                                         <span className="text-2xl">⏳</span>
                                     </div>
                                     <h4 className="text-yellow-400 font-bold text-lg mb-2">Review Pending</h4>
                                     <p className="text-slate-400 text-sm">Waiting for admin to schedule.</p>
                                </div>
                            );
                        }
                        
                        if (reviewStatus === 'scheduled') {
                             return (
                                <div className="text-center py-12 h-full flex flex-col items-center justify-center">
                                     <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/30">
                                         <span className="text-2xl">📅</span>
                                     </div>
                                     <h4 className="text-blue-400 font-bold text-lg mb-2">Review Scheduled</h4>

                                </div>
                            );
                        }
                        
                        // If review is completed (has status)
                        if (!currentReview) return null; 
                        
                        const status = currentReview.status; 
                        const feedbackPoints = currentReview.feedback || [];

                        const BADGE_CONFIG = {
                          excellent: {
                            color: 'green',
                            title: 'Excellent Performance',
                          },
                          good: {
                            color: 'blue',
                            title: 'Good Progress',
                          },
                          needs_improvement: {
                            color: 'yellow',
                            title: 'Needs Attention',
                          },
                          critical: {
                            color: 'red',
                            title: 'Critical Feedback',
                          }
                        };

                        const config = BADGE_CONFIG[status] || BADGE_CONFIG['excellent'];
                        const colors = {
                           green: { bg: 'bg-green-900/20', border: 'border-green-500/30', text: 'text-green-400', dot: 'bg-green-500', shadow: 'shadow-[0_0_10px_rgba(34,197,94,0.5)]' },
                           blue: { bg: 'bg-blue-900/20', border: 'border-blue-500/30', text: 'text-blue-400', dot: 'bg-blue-500', shadow: 'shadow-[0_0_10px_rgba(59,130,246,0.5)]' },
                           yellow: { bg: 'bg-yellow-900/20', border: 'border-yellow-500/30', text: 'text-yellow-400', dot: 'bg-yellow-500', shadow: 'shadow-[0_0_10px_rgba(234,179,8,0.5)]' },
                           red: { bg: 'bg-red-900/20', border: 'border-red-500/30', text: 'text-red-400', dot: 'bg-red-500', shadow: 'shadow-[0_0_10px_rgba(239,68,68,0.5)]' },
                        };
                        const colorClass = colors[config.color] || colors['green'];

                        return (
                          <div className={`${colorClass.bg} border ${colorClass.border} rounded-xl p-6 h-full transition-all duration-300`}>
                             <div className="flex items-center gap-3 mb-6">
                                <div className={`w-4 h-4 rounded-full ${colorClass.dot} ${colorClass.shadow}`}></div>
                                <h4 className={`${colorClass.text} font-bold uppercase text-sm tracking-wider`}>{config.title}</h4>
                             </div>
                             <ul className="space-y-3">
                               {feedbackPoints.length > 0 ? feedbackPoints.map((point, i) => (
                                 <li key={i} className="flex items-start gap-3 text-slate-300 text-sm leading-relaxed">
                                   <span className={`mt-1.5 w-1.5 h-1.5 rounded-full ${colorClass.dot} opacity-70`}></span>
                                   <span>{point}</span>
                                 </li>
                               )) : (
                                   <li className="text-slate-500 italic">No specific feedback points provided.</li>
                               )}
                             </ul>
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                </div>
             </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-500">
            {loading ? 'Loading content...' : 'Select a module to view tasks'}
          </div>
        )}
      </div>
    </div>
  );
};
export default StudentDashboard;
