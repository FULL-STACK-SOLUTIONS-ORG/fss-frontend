import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FaUser, FaSignOutAlt, FaChartLine, FaChevronDown, FaPhone, FaArrowRight, FaStar, FaTasks } from 'react-icons/fa';
import AnimatedCoin from './AnimatedCoin';
import EnquiryForm from './EnquiryForm';
import logo from '../../assets/logo.png';
import { progressAPI } from '../../services/api';
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showEnquiryForm, setShowEnquiryForm] = useState(false);
  const [hasUserClickedEnquiry, setHasUserClickedEnquiry] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userRank, setUserRank] = useState(null);
  const [pointsToNextRank, setPointsToNextRank] = useState(0);
  const userMenuRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, logout } = useAuth();
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  useEffect(() => {
    const sessionEnquiryShown = sessionStorage.getItem('enquiryFormAutoShown');
    const timer = setTimeout(() => {
      if (!isAuthenticated && !hasUserClickedEnquiry && !showEnquiryForm && !sessionEnquiryShown) {
        setShowEnquiryForm(true);
        sessionStorage.setItem('enquiryFormAutoShown', 'true');
      }
    }, 60000);
    return () => clearTimeout(timer);
  }, [hasUserClickedEnquiry, showEnquiryForm, isAuthenticated]);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);
  useEffect(() => {
    const fetchRanking = async () => {
      if (isAuthenticated) {
        try {
          const response = await progressAPI.getUserRanking();
          if (response.success) {
            setUserRank(response.ranking.rank);
            setPointsToNextRank(response.ranking.pointsToNextRank || 0);
          }
        } catch (error) {
          console.error('Failed to fetch ranking:', error);
        }
      }
    };
    
    fetchRanking();
    window.addEventListener('user-progress-updated', fetchRanking);
    return () => window.removeEventListener('user-progress-updated', fetchRanking);
  }, [isAuthenticated]);
  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Mentorship Program', href: '/mentorship' },
    { name: 'Roadmap', href: '/roadmap' },
    { name: 'Tick2Test', href: '/tick2test' }
  ];
  const handleHomeClick = (e) => {
    e.preventDefault();
    setIsOpen(false);
    if (location.pathname === '/') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 100);
    }
  };
  const handleSmoothScroll = (e, href) => {
    e.preventDefault();
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        setIsOpen(false);
      }
    } else {
      setIsOpen(false);
    }
  };
  const handleEnquiryClick = () => {
    setHasUserClickedEnquiry(true);
    setShowEnquiryForm(true);
    setIsOpen(false);
    localStorage.setItem('enquiryFormShown', 'true');
  };
  const handleCloseEnquiry = () => {
    setShowEnquiryForm(false);
  };
  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    navigate('/');
  };
  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-gradient-to-b from-teal-950/95 via-teal-900/95 to-teal-950/95 backdrop-blur-md shadow-lg border-b border-teal-800/30'
          : 'bg-gradient-to-b from-teal-950/90 via-teal-900/90 to-teal-950/90 backdrop-blur-sm'
      }`}
    >
      <div className="relative z-10 w-full px-2 sm:px-3 lg:px-4 mx-auto">
        <div className="flex items-center justify-between h-16 lg:h-18 flex-nowrap">
          <div className="flex-shrink-0">
            <a href="/" onClick={(e) => { e.preventDefault(); handleHomeClick(e); }} className="group flex items-center space-x-3">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-teal-400 via-emerald-300 to-teal-400 rounded-full opacity-0 group-hover:opacity-100 blur-md transition-all duration-300"></div>
                <img
                  src={logo}
                  alt="Full Stack Solutions Logo"
                  className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover transition-all duration-300 group-hover:scale-110 border-2 border-white shadow-lg"
                />
              </div>
              <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-teal-100 via-emerald-200 to-teal-100 bg-clip-text text-transparent hidden sm:block transition-all duration-300 group-hover:from-white group-hover:to-teal-200 whitespace-nowrap">
                Full Stack Solutions
              </span>
            </a>
          </div>
          <div className="hidden lg:block flex-shrink-0">
            <div className="ml-4 flex items-center space-x-1 flex-nowrap">
              {navLinks.map((link) => {
                const linkClassName = "group relative px-5 py-3 rounded-xl !text-2xl font-semibold text-slate-200 hover:text-white transition-all duration-300 hover:bg-gradient-to-r hover:from-slate-800 hover:to-slate-700 whitespace-nowrap flex items-center leading-tight";
                if (link.name === 'Home') {
                  return (
                    <a
                      key={link.name}
                      href={link.href}
                      onClick={handleHomeClick}
                      className={linkClassName}
                    >
                      <span className="relative z-10">{link.name}</span>
                      <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-gray-400 to-gray-300 rounded-full group-hover:w-3/4 transition-all duration-300"></span>
                    </a>
                  );
                }
                const isTick2Test = link.name === 'Tick2Test';
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={() => setIsOpen(false)}
                    className={linkClassName}
                  >
                    <span className={`relative z-10 ${isTick2Test ? 'bg-gradient-to-r from-yellow-400 via-white to-yellow-400 bg-clip-text text-transparent animate-shine font-bold' : ''}`}>
                      {link.name}
                    </span>
                    <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-gray-400 to-gray-300 rounded-full group-hover:w-3/4 transition-all duration-300"></span>
                  </Link>
                );
              })}
              {}
              <div className="ml-2 px-4 py-2 rounded-xl border-2 border-teal-500/30 bg-teal-500/10 backdrop-blur-sm flex items-center gap-2 group hover:bg-teal-500/20 transition-all duration-300">
                <FaPhone className="text-teal-400 text-sm group-hover:scale-110 transition-transform duration-300" />
                <span className="text-teal-100 font-semibold text-lg tracking-wide">+91 8848118585</span>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-1 flex-shrink-0 flex-nowrap -ml-4">
            <button
              onClick={handleEnquiryClick}
              className="group relative px-5 py-3 rounded-xl !text-2xl font-semibold text-slate-200 hover:text-white transition-all duration-300 border-2 border-green-500 hover:border-green-400 whitespace-nowrap flex items-center leading-tight"
            >
              <span className="relative z-10">Enquiry</span>
            </button>
            <a
              href="https://chat.whatsapp.com/your-community-link"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative px-5 py-3 rounded-xl !text-2xl font-semibold text-slate-200 hover:text-white transition-all duration-300 border-2 border-green-500 hover:border-green-400 whitespace-nowrap flex items-center leading-tight"
            >
              <span className="relative z-10">Community</span>
            </a>
            {}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="group relative px-5 py-3 rounded-xl !text-2xl font-semibold text-slate-200 hover:text-white transition-all duration-300 border-2 border-slate-600 hover:border-teal-400 whitespace-nowrap flex items-center leading-tight gap-2"
                >
                  <FaUser className="text-xl" />
                  <span className="relative z-10">{user?.name?.split(' ')[0]}</span>
                  {userRank && (
                    <div className="flex items-center gap-2">
                      <span className="ml-1 px-2 py-0.5 text-sm font-bold bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-slate-900 rounded-full shadow-lg border border-yellow-300">
                        #{userRank}
                      </span>
                      {pointsToNextRank > 0 && userRank > 1 && (
                        <span className="hidden xl:flex items-center gap-1 text-[10px] text-slate-400 font-bold opacity-80 ml-2" title={`${pointsToNextRank} points needed to reach rank #${userRank - 1}`}>
                          <span>{pointsToNextRank}</span>
                          <AnimatedCoin 
                            className="w-2 h-2" 
                            textSize="text-[4px]" 
                          />
                          <FaArrowRight className="text-[8px] text-slate-400 mx-0.5" />
                          <span>#{userRank - 1}</span>
                        </span>
                      )}
                    </div>
                  )}
                  <FaChevronDown className={`text-sm transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>
                {}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-xl shadow-xl border border-slate-700 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-200">
                    {user?.isDashboardApproved && (
                      <Link
                        to="/dashboard"
                        state={{ view: 'profile' }}
                        onClick={() => setShowUserMenu(false)}
                        className="w-full px-4 py-3 text-left text-slate-300 hover:text-white hover:bg-slate-700 transition-colors flex items-center gap-2"
                      >
                        <FaUser />
                        <span>My Profile</span>
                      </Link>
                    )}
                    {user?.isDashboardApproved && (
                      <Link
                        to="/dashboard"
                        state={{ view: 'tasks' }}
                        onClick={() => setShowUserMenu(false)}
                        className="w-full px-4 py-3 text-left text-slate-300 hover:text-white hover:bg-slate-700 transition-colors flex items-center gap-2"
                      >
                        <FaTasks />
                        <span>Tasks</span>
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-left text-slate-300 hover:text-white hover:bg-slate-700 transition-colors flex items-center gap-2"
                    >
                      <FaSignOutAlt />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="group relative px-5 py-3 rounded-xl !text-2xl font-semibold text-slate-200 hover:text-white transition-all duration-300 border-2 border-slate-600 hover:border-teal-400 whitespace-nowrap flex items-center leading-tight"
                >
                  <span className="relative z-10">Login</span>
                </Link>
                <Link
                  to="/signup"
                  className="group relative px-5 py-3 rounded-xl !text-2xl font-semibold text-slate-200 hover:text-white transition-all duration-300 border-2 border-slate-600 hover:border-teal-400 whitespace-nowrap flex items-center leading-tight"
                >
                  <span className="relative z-10">Sign Up</span>
                </Link>
              </>
            )}
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-slate-200 hover:text-teal-400 hover:bg-slate-800/50 transition-all duration-300"
              aria-label="Toggle menu"
            >
              <svg
                className={`w-6 h-6 transform transition-all duration-300 ${
                  isOpen ? 'rotate-90 scale-110' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      {isOpen && (
        <div className="md:hidden relative z-10 bg-gradient-to-b from-blue-100/95 via-blue-200/95 to-blue-100/95 dark:from-slate-900/95 dark:via-slate-900/95 dark:to-slate-900/95 backdrop-blur-md border-t border-blue-300/30 dark:border-slate-700/30 shadow-xl">
          <div className="px-4 pt-4 pb-6 space-y-2 animate-in slide-in-from-top duration-300">
            {navLinks.map((link, index) => {
              const linkClassName = "block px-4 py-3 rounded-xl text-base font-semibold text-slate-200 hover:text-white transition-all duration-300 hover:bg-gradient-to-r hover:from-slate-700 hover:to-slate-900 transform hover:translate-x-2 hover:scale-105 shadow-black-sm hover:shadow-black-md";
              if (link.name === 'Home') {
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={handleHomeClick}
                    className={linkClassName}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {link.name}
                  </a>
                );
              }
              const isTick2Test = link.name === 'Tick2Test';
              return (
                <Link
                  key={link.name}
                  to={link.href}
                  onClick={() => setIsOpen(false)}
                  className={linkClassName}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <span className={`${isTick2Test ? 'bg-gradient-to-r from-yellow-400 via-white to-yellow-400 bg-clip-text text-transparent animate-shine font-bold' : ''}`}>
                    {link.name}
                  </span>
                </Link>
              );
            })}
            {}
            <div className="mx-4 mt-2 px-4 py-3 rounded-xl border border-teal-500/30 bg-teal-500/10 flex items-center justify-center gap-3">
              <FaPhone className="text-teal-400" />
              <span className="text-teal-100 font-semibold text-lg tracking-wide">+91 8848118585</span>
            </div>
            <div className="border-t border-gray-200/50 dark:border-slate-700/50 pt-4 mt-4 space-y-2">
              <button
                onClick={handleEnquiryClick}
                className="w-full bg-gradient-to-r from-teal-500 via-teal-600 to-green-500 text-white px-4 py-3 rounded-xl text-base font-semibold hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:scale-105"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <span>Enquiry Form</span>
              </button>
              {}
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-3 bg-slate-800/50 rounded-xl">
                    <p className="text-xs text-slate-400">Signed in as</p>
                    <p className="text-sm font-medium text-white truncate">{user?.email}</p>
                    {userRank && (
                      <div className="mt-2 flex flex-col gap-1">
                        <div className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 text-slate-900 rounded-full text-xs font-bold shadow-lg w-max">
                          <span>Global Rank:</span>
                          <span>#{userRank}</span>
                        </div>
                        {pointsToNextRank > 0 && userRank > 1 && (
                          <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium opacity-80">
                            <span>{pointsToNextRank}</span>
                            <AnimatedCoin 
                              className="w-2 h-2" 
                              textSize="text-[4px]" 
                            />
                            <FaArrowRight className="text-[8px] text-slate-400 mx-0.5" />
                            <span>#{userRank - 1}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <Link
                    to="/tick2test"
                    onClick={() => setIsOpen(false)}
                    className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white px-4 py-3 rounded-xl text-base font-semibold hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:scale-105"
                  >
                    <FaChartLine />
                    <span>Tick2Test</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="w-full bg-red-600 text-white px-4 py-3 rounded-xl text-base font-semibold hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:scale-105"
                  >
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full border-2 border-slate-600 text-slate-200 px-4 py-3 rounded-xl text-base font-semibold hover:border-teal-400 hover:text-white transition-all duration-300 flex items-center justify-center space-x-2 hover:scale-105"
                  >
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsOpen(false)}
                    className="w-full bg-gradient-to-r from-teal-500 to-blue-600 text-white px-4 py-3 rounded-xl text-base font-semibold hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:scale-105"
                  >
                    <span>Sign Up</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      <EnquiryForm isOpen={showEnquiryForm} onClose={handleCloseEnquiry} />
      <style>{`
        @keyframes shine {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
        .animate-shine {
          background-size: 200% auto;
          animation: shine 2s linear infinite;
        }
      `}</style>
    </nav>
  );
};
export default Navbar;