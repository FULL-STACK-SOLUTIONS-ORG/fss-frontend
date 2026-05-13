import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { moduleAPI, progressAPI, feedbackAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import AnimatedCoin from '../components/common/AnimatedCoin';
import PieChart from '../components/common/PieChart';
import confetti from 'canvas-confetti';
import TopicQuizModal from '../components/user/TopicQuizModal';
const LearningTracker = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [modules, setModules] = useState([]);
  const [userProgress, setUserProgress] = useState(null);
  const [userPoints, setUserPoints] = useState(0);
  const [userBadges, setUserBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentIndex, setCurrentIndex] = useState(() => {
    const savedIndex = localStorage.getItem('lastModuleIndex');
    return savedIndex ? parseInt(savedIndex, 10) : 0;
  });
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [newBadgeDetails, setNewBadgeDetails] = useState(null);
  const [showDailyLimitModal, setShowDailyLimitModal] = useState(false);
  const [dailyLimitMessage, setDailyLimitMessage] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [selectedQuizTopicName, setSelectedQuizTopicName] = useState('');
  const [loadingQuizTopicId, setLoadingQuizTopicId] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const handleFeedbackSubmit = async () => {
    if (!feedbackText.trim()) return;
    setIsSubmittingFeedback(true);
    try {
      await feedbackAPI.create({ message: feedbackText });
      setFeedbackSuccess(true);
      setFeedbackText('');
      setTimeout(() => setFeedbackSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };
  const sliderRef = useRef(null);
  const [dailyTarget, setDailyTarget] = useState(10); 
  const [weeklyProgress, setWeeklyProgress] = useState([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [calendarDate, setCalendarDate] = useState(new Date());
  useEffect(() => {
    fetchModulesAndProgress();
    const savedTarget = localStorage.getItem('dailyTarget');
    if (savedTarget) {
      setDailyTarget(parseInt(savedTarget));
    }
  }, [isAuthenticated]); 

  useEffect(() => {
    if (userProgress) {
      calculateWeeklyProgress();
    }
  }, [userProgress, dailyTarget, weekOffset]);

  useEffect(() => {
    localStorage.setItem('lastModuleIndex', currentIndex.toString());
  }, [currentIndex]);
  const getLocalDateString = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const dailyProgressMap = useMemo(() => {
    const map = {};
    if (!userProgress?.completedTopics) return map;
    userProgress.completedTopics.forEach(topic => {
      if (!topic.completedAt) return;
      const topicDate = new Date(topic.completedAt);
      const dateStr = getLocalDateString(topicDate);
      map[dateStr] = (map[dateStr] || 0) + 1;
    });
    return map;
  }, [userProgress]);
  const calculateWeeklyProgress = () => {
    const actualToday = new Date();
    const viewDate = new Date();
    viewDate.setDate(viewDate.getDate() + (weekOffset * 7));
    const startOfWeek = new Date(viewDate);
    const day = startOfWeek.getDay(); 
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); 
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    let weekData = [];
    const completedTopics = userProgress?.completedTopics || [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      const dateStr = getLocalDateString(d);
      const count = completedTopics.filter(topic => {
        if (!topic.completedAt) return false;
        const topicDate = new Date(topic.completedAt);
        return getLocalDateString(topicDate) === dateStr;
      }).length;
      weekData.push({
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }), 
        date: d.getDate(), 
        fullDate: dateStr,
        completedCount: count,
        isToday: d.toDateString() === actualToday.toDateString()
      });
    }
    setWeeklyProgress(weekData);
  };
  useEffect(() => {
    localStorage.setItem('dailyTarget', dailyTarget.toString());
  }, [dailyTarget]);
  const triggerFireworks = (elementId) => {
    const element = document.getElementById(elementId);
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const x = (rect.left + rect.width / 2) / window.innerWidth;
    const y = (rect.top + rect.height / 2) / window.innerHeight;
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x, y },
      zIndex: 9999,
      disableForReducedMotion: true
    });
  };
  const fetchModulesAndProgress = async () => {
    try {
      setLoading(true);
      const modulesResponse = await moduleAPI.getAll();
      let progressResponse = { success: false, progress: { completedTopics: [], completedModules: [] } };
      if (isAuthenticated) {
        progressResponse = await progressAPI.getProgress();
      }
      if (modulesResponse.success) {
        const fetchedModules = (modulesResponse.data || []).filter(module => 
          !module.title || !module.title.toLowerCase().includes('be ready')
        );
        const progress = progressResponse.success ? progressResponse.progress : { completedTopics: [], completedModules: [] };
        setUserProgress(progress);
        if (progressResponse.userStats) {
          setUserPoints(progressResponse.userStats.points || 0);
          setUserBadges(progressResponse.userStats.badges || []);
        }
        const modulesWithProgress = fetchedModules.map(module => ({
          ...module,
          topics: module.topics.map(topic => ({
            ...topic,
            completed: progress.completedTopics.some(
              ct => ct.moduleId === module._id && ct.topicId === topic._id.toString()
            )
          }))
        }));
        setModules(modulesWithProgress);
      } else {
        setError('Failed to fetch modules');
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch modules. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };
  const handleToggleTopic = async (moduleId, topicId, currentStatus, moduleIndex) => {
    const startTime = performance.now();
    try {
      if (moduleIndex >= 3 && !isAuthenticated) {
        setShowAuthModal(true);
        return;
      }
      let allTopicsCompleted = false;
      setModules(prevModules =>
        prevModules.map(module => {
          if (module._id === moduleId) {
            const updatedTopics = module.topics.map(topic =>
              topic._id === topicId ? { ...topic, completed: !currentStatus } : topic
            );
            const completedCount = updatedTopics.filter(t => t.completed).length;
            if (completedCount === updatedTopics.length && !currentStatus) {
              allTopicsCompleted = true;
            }
            return { ...module, topics: updatedTopics };
          }
          return module;
        })
      );
      if (allTopicsCompleted) {
        setTimeout(() => triggerFireworks(`module-container-${moduleIndex}`), 300);
      }
      progressAPI.toggleTopic(moduleId, topicId)
        .then(response => {
          if (response.success) {
            setUserProgress(response.progress);
            if (response.userStats) {
              setUserPoints(response.userStats.points);
              setUserBadges(response.userStats.badges);
              if (response.userStats.newBadges && response.userStats.newBadges.length > 0) {
                 const badges = response.userStats.newBadges;
                 let highestBadge = badges.includes('Platinum') ? 'Platinum' : 
                                    badges.includes('Gold') ? 'Gold' : 
                                    badges.includes('Silver') ? 'Silver' : 'Bronze';
                 setNewBadgeDetails(highestBadge);
                 setShowBadgeModal(true);
                 confetti({
                    particleCount: 200,
                    spread: 100,
                    origin: { y: 0.6 },
                    colors: ['#FFD700', '#C0C0C0', '#E5E4E2'] 
                 });
              }
              if (response.userStats.streakBonus > 0) {
                 confetti({
                    particleCount: 150,
                    spread: 80,
                    origin: { y: 0.6 },
                    colors: ['#FFA500'] 
                 });
              }
            }
            if (response.firstTopicMessage) {
              const toast = document.createElement('div');
              toast.className = 'fixed top-24 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-500 to-amber-600 text-white px-6 py-4 rounded-xl shadow-2xl z-50 animate-bounce border-2 border-orange-300';
              toast.style.maxWidth = '90%';
              toast.style.width = 'fit-content';
              toast.innerHTML = `
                <div class="flex items-center gap-3">
                  <span class="text-2xl">🎯</span>
                  <div>
                    <p class="font-bold text-sm">${response.firstTopicMessage}</p>
                  </div>
                </div>
              `;
              document.body.appendChild(toast);
              setTimeout(() => {
                toast.style.transition = 'opacity 0.5s';
                toast.style.opacity = '0';
                setTimeout(() => toast.remove(), 500);
              }, 15000);
            }
          } else {
             setModules(prevModules =>
              prevModules.map(module => {
                if (module._id === moduleId) {
                  return {
                    ...module,
                    topics: module.topics.map(topic =>
                      topic._id === topicId ? { ...topic, completed: currentStatus } : topic
                    )
                  };
                }
                return module;
              })
            );
            alert('Failed to update topic. Changes have been reverted.');
          }
        })
        .catch(err => {
          if (err.data?.dailyLimitExceeded) {
            setModules(prevModules =>
              prevModules.map(module => {
                if (module._id === moduleId) {
                  return {
                    ...module,
                    topics: module.topics.map(topic =>
                      topic._id === topicId ? { ...topic, completed: currentStatus } : topic
                    )
                  };
                }
                return module;
              })
            );
            setDailyLimitMessage(err.data.limitMessage || 'Daily limit reached. Please try again tomorrow.');
            setShowDailyLimitModal(true);
            return;
          }
          setModules(prevModules =>
            prevModules.map(module => {
              if (module._id === moduleId) {
                return {
                  ...module,
                  topics: module.topics.map(topic =>
                    topic._id === topicId ? { ...topic, completed: currentStatus } : topic
                  )
                };
              }
              return module;
            })
          );
          alert('Failed to update topic. Please try again.');
        });
    } catch (err) {
      console.error(err);
    }
  };
  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => {
      return prevIndex === 0 ? modules.length - 1 : prevIndex - 1;
    });
  };
  const goToNext = () => {
    setCurrentIndex((prevIndex) => {
      return prevIndex === modules.length - 1 ? 0 : prevIndex + 1;
    });
  };
  const goToSlide = (index) => {
    setCurrentIndex(index);
  };
  useEffect(() => {
    if (sliderRef.current && modules.length > 0) {
      const container = sliderRef.current;
      const slideWidth = container.offsetWidth;
      container.scrollTo({
        left: currentIndex * slideWidth,
        behavior: 'smooth'
      });
    }
  }, [currentIndex, modules.length]);
  const getModuleColor = (index) => {
    const colors = [
      { bg: '#60a5fa', border: '#1e40af', glow: 'rgba(96, 165, 250' }, 
      { bg: '#8b5cf6', border: '#5b21b6', glow: 'rgba(139, 92, 246' }, 
      { bg: '#10b981', border: '#047857', glow: 'rgba(16, 185, 129' }, 
      { bg: '#f59e0b', border: '#b45309', glow: 'rgba(245, 158, 11' }, 
      { bg: '#ef4444', border: '#b91c1c', glow: 'rgba(239, 68, 68' }, 
      { bg: '#ec4899', border: '#be185d', glow: 'rgba(236, 72, 153' }, 
      { bg: '#06b6d4', border: '#0e7490', glow: 'rgba(6, 182, 212' }, 
      { bg: '#6366f1', border: '#4338ca', glow: 'rgba(99, 102, 241' }, 
    ];
    return colors[index % colors.length];
  };
  const overallProgress = useMemo(() => {
    if (modules.length === 0) return { completedModules: 0, totalModules: 0, percentage: 0 };
    const completedModules = modules.filter(module => {
      const totalTopics = module.topics?.length || 0;
      const completedTopics = module.topics?.filter(t => t.completed).length || 0;
      return totalTopics > 0 && completedTopics === totalTopics;
    }).length;
    const totalModules = modules.length;
    const percentage = totalModules > 0 ? (completedModules / totalModules) * 100 : 0;
    return {
      completedModules: completedModules,
      totalModules: totalModules,
      percentage: percentage
    };
  }, [modules]);
  const currentModuleProgress = useMemo(() => {
    if (modules.length === 0 || currentIndex >= modules.length) {
      return { completedTopics: 0, totalTopics: 0, percentage: 0 };
    }
    const module = modules[currentIndex];
    const completedTopics = module.topics?.filter(t => t.completed).length || 0;
    const totalTopics = module.topics?.length || 0;
    const percentage = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;
    return { completedTopics, totalTopics, percentage };
  }, [modules, currentIndex]);
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ paddingTop: '100px', backgroundColor: '#F5F0E8' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: '#D4B896', borderTopColor: 'transparent' }}></div>
          <p style={{ color: '#5A5550' }}>Loading learning modules...</p>
        </div>
      </div>
    );
  }
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ paddingTop: '100px', backgroundColor: '#F5F0E8' }}>
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={fetchModulesAndProgress}
            className="px-4 py-2 text-white rounded-lg transition-colors"
            style={{ backgroundColor: '#9B7D43' }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen" style={{ paddingTop: '100px', paddingBottom: '48px', backgroundColor: '#F5F0E8' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {}
        <div className="mb-8 rounded-2xl p-6 backdrop-blur-sm" style={{ backgroundColor: '#FAF7F2', border: '1px solid #E0D8CC', boxShadow: '0 4px 12px rgba(28,26,23,0.06)' }}>
          <div className="flex flex-col lg:flex-row gap-8">
            {}
            <div className="flex-1">
              <div className="text-center mb-4">
                <h2 className="text-xl md:text-2xl font-bold inline-flex items-center gap-2" style={{ color: '#1C1A17', fontFamily: "'Playfair Display', Georgia, serif" }}>
                  Test Your Knowledge With A Tick
                  <span className="bg-green-500/20 text-green-400 p-1 rounded-full border border-green-500/50 shadow-sm">
                    <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                </h2>
                <div className="flex flex-col items-center justify-center gap-3 mt-4">
                  <div className="flex items-center gap-4">
                    <div className="px-4 py-1.5 rounded-full flex items-center gap-2 shadow-sm" style={{ backgroundColor: '#FFF8F0', border: '1px solid rgba(192,122,58,0.3)' }}>
                      <span className="text-lg animate-pulse">🔥</span>
                      <span className="text-sm font-bold text-orange-400">
                        Streak: <span style={{ color: '#1C1A17' }}>{(() => {
                          if (!userProgress?.completedTopics) return 0;
                          const uniqueDates = new Set();
                          userProgress.completedTopics.forEach(topic => {
                            if (!topic.completedAt) return;
                            const date = new Date(topic.completedAt);
                            const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                            uniqueDates.add(dateStr);
                          });
                          const sortedDates = Array.from(uniqueDates).sort().reverse();
                          if (sortedDates.length === 0) return 0;
                          const today = new Date();
                          const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                          const yesterday = new Date(today);
                          yesterday.setDate(yesterday.getDate() - 1);
                          const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
                          if (sortedDates[0] !== todayStr && sortedDates[0] !== yesterdayStr) {
                            return 0;
                          }
                          let streak = 1;
                          let currentDate = new Date(sortedDates[0]);
                          for (let i = 1; i < sortedDates.length; i++) {
                            const prevDate = new Date(currentDate);
                            prevDate.setDate(prevDate.getDate() - 1);
                            const prevDateStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(prevDate.getDate()).padStart(2, '0')}`;
                            if (sortedDates[i] === prevDateStr) {
                              streak++;
                              currentDate = prevDate;
                            } else {
                              break;
                            }
                          }
                          return streak;
                        })()} {(() => {
                          if (!userProgress?.completedTopics) return 'days';
                          const uniqueDates = new Set();
                          userProgress.completedTopics.forEach(topic => {
                            if (!topic.completedAt) return;
                            const date = new Date(topic.completedAt);
                            const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
                            uniqueDates.add(dateStr);
                          });
                          const sortedDates = Array.from(uniqueDates).sort().reverse();
                          if (sortedDates.length === 0) return 'days';
                          const today = new Date();
                          const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                          const yesterday = new Date(today);
                          yesterday.setDate(yesterday.getDate() - 1);
                          const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;
                          if (sortedDates[0] !== todayStr && sortedDates[0] !== yesterdayStr) {
                            return 'days';
                          }
                          let streak = 1;
                          let currentDate = new Date(sortedDates[0]);
                          for (let i = 1; i < sortedDates.length; i++) {
                            const prevDate = new Date(currentDate);
                            prevDate.setDate(prevDate.getDate() - 1);
                            const prevDateStr = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, '0')}-${String(prevDate.getDate()).padStart(2, '0')}`;
                            if (sortedDates[i] === prevDateStr) {
                              streak++;
                              currentDate = prevDate;
                            } else {
                              break;
                            }
                          }
                          return streak === 1 ? 'day' : 'days';
                        })()}</span>
                      </span>
                    </div>
                    {}
                    <div className="px-4 py-1.5 rounded-full flex items-center gap-2 shadow-sm" style={{ backgroundColor: '#FFF8E8', border: '1px solid rgba(201,169,110,0.3)' }}>
                      <span className="text-lg"><AnimatedCoin className="w-5 h-5" textSize="text-[8px]" /></span>
                      <span className="text-sm font-bold text-yellow-400">
                        Points: <span style={{ color: '#1C1A17' }}>{userPoints}</span>
                      </span>
                    </div>
                    {}
                    <div className="flex items-center gap-2 rounded-full px-3 py-1.5" style={{ backgroundColor: '#F0E8DC', border: '1px solid #D4B896' }}>
                      <span className="text-[10px] font-medium uppercase tracking-wider hidden sm:inline" style={{ color: '#9A8A7A' }}>DAILY TARGET</span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setDailyTarget(Math.max(1, dailyTarget - 1))}
                          className="w-5 h-5 rounded flex items-center justify-center text-xs transition-colors" style={{ backgroundColor: '#9B7D43', color: '#FAF7F2' }}
                        >-</button>
                        <span className="font-bold w-5 text-center text-sm" style={{ color: '#1C1A17' }}>{dailyTarget}</span>
                        <button
                          onClick={() => setDailyTarget(Math.min(20, dailyTarget + 1))}
                          className="w-5 h-5 rounded flex items-center justify-center text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{ backgroundColor: '#FAF7F2', color: '#1C1A17', border: '1px solid #D4B896' }}
                          disabled={dailyTarget >= 20}
                        >+</button>
                      </div>
                      <span className="text-[10px] font-medium uppercase tracking-wider hidden sm:inline" style={{ color: '#9A8A7A' }}>TOPICS</span>
                    </div>
                  </div>
                  {}
                  <div className="mt-2 text-left">
                    <div className="flex flex-wrap gap-3">
                      {(() => {
                        const TIERS = [
                          { name: 'Bronze', color: 'from-orange-400 to-orange-600', border: 'border-orange-400', shadow: 'shadow-orange-500/20', icon: '🥉' },
                          { name: 'Silver', color: 'from-slate-300 to-slate-400', border: 'border-slate-300', shadow: 'shadow-slate-400/20', icon: '🥈' },
                          { name: 'Gold', color: 'from-yellow-300 to-yellow-500', border: 'border-yellow-400', shadow: 'shadow-yellow-500/20', icon: '🥇' },
                          { name: 'Platinum', color: 'from-cyan-300 to-cyan-500', border: 'border-cyan-400', shadow: 'shadow-cyan-500/20', icon: '💎' },
                          { name: 'Diamond', color: 'from-fuchsia-400 to-purple-600', border: 'border-fuchsia-400', shadow: 'shadow-fuchsia-500/20', icon: '🔮' },
                          { name: 'Master', color: 'from-red-500 to-rose-600', border: 'border-red-500', shadow: 'shadow-red-500/20', icon: '👑' }
                        ];
                        const allBadges = [];
                        let threshold = 100;
                        TIERS.forEach((tier, tIdx) => {
                          if (tier.name === 'Master') {
                             allBadges.push({
                                ...tier,
                                division: 'I',
                                threshold: threshold,
                                fullName: `${tier.name} I`
                              });
                          } else {
                            for (let i = 1; i <= 5; i++) {
                              allBadges.push({
                                ...tier,
                                division: ['I', 'II', 'III', 'IV', 'V'][i-1],
                                threshold: threshold,
                                fullName: `${tier.name} ${['I', 'II', 'III', 'IV', 'V'][i-1]}`
                              });
                              threshold += 100;
                            }
                          }
                        });
                        const batchIndex = Math.min(Math.floor(userPoints / 1000), 5);
                        const startIdx = batchIndex * 5;
                        const currentBadges = allBadges.slice(startIdx, startIdx + 5);
                        return currentBadges.map((badge, idx) => {
                          const isUnlocked = userPoints >= badge.threshold;
                          return (
                            <div key={idx} className="relative group">
                              {}
                              <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 shadow-xl" style={{ backgroundColor: '#1C1A17', color: '#FAF7F2', border: '1px solid #3A3530' }}>
                                <span className="font-bold" style={{ color: isUnlocked ? '#C9A96E' : '#9A8A7A' }}>{badge.fullName}</span>
                                <span className="ml-1" style={{ color: '#9A8A7A' }}>({badge.threshold} pts)</span>
                              </div>
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center border-2 transition-all duration-300 ${
                                isUnlocked
                                  ? `bg-gradient-to-br ${badge.color} ${badge.border} shadow-lg ${badge.shadow}`
                                  : ''
                              }`} style={!isUnlocked ? (idx % 2 === 0
                                ? { background: 'linear-gradient(135deg, #C9A96E, #9B7D43)', borderColor: '#9B7D43', opacity: 0.5 }
                                : { background: 'linear-gradient(135deg, #D8D8D8, #A0A0A0)', borderColor: '#A0A0A0', opacity: 0.5 }
                              ) : {}}>
                                <div className="flex flex-col items-center leading-none">
                                  <span className="text-lg filter drop-shadow-sm">{badge.icon}</span>
                                </div>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative px-10">
                <button 
                  onClick={() => setWeekOffset(prev => prev - 1)} 
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full p-2 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-110" style={{ backgroundColor: '#FAF7F2', border: '1px solid #D4B896' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#1C1A17' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <div className="flex items-center justify-between gap-1 overflow-x-auto pb-2 no-scrollbar">
                {weeklyProgress.map((day, idx) => {
                  const progress = Math.min(100, (day.completedCount / dailyTarget) * 100);
                  const isCompleted = day.completedCount >= dailyTarget;
                  const circumference = 2 * Math.PI * 15;
                  return (
                    <div key={idx} className="flex flex-col items-center gap-1 min-w-[40px]">
                      <div className="relative w-9 h-9 flex items-center justify-center group">
                        {}
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                          {}
                          <circle
                            cx="18"
                            cy="18"
                            r="15"
                            fill="transparent"
                            stroke="#E0D8CC"
                            strokeWidth="3"
                          />
                          {}
                          <circle
                            cx="18"
                            cy="18"
                            r="15"
                            fill="transparent"
                            stroke={isCompleted ? '#22c55e' : '#f97316'}
                            strokeWidth="3"
                            strokeDasharray={circumference}
                            strokeDashoffset={circumference * (1 - progress / 100)}
                            strokeLinecap="round"
                            className="transition-all duration-500"
                          />
                        </svg>
                        {}
                        <div className="absolute inset-0 m-1 rounded-full flex items-center justify-center flex-col transition-colors"
                          style={{ backgroundColor: day.isToday ? 'rgba(155,125,67,0.15)' : 'transparent' }}>
                          <span className="text-[10px] font-bold" style={{ color: day.isToday ? '#9B7D43' : '#5A5550' }}>
                            {day.date}
                          </span>
                        </div>
                        {isCompleted && (
                          <div className="absolute -right-1 -top-1 bg-green-500 rounded-full p-0.5 shadow-lg border border-white">
                            <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                      <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: day.isToday ? '#9B7D43' : '#9A8A7A' }}>
                        {day.dayName}
                      </span>
                    </div>
                  );
                })}
              </div>
                <button 
                  onClick={() => setWeekOffset(prev => prev + 1)} 
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full p-2 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-110" style={{ backgroundColor: '#FAF7F2', border: '1px solid #D4B896' }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#1C1A17' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
            {}
            <div className="w-full lg:w-64 rounded-xl p-3 flex flex-col relative group" style={{ backgroundColor: '#F0E8DC', border: '1px solid #D4B896' }}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold" style={{ color: '#1C1A17' }}>
                  {calendarDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </h3>
                <div className="flex gap-1.5 text-[9px]" style={{ color: '#9A8A7A' }}>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#E8DDD0' }}></div>
                    <span>0</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#D4B896' }}></div>
                    <span>&gt;0</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                    <span>Goal</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center mb-1">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <div key={i} className="text-[9px] font-bold" style={{ color: '#9A8A7A' }}>{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 flex-1 content-start">
                {(() => {
                  const year = calendarDate.getFullYear();
                  const month = calendarDate.getMonth();
                  const daysInMonth = new Date(year, month + 1, 0).getDate();
                  const firstDay = new Date(year, month, 1).getDay();
                  const actualToday = new Date();
                  const days = [];
                  for (let i = 0; i < firstDay; i++) {
                    days.push(<div key={`empty-${i}`} className="aspect-square"></div>);
                  }
                  for (let i = 1; i <= daysInMonth; i++) {
                    const currentDate = new Date(year, month, i);
                    const dateStr = getLocalDateString(currentDate);
                    const count = dailyProgressMap[dateStr] || 0;
                    let bgClass = 'text-[#9A8A7A]';
                    let bgStyle = { backgroundColor: '#E8DDD0' };
                    if (count >= dailyTarget) {
                      bgClass = 'text-white shadow-md';
                      bgStyle = { backgroundColor: '#9B7D43' };
                    } else if (count > 0) {
                      bgClass = 'text-[#6B4F2A]';
                      bgStyle = { backgroundColor: '#D4B896' };
                    }
                    const isToday = i === actualToday.getDate() && month === actualToday.getMonth() && year === actualToday.getFullYear();
                    days.push(
                      <div 
                        key={i} 
                        className={`aspect-square rounded-md flex items-center justify-center text-[10px] font-medium transition-all hover:scale-110 cursor-default ${bgClass} ${isToday ? 'ring-2 ring-[#9B7D43] ring-offset-1 ring-offset-[#F0E8DC] z-10' : ''}`}
                        style={bgStyle}
                        title={`${count} topics completed`}
                      >
                        {i}
                      </div>
                    );
                  }
                  return days;
                })()}
              </div>
              <button 
                onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))} 
                className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 rounded-full p-1.5 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-110" style={{ backgroundColor: '#FAF7F2', border: '1px solid #D4B896' }}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#1C1A17' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button
                onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))}
                className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 rounded-full p-1.5 shadow-sm hover:shadow-md transition-all duration-200 hover:scale-110" style={{ backgroundColor: '#FAF7F2', border: '1px solid #D4B896' }}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#1C1A17' }}><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            </div>
          </div>
        </div>
        {modules.length === 0 ? (
          <div className="rounded-xl shadow-md p-12 text-center" style={{ backgroundColor: '#FAF7F2', border: '1px solid #E0D8CC' }}>
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-lg font-semibold" style={{ color: '#1C1A17' }}>No modules available</p>
            <p className="text-sm mt-2" style={{ color: '#5A5550' }}>Modules will appear here once they are added by the admin</p>
          </div>
        ) : (
          <>
            {}
            <div className="flex flex-col lg:flex-row gap-6 items-stretch justify-center mb-8">
              {}
              <div className="flex-shrink-0 w-full lg:w-[700px]">
            {}
            <div className="flex-1 relative w-full">
            {}
            <button
              onClick={goToPrevious}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 rounded-full p-3 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110" style={{ backgroundColor: '#FAF7F2', border: '2px solid #D4B896' }}
              aria-label="Previous module"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#1C1A17' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 rounded-full p-3 shadow-md hover:shadow-lg transition-all duration-200 hover:scale-110" style={{ backgroundColor: '#FAF7F2', border: '2px solid #D4B896' }}
              aria-label="Next module"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#1C1A17' }}>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            {}
            <div
              ref={sliderRef}
              className="overflow-x-auto overflow-y-hidden rounded-2xl"
              style={{
                scrollSnapType: 'x mandatory',
                scrollBehavior: 'smooth',
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              <div className="flex" style={{ width: `${modules.length * 100}%` }}>
                {modules.map((module, index) => {
                  const color = getModuleColor(index);
                  const completedTopics = module.topics?.filter(t => t.completed).length || 0;
                  const totalTopics = module.topics?.length || 0;
                  const progressPercentage = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;
                  const isModuleLocked = index >= 3 && !isAuthenticated;
                  return (
                    <div
                      key={module._id}
                      className="flex-shrink-0"
                      style={{
                        width: `${100 / modules.length}%`,
                        minWidth: `${100 / modules.length}%`,
                        scrollSnapAlign: 'start',
                        scrollSnapStop: 'always',
                        padding: '0 1rem'
                      }}
                    >
                      <div 
                        id={`module-container-${index}`}
                        className={`rounded-2xl shadow-lg p-6 border-2 flex flex-col relative`}
                        style={{ backgroundColor: '#FAF7F2', borderColor: isModuleLocked ? '#C07A3A' : '#E0D8CC', height: '800px' }}
                      >
                        {}
                        {isModuleLocked && (
                          <div className="absolute inset-0 backdrop-blur-sm rounded-2xl z-10 flex flex-col items-center justify-center p-6" style={{ backgroundColor: 'rgba(245,240,232,0.85)' }}>
                            <svg className="w-20 h-20 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#C07A3A' }}>
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            <h4 className="text-2xl font-bold mb-2 text-center" style={{ color: '#1C1A17', fontFamily: "'Playfair Display', Georgia, serif" }}>Module Locked</h4>
                            <p className="text-center mb-6 max-w-md" style={{ color: '#5A5550' }}>
                              Please sign up or log in to access Module {index + 1} and track your progress
                            </p>
                            <div className="flex gap-3">
                              <button onClick={() => navigate('/login')} className="px-6 py-3 text-white rounded-lg transition-colors font-semibold" style={{ backgroundColor: '#1C1A17' }}>Log In</button>
                              <button onClick={() => navigate('/signup')} className="px-6 py-3 rounded-lg transition-colors font-semibold" style={{ backgroundColor: 'transparent', color: '#1C1A17', border: '2px solid #D4B896' }}>Sign Up</button>
                            </div>
                          </div>
                        )}
                        {}
                        <div className="mb-6 flex-shrink-0">
                          <div
                            className="rounded-xl p-4 shadow-sm relative overflow-hidden group transition-colors duration-300"
                            style={{ backgroundColor: '#F0E8DC', border: '1px solid #D4B896' }}
                          >
                            <h3 className="text-xl font-bold text-center relative z-10" style={{ color: '#1C1A17', fontFamily: "'Playfair Display', Georgia, serif" }}>
                              <span style={{ color: '#9B7D43' }}>Module {index + 1} :</span> {module.title.replace(/^Module\s+\d+\s*[:\s-]+\s*/i, '')}
                            </h3>
                            {module.category && (
                              <p className="text-xs text-center mt-1 relative z-10 uppercase tracking-wider font-semibold" style={{ color: '#9A8A7A' }}>
                                {module.category}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 flex flex-col min-h-0">
                              <div className="mb-4 flex-shrink-0">
                                <div className="flex items-center justify-between text-sm mb-3" style={{ color: '#5A5550' }}>
                                  <span className="font-semibold">Topics Progress</span>
                                  <span className="font-bold">{completedTopics} / {totalTopics} topics</span>
                                </div>
                                <div className="w-full rounded-full h-3 overflow-hidden" style={{ backgroundColor: '#E0D8CC' }}>
                                  <div
                                    className="rounded-full h-3 transition-all duration-500 flex items-center justify-end pr-1.5"
                                    style={{ background: 'linear-gradient(90deg, #9B7D43, #C9A96E)', width: `${progressPercentage}%` }}
                                  >
                                    {progressPercentage > 15 && (
                                      <span className="text-[10px] font-bold text-white">{Math.round(progressPercentage)}%</span>
                                    )}
                                  </div>
                                </div>
                              </div>
                              {}
                              <div className="relative bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 border-2 border-amber-400 rounded-lg p-2.5 mb-4 flex items-center gap-2 flex-shrink-0 shadow-xl instruction-box">
                                <p className="text-amber-800 font-bold text-sm tracking-wide flex-1">
                                  ✓ Tick each topic once you learning it thouroughly. Attend quiz to test your knowledge.
                                </p>
                              </div>
                          {module.topics && module.topics.length > 0 ? (
                            (() => {
                                const regularTopics = [...module.topics]
                                  .filter(topic => !topic.isPracticalProblem)
                                  .sort((a, b) => (a.order || 0) - (b.order || 0));
                                const practicalProblems = [...module.topics]
                                  .filter(topic => topic.isPracticalProblem)
                                  .sort((a, b) => (a.order || 0) - (b.order || 0));

                                return (
                                  <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                                    {/* Regular Topics Section */}
                                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3">
                                      {regularTopics.map((topic, topicIndex) => {
                                        const uniqueAttemptedQuizzes = new Set(
                                          (userProgress?.attemptedQuizzes || [])
                                            .filter(a => String(a.topicId) === String(topic._id))
                                            .map(a => String(a.quizId))
                                        );
                                        const isQuizCompleted = topic.quizCount > 0 && uniqueAttemptedQuizzes.size >= topic.quizCount;

                                        return (
                                          <div
                                            key={topic._id || topicIndex}
                                            className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-200 border group`}
                                          style={{
                                            backgroundColor: topic.completed ? '#EFF8EF' : isQuizCompleted ? '#F0ECFA' : '#F5F0E8',
                                            borderColor: topic.completed ? '#86efac' : isQuizCompleted ? '#C4B5FD' : '#D4B896'
                                          }}
                                          >
                                            <button
                                              onClick={() => handleToggleTopic(module._id, topic._id, topic.completed, index)}
                                              className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                                                topic.completed
                                                  ? 'bg-green-500 hover:bg-green-600 shadow-lg'
                                                  : ''
                                              }`}
                                            style={!topic.completed ? { backgroundColor: '#FAF7F2', border: '1.5px solid #D4B896' } : {}}
                                              title={topic.completed ? 'Mark as incomplete' : 'Mark as complete'}
                                            >
                                              {topic.completed ? (
                                                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                </svg>
                                              ) : (
                                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#C9A96E' }}>
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                              )}
                                            </button>
                                            <span
                                              className="flex-1 text-sm font-medium"
                                              style={{ color: topic.completed ? '#9A8A7A' : '#1C1A17', textDecoration: topic.completed ? 'line-through' : 'none' }}
                                            >
                                              {topic.name}
                                            </span>
                                            {(topic.hasQuiz || topic.quizzes?.length > 0 || topic.quiz?.question) && (
                                              <button
                                                onClick={async (e) => {
                                                  if (!topic.completed || loadingQuizTopicId === topic._id) return;
                                                  e.stopPropagation();
                                                  if (!topic.quizzes || topic.quizzes.length === 0) {
                                                      setLoadingQuizTopicId(topic._id);
                                                      try {
                                                          const res = await moduleAPI.getTopicQuizzes(module._id, topic._id);
                                                          if (res.success) {
                                                              const quizzes = res.data;
                                                              setSelectedQuiz({
                                                                quizzes: quizzes,
                                                                moduleId: module._id,
                                                                topicId: topic._id,
                                                                topicName: topic.name
                                                              });
                                                              setSelectedQuizTopicName(topic.name);
                                                          }
                                                      } catch (err) {
                                                          console.error("Failed to load quiz", err);
                                                          alert("Failed to load quiz. Please try again.");
                                                      } finally {
                                                          setLoadingQuizTopicId(null);
                                                      }
                                                  } else {
                                                      setSelectedQuiz({
                                                        quizzes: topic.quizzes || (topic.quiz ? [topic.quiz] : []),
                                                        moduleId: module._id,
                                                        topicId: topic._id,
                                                        topicName: topic.name
                                                      });
                                                      setSelectedQuizTopicName(topic.name);
                                                  }
                                                }}
                                                disabled={!topic.completed || loadingQuizTopicId === topic._id}
                                                className="ml-2 px-2 py-1 text-xs font-semibold rounded-md transition-colors"
                                                style={isQuizCompleted
                                                  ? { backgroundColor: '#22c55e', color: '#fff' }
                                                  : topic.completed
                                                    ? { backgroundColor: '#9B7D43', color: '#FAF7F2' }
                                                    : { backgroundColor: '#E0D8CC', color: '#9A8A7A', opacity: 0.7, cursor: 'not-allowed' }
                                                }
                                                title={isQuizCompleted ? "All questions attempted" : (topic.completed ? "Take a quiz on this topic" : "Complete the topic to unlock quiz")}
                                              >
                                                {loadingQuizTopicId === topic._id ? (
                                                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                  </svg>
                                                ) : (
                                                  'Start Quiz'
                                                )}
                                              </button>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>

                                    {/* LeetCode Problems Section - Moved to Bottom */}
                                    {practicalProblems.length > 0 && (
                                      <div className="mt-3 flex-shrink-0 rounded-xl p-3 shadow-inner" style={{ backgroundColor: '#F0E8DC', border: '1px solid #D4B896' }}>
                                        <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-2 mb-3 px-1">
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                                          </svg>
                                          LeetCode Problems
                                        </h4>
                                        <div className="space-y-2 max-h-[120px] overflow-y-auto custom-scrollbar pr-1">
                                          {practicalProblems.map((topic, topicIndex) => (
                                            <div
                                              key={topic._id || `pp-${topicIndex}`}
                                              className="flex items-center gap-3 p-2 rounded-lg transition-all duration-200 border"
                                            style={{
                                              backgroundColor: topic.completed ? '#EFF8EF' : '#FAF7F2',
                                              borderColor: topic.completed ? '#86efac' : '#D4B896'
                                            }}
                                            >
                                              <button
                                                onClick={() => handleToggleTopic(module._id, topic._id, topic.completed, index)}
                                                className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center transition-all duration-200"
                                                style={topic.completed
                                                  ? { backgroundColor: '#C9A96E' }
                                                  : { border: '1.5px solid #D4B896', backgroundColor: 'transparent' }
                                                }
                                                title={topic.completed ? 'Mark as incomplete' : 'Mark as complete'}
                                              >
                                                {topic.completed && (
                                                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                  </svg>
                                                )}
                                              </button>
                                              
                                              <div className="flex-1 min-w-0 flex items-center justify-between gap-2">
                                                <span className="text-sm font-medium truncate" style={{ color: topic.completed ? '#9A8A7A' : '#1C1A17', textDecoration: topic.completed ? 'line-through' : 'none' }}>
                                                  {topic.name}
                                                </span>

                                                {topic.problemUrl && (
                                                  <a
                                                    href={topic.problemUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all"
                                                    style={topic.completed
                                                      ? { backgroundColor: '#E0D8CC', color: '#9A8A7A' }
                                                      : { backgroundColor: 'rgba(201,169,110,0.15)', color: '#9B7D43', border: '1px solid rgba(201,169,110,0.5)' }
                                                    }
                                                    title="Open problem in new tab"
                                                  >
                                                    <span>Solve</span>
                                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                    </svg>
                                                  </a>
                                                )}
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              })()
                          ) : (
                            <div className="text-center py-8" style={{ color: '#9A8A7A' }}>
                              <p>No topics available for this module</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            </div>
            </div>
              {}
              <div className="flex-shrink-0 w-full lg:w-[400px] lg:sticky lg:top-32">
                <div className="rounded-2xl shadow-xl p-6 flex flex-col" style={{ height: '800px', backgroundColor: '#FAF7F2', border: '2px solid #E0D8CC' }}>
                  <h3 className="text-lg font-bold mb-4 text-center" style={{ color: '#1C1A17', fontFamily: "'Playfair Display', Georgia, serif" }}>Module Progress</h3>
                  <div className="flex flex-col items-center justify-center flex-1">
                    <PieChart
                      percentage={overallProgress.percentage}
                      size={200}
                      strokeWidth={20}
                      color="#9B7D43"
                      backgroundColor="#E0D8CC"
                      showPercentage={true}
                    >
                      <span className="text-sm mt-2 font-medium text-center" style={{ color: '#5A5550' }}>
                        {overallProgress.completedModules} / {overallProgress.totalModules} Modules
                      </span>
                    </PieChart>
                    <p className="text-xs mt-4 text-center max-w-[200px]" style={{ color: '#9A8A7A' }}>
                      Complete all topics in a module to mark it as finished
                    </p>
                    {}
                    <div className="mt-4 pt-4 w-full" style={{ borderTop: '1px solid #E0D8CC' }}>
                      <div className="text-center">
                        <p className="text-sm mb-1" style={{ color: '#9A8A7A' }}>Total Topics Completed</p>
                        <p className="text-2xl font-bold" style={{ color: '#9B7D43' }}>
                          {modules.reduce((total, module) => {
                            return total + (module.topics?.filter(t => t.completed).length || 0);
                          }, 0)}
                          <span className="text-lg" style={{ color: '#9A8A7A' }}> / </span>
                          {modules.reduce((total, module) => {
                            return total + (module.topics?.length || 0);
                          }, 0)}
                        </p>
                        <p className="text-xs mt-1" style={{ color: '#9A8A7A' }}>topics in all modules</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        {}
        {modules.length > 0 && (<>
          <div className="mt-8">
            {}
            {}
            <div className="flex flex-wrap items-center justify-center gap-1.5 w-full px-2">
              {modules.map((module, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className="flex-shrink-0 transition-all duration-300 rounded-full flex items-center justify-center font-bold text-[10px] w-7 h-7"
                  style={index === currentIndex
                    ? { backgroundColor: '#9B7D43', color: '#FAF7F2', boxShadow: '0 2px 8px rgba(155,125,67,0.4)', border: '1px solid #C9A96E' }
                    : { backgroundColor: '#FAF7F2', color: '#5A5550', border: '1px solid #D4B896' }
                  }
                  aria-label={`Go to module ${index + 1}`}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            {}
            <div className="text-center mt-4 font-semibold" style={{ color: '#5A5550' }}>
              <span>Module {currentIndex + 1} of {modules.length}</span>
            </div>
          </div>
          {}
          <div className="max-w-4xl mx-auto mt-12 mb-8 px-4">
            <div className="rounded-xl p-4" style={{ backgroundColor: '#FAF7F2', border: '1px solid #E0D8CC' }}>
               <div className="flex flex-col md:flex-row items-center gap-4 justify-between">
                  <div className="flex items-center gap-2 font-medium whitespace-nowrap" style={{ color: '#5A5550' }}>
                     <span className="text-lg">💬</span>
                     <span>Let us know feedback and missing topics to add</span>
                  </div>
                  {feedbackSuccess ? (
                     <div className="flex-1 text-center text-green-600 text-sm font-semibold animate-in fade-in">
                        Thank you! Feedback received. ✅
                     </div>
                  ) : (
                     <div className="flex-1 w-full flex items-center gap-3">
                        <input
                           type="text"
                           value={feedbackText}
                           onChange={(e) => setFeedbackText(e.target.value)}
                           placeholder="Share your thoughts..."
                           className="flex-1 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9B7D43] transition-colors placeholder-[#9A8A7A]"
                           style={{ backgroundColor: '#F0E8DC', border: '1px solid #D4B896', color: '#1C1A17' }}
                           disabled={isSubmittingFeedback}
                           onKeyDown={(e) => e.key === 'Enter' && handleFeedbackSubmit()}
                        />
                        <button
                           onClick={handleFeedbackSubmit}
                           disabled={!feedbackText.trim() || isSubmittingFeedback}
                           className="px-6 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                           style={{ backgroundColor: '#9B7D43', color: '#FAF7F2' }}
                        >
                           {isSubmittingFeedback ? '...' : 'Submit'}
                        </button>
                     </div>
                  )}
               </div>
            </div>
          </div>
        </>)}
      </div>
      <style>{`
        /* Hide scrollbar for slider */
        .overflow-x-auto::-webkit-scrollbar {
          display: none;
        }
        .overflow-x-auto {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        /* Custom scrollbar for topics container */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #E0D8CC;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #9B7D43;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #7A6030;
        }
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #9B7D43 #E0D8CC;
        }
      `}</style>
      <BadgeModal 
        badge={newBadgeDetails} 
        isOpen={showBadgeModal} 
        onClose={() => setShowBadgeModal(false)} 
        userName={user?.name}
      />
      {}
      {showDailyLimitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="rounded-2xl p-8 max-w-md w-full shadow-2xl transform scale-100 animate-in zoom-in-95 duration-200 relative overflow-hidden" style={{ backgroundColor: '#FAF7F2', border: '1px solid #E0D8CC' }}>
            {}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-gradient-to-br from-orange-400 to-red-500 opacity-10 blur-3xl rounded-full"></div>
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6 bg-gradient-to-br from-orange-400 to-red-500 shadow-lg shadow-orange-500/50">
                <span className="text-4xl filter drop-shadow-md">⏸️</span>
              </div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: '#1C1A17', fontFamily: "'Playfair Display', Georgia, serif" }}>Daily Limit Reached!</h3>
              <div className="mb-6 space-y-3 text-left w-full" style={{ color: '#5A5550' }}>
                {dailyLimitMessage.split('\n\n').map((para, idx) => (
                  <p key={idx} className="leading-relaxed">{para}</p>
                ))}
              </div>
              <button
                onClick={() => setShowDailyLimitModal(false)}
                className="w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold hover:from-orange-600 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105"
              >
                Got it! 💪
              </button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        /* Quiz Animation */
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
      {}
      {selectedQuiz && (
        <TopicQuizModal
          isOpen={!!selectedQuiz}
          onClose={() => {
            setSelectedQuiz(null);
            setSelectedQuizTopicName('');
            window.dispatchEvent(new Event('user-progress-updated'));
          }}
          quizzes={selectedQuiz.quizzes}
          moduleId={selectedQuiz.moduleId}
          topicId={selectedQuiz.topicId}
          topicTitle={selectedQuiz.topicName}
          userAttempts={userProgress?.attemptedQuizzes || []}
          onBadgeEarned={(badge) => {
            setNewBadgeDetails(badge);
            setShowBadgeModal(true);
            confetti({
                particleCount: 200,
                spread: 100,
                origin: { y: 0.6 },
                colors: ['#FFD700', '#C0C0C0', '#E5E4E2']
            });
          }}
          onPointsUpdate={(points) => {
            setUserPoints(prev => prev + points);
          }}
          onQuizAttempt={(attemptData) => {
            setUserProgress(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    attemptedQuizzes: [...(prev.attemptedQuizzes || []), attemptData]
                };
            });
          }}
        />
      )}
    </div>
  );
};
const BadgeModal = ({ badge, isOpen, onClose, userName }) => {
  if (!isOpen || !badge) return null;

  /* handleShare removed */

  const getBadgeDetails = (badgeName) => {
    const commonNextGoal = "Earn 100 points for next badge";
    const highlightedName = (
      <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">
        {userName || 'Learner'}
      </span>
    );

    switch (badgeName) {
      case 'Bronze':
        return {
          emoji: '🥉',
          title: 'Bronze Badge Unlocked!',
          message: <>Congratulations {highlightedName}! You've earned the Bronze Badge!</>,
          nextGoal: commonNextGoal,
          color: 'from-orange-200 via-orange-400 to-orange-800',
          shadow: 'shadow-orange-500/50'
        };
      case 'Silver':
        return {
          emoji: '🥈',
          title: 'Silver Badge Unlocked!',
          message: <>Amazing {highlightedName}! You've earned the Silver Badge!</>,
          nextGoal: commonNextGoal,
          color: 'from-slate-100 via-slate-300 to-slate-500',
          shadow: 'shadow-slate-500/50'
        };
      case 'Gold':
        return {
          emoji: '🥇',
          title: 'Gold Badge Unlocked!',
          message: <>Incredible {highlightedName}! You've earned the Gold Badge!</>,
          nextGoal: commonNextGoal,
          color: 'from-yellow-100 via-yellow-300 to-yellow-600',
          shadow: 'shadow-yellow-500/50'
        };
      case 'Platinum':
        return {
          emoji: '💎',
          title: 'Platinum Badge Unlocked!',
          message: <>Legendary {highlightedName}! You've earned the Platinum Badge!</>,
          nextGoal: commonNextGoal,
          color: 'from-slate-300 via-cyan-200 to-blue-300',
          shadow: 'shadow-cyan-500/50'
        };
      default:
        // Handle generic "Level X Badge"
        if (badgeName && badgeName.startsWith('Level')) {
            return {
                emoji: '🎖️',
                title: `${badgeName} Unlocked!`,
                message: <>Congratulations {highlightedName}! You've unlocked {badgeName}!</>,
                nextGoal: commonNextGoal,
                color: 'from-blue-400 via-indigo-500 to-purple-600',
                shadow: 'shadow-indigo-500/50'
            };
        }
        return null;
    }
  };

  const details = getBadgeDetails(badge);

  if (!details) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="rounded-2xl p-8 max-w-sm w-full shadow-2xl transform scale-100 animate-in zoom-in-95 duration-200 relative overflow-hidden" style={{ backgroundColor: '#FAF7F2', border: '1px solid #E0D8CC' }}>
        {/* Background Glow */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-32 h-32 bg-gradient-to-br ${details.color} opacity-10 blur-3xl rounded-full`}></div>

        <div className="relative z-10 flex flex-col items-center text-center">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-6 bg-gradient-to-br ${details.color} shadow-lg ${details.shadow} animate-bounce-slow`}>
            <span className="text-5xl filter drop-shadow-md">{details.emoji}</span>
          </div>

          <h3 className="text-2xl font-bold mb-2" style={{ color: '#1C1A17', fontFamily: "'Playfair Display', Georgia, serif" }}>{details.title}</h3>
          <p className="mb-6" style={{ color: '#5A5550' }}>{details.message}</p>

          <div className="rounded-xl p-4 w-full mb-4" style={{ backgroundColor: '#F0E8DC', border: '1px solid #D4B896' }}>
            <p className="text-xs uppercase tracking-wider font-bold mb-1" style={{ color: '#9A8A7A' }}>Next Goal</p>
            <p className="font-medium" style={{ color: '#9B7D43' }}>{details.nextGoal}</p>
          </div>

          <div className="text-center mb-6">
             <p className="text-sm italic" style={{ color: '#9A8A7A' }}>
               Take a screenshot and share on LinkedIn for share your achivement with your connections
             </p>
          </div>

          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-3 rounded-xl font-bold transition-all duration-200"
              style={{ backgroundColor: '#F0E8DC', color: '#1C1A17', border: '1px solid #D4B896' }}
            >
              Close
            </button>
            <button
               onClick={() => {
                 const text = "Excited to share a small win today! 🎉🏅\nTest your skills and challenge yourself here 👉 www.fullstacksolutions.in/tick2test";
                 window.open(`https://www.linkedin.com/feed/?shareActive=true&text=${encodeURIComponent(text)}`, '_blank');
               }}
               className="flex-1 px-4 py-3 bg-[#0077b5] hover:bg-[#006097] text-white rounded-xl font-bold shadow-lg transition-all duration-200 flex items-center justify-center gap-2"
            >
               <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                 <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
               </svg>
               LinkedIn
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LearningTracker;
