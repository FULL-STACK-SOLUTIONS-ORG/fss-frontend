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
          ? 'backdrop-blur-md shadow-sm'
          : 'backdrop-blur-sm'
      }`}
      style={{
        backgroundColor: isScrolled ? 'rgba(253,250,245,0.97)' : 'rgba(253,250,245,0.92)',
        borderBottom: isScrolled ? '1px solid #E0D8CC' : 'none'
      }}
    >
      <div className="relative z-10 w-full px-2 sm:px-3 lg:px-4 mx-auto">
        <div className="flex items-center justify-between h-16 lg:h-18 flex-nowrap">
          <div className="flex-shrink-0">
            <a href="/" onClick={(e) => { e.preventDefault(); handleHomeClick(e); }} className="group flex items-center space-x-3">
              <div className="relative">
                <div className="absolute -inset-1 rounded-full opacity-0 group-hover:opacity-100 blur-md transition-all duration-300" style={{ background: 'linear-gradient(135deg, #C9A96E, #9B7D43)' }}></div>
                <img
                  src={logo}
                  alt="Full Stack Solutions Logo"
                  className="relative h-10 w-10 sm:h-12 sm:w-12 rounded-full object-cover transition-all duration-300 group-hover:scale-110 border-2 shadow-lg"
                  style={{ borderColor: '#D4B896' }}
                />
              </div>
              <span
                className="text-lg sm:text-xl font-bold hidden sm:block transition-all duration-300 whitespace-nowrap"
                style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#1C1A17' }}
              >
                Full Stack Solutions
              </span>
            </a>
          </div>
          <div className="hidden lg:block flex-shrink-0">
            <div className="ml-4 flex items-center space-x-1 flex-nowrap">
              {navLinks.map((link) => {
                const linkClassName = "group relative px-5 py-3 rounded-xl !text-2xl font-semibold transition-all duration-300 whitespace-nowrap flex items-center leading-tight";
                const linkStyle = { color: '#1C1A17' };
                if (link.name === 'Home') {
                  return (
                    <a
                      key={link.name}
                      href={link.href}
                      onClick={handleHomeClick}
                      className={linkClassName}
                      style={linkStyle}
                      onMouseEnter={e => { e.currentTarget.style.color = '#9B7D43'; e.currentTarget.style.backgroundColor = '#F0E8DC'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = '#1C1A17'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <span className="relative z-10">{link.name}</span>
                      <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 rounded-full group-hover:w-3/4 transition-all duration-300" style={{ backgroundColor: '#9B7D43' }}></span>
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
                    style={linkStyle}
                    onMouseEnter={e => { e.currentTarget.style.color = '#9B7D43'; e.currentTarget.style.backgroundColor = '#F0E8DC'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#1C1A17'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <span className={`relative z-10 ${isTick2Test ? 'font-bold' : ''}`} style={isTick2Test ? { background: 'linear-gradient(90deg, #9B7D43, #C9A96E, #9B7D43)', backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent', backgroundSize: '200% auto', animation: 'shine 2s linear infinite' } : {}}>
                      {link.name}
                    </span>
                    <span className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-0 h-0.5 rounded-full group-hover:w-3/4 transition-all duration-300" style={{ backgroundColor: '#9B7D43' }}></span>
                  </Link>
                );
              })}
              {}
              <div className="ml-2 px-4 py-2 rounded-xl flex items-center gap-2 group transition-all duration-300" style={{ border: '1.5px solid rgba(212,184,150,0.6)', backgroundColor: 'rgba(155,125,67,0.08)' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(155,125,67,0.15)'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'rgba(155,125,67,0.08)'}
              >
                <FaPhone className="text-sm group-hover:scale-110 transition-transform duration-300" style={{ color: '#9B7D43' }} />
                <span className="font-semibold text-lg tracking-wide" style={{ color: '#1C1A17' }}>+91 8848118585</span>
              </div>
            </div>
          </div>
          <div className="hidden md:flex items-center space-x-1 flex-shrink-0 flex-nowrap -ml-4">
            <button
              onClick={handleEnquiryClick}
              className="group relative px-5 py-3 rounded-xl !text-2xl font-semibold transition-all duration-300 whitespace-nowrap flex items-center leading-tight"
              style={{ color: '#1C1A17', border: '1.5px solid #C9A96E' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#9B7D43'; e.currentTarget.style.borderColor = '#9B7D43'; e.currentTarget.style.backgroundColor = '#F0E8DC'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#1C1A17'; e.currentTarget.style.borderColor = '#C9A96E'; e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <span className="relative z-10">Enquiry</span>
            </button>
            <a
              href="https://chat.whatsapp.com/your-community-link"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative px-5 py-3 rounded-xl !text-2xl font-semibold transition-all duration-300 whitespace-nowrap flex items-center leading-tight"
              style={{ color: '#1C1A17', border: '1.5px solid #C9A96E' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#9B7D43'; e.currentTarget.style.borderColor = '#9B7D43'; e.currentTarget.style.backgroundColor = '#F0E8DC'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#1C1A17'; e.currentTarget.style.borderColor = '#C9A96E'; e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <span className="relative z-10">Community</span>
            </a>
            {}
            {isAuthenticated ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="group relative px-5 py-3 rounded-xl !text-2xl font-semibold transition-all duration-300 whitespace-nowrap flex items-center leading-tight gap-2"
                  style={{ color: '#1C1A17', border: '1.5px solid #D4B896' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#9B7D43'; e.currentTarget.style.backgroundColor = '#F0E8DC'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#D4B896'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <FaUser className="text-xl" style={{ color: '#9B7D43' }} />
                  <span className="relative z-10">{user?.name?.split(' ')[0]}</span>
                  {userRank && (
                    <div className="flex items-center gap-2">
                      <span className="ml-1 px-2 py-0.5 text-sm font-bold rounded-full shadow-lg" style={{ background: 'linear-gradient(135deg, #C9A96E, #9B7D43)', color: '#FAF7F2', border: '1px solid #D4B896' }}>
                        #{userRank}
                      </span>
                      {pointsToNextRank > 0 && userRank > 1 && (
                        <span className="hidden xl:flex items-center gap-1 text-xs font-bold opacity-90 ml-2" style={{ color: '#9B7D43' }} title={`${pointsToNextRank} points needed to reach rank #${userRank - 1}`}>
                          <span>{pointsToNextRank}</span>
                          <AnimatedCoin
                            className="w-3 h-3"
                            textSize="text-[6px]"
                          />
                          <FaArrowRight className="text-xs mx-0.5" style={{ color: '#9B7D43' }} />
                          <span>#{userRank - 1}</span>
                        </span>
                      )}
                    </div>
                  )}
                  <FaChevronDown className={`text-sm transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`} style={{ color: '#9B7D43' }} />
                </button>
                {}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-xl overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-200" style={{ backgroundColor: '#FAF7F2', border: '1px solid #E0D8CC' }}>
                    {user?.isDashboardApproved && (
                      <Link
                        to="/dashboard"
                        state={{ view: 'profile' }}
                        onClick={() => setShowUserMenu(false)}
                        className="w-full px-4 py-3 text-left transition-colors flex items-center gap-2"
                        style={{ color: '#1C1A17' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F0E8DC'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <FaUser style={{ color: '#9B7D43' }} />
                        <span>My Profile</span>
                      </Link>
                    )}
                    {user?.isDashboardApproved && (
                      <Link
                        to="/dashboard"
                        state={{ view: 'tasks' }}
                        onClick={() => setShowUserMenu(false)}
                        className="w-full px-4 py-3 text-left transition-colors flex items-center gap-2"
                        style={{ color: '#1C1A17' }}
                        onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F0E8DC'}
                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <FaTasks style={{ color: '#9B7D43' }} />
                        <span>Tasks</span>
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full px-4 py-3 text-left transition-colors flex items-center gap-2"
                      style={{ color: '#1C1A17' }}
                      onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F0E8DC'}
                      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      <FaSignOutAlt style={{ color: '#9B7D43' }} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="group relative px-5 py-3 rounded-xl !text-2xl font-semibold transition-all duration-300 whitespace-nowrap flex items-center leading-tight"
                  style={{ color: '#1C1A17', border: '1.5px solid #D4B896' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#9B7D43'; e.currentTarget.style.color = '#9B7D43'; e.currentTarget.style.backgroundColor = '#F0E8DC'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#D4B896'; e.currentTarget.style.color = '#1C1A17'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <span className="relative z-10">Login</span>
                </Link>
                <Link
                  to="/signup"
                  className="group relative px-5 py-3 rounded-xl !text-2xl font-semibold transition-all duration-300 whitespace-nowrap flex items-center leading-tight"
                  style={{ color: '#1C1A17', border: '1.5px solid #D4B896' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#9B7D43'; e.currentTarget.style.color = '#9B7D43'; e.currentTarget.style.backgroundColor = '#F0E8DC'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#D4B896'; e.currentTarget.style.color = '#1C1A17'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <span className="relative z-10">Sign Up</span>
                </Link>
              </>
            )}
          </div>
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl transition-all duration-300"
              style={{ color: '#1C1A17' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#9B7D43'; e.currentTarget.style.backgroundColor = '#F0E8DC'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#1C1A17'; e.currentTarget.style.backgroundColor = 'transparent'; }}
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
        <div className="md:hidden relative z-10 backdrop-blur-md shadow-xl" style={{ backgroundColor: 'rgba(253,250,245,0.97)', borderTop: '1px solid #E0D8CC' }}>
          <div className="px-4 pt-4 pb-6 space-y-2 animate-in slide-in-from-top duration-300">
            {navLinks.map((link, index) => {
              const mobileLinkStyle = { color: '#1C1A17', borderRadius: '0.75rem', display: 'block', padding: '0.75rem 1rem', fontWeight: '600', transition: 'all 0.3s' };
              if (link.name === 'Home') {
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    onClick={handleHomeClick}
                    style={{ ...mobileLinkStyle, animationDelay: `${index * 50}ms` }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#9B7D43'; e.currentTarget.style.backgroundColor = '#F0E8DC'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = '#1C1A17'; e.currentTarget.style.backgroundColor = 'transparent'; }}
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
                  style={{ ...mobileLinkStyle, animationDelay: `${index * 50}ms` }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#9B7D43'; e.currentTarget.style.backgroundColor = '#F0E8DC'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#1C1A17'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <span className={isTick2Test ? 'font-bold' : ''} style={isTick2Test ? { background: 'linear-gradient(90deg, #9B7D43, #C9A96E, #9B7D43)', backgroundClip: 'text', WebkitBackgroundClip: 'text', color: 'transparent', backgroundSize: '200% auto', animation: 'shine 2s linear infinite' } : {}}>
                    {link.name}
                  </span>
                </Link>
              );
            })}
            {}
            <div className="mx-4 mt-2 px-4 py-3 rounded-xl flex items-center justify-center gap-3" style={{ border: '1px solid rgba(212,184,150,0.5)', backgroundColor: 'rgba(155,125,67,0.08)' }}>
              <FaPhone style={{ color: '#9B7D43' }} />
              <span className="font-semibold text-lg tracking-wide" style={{ color: '#1C1A17' }}>+91 8848118585</span>
            </div>
            <div className="pt-4 mt-4 space-y-2" style={{ borderTop: '1px solid #E0D8CC' }}>
              <button
                onClick={handleEnquiryClick}
                className="w-full text-white px-4 py-3 rounded-xl text-base font-semibold hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #1C1A17, #3A3530)', color: '#F5F0E8' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Enquiry Form</span>
              </button>
              {}
              {isAuthenticated ? (
                <>
                  <div className="px-4 py-3 rounded-xl" style={{ backgroundColor: '#F0E8DC' }}>
                    <p className="text-xs" style={{ color: '#9B7D43' }}>Signed in as</p>
                    <p className="text-sm font-medium truncate" style={{ color: '#1C1A17' }}>{user?.email}</p>
                    {userRank && (
                      <div className="mt-2 flex flex-col gap-1">
                        <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold shadow-lg w-max" style={{ background: 'linear-gradient(135deg, #C9A96E, #9B7D43)', color: '#FAF7F2' }}>
                          <span>Global Rank:</span>
                          <span>#{userRank}</span>
                        </div>
                        {pointsToNextRank > 0 && userRank > 1 && (
                          <div className="flex items-center gap-1 text-xs font-semibold opacity-90" style={{ color: '#9B7D43' }}>
                            <span>{pointsToNextRank}</span>
                            <AnimatedCoin className="w-3 h-3" textSize="text-[6px]" />
                            <FaArrowRight className="text-xs mx-0.5" />
                            <span>#{userRank - 1}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <Link
                    to="/tick2test"
                    onClick={() => setIsOpen(false)}
                    className="w-full px-4 py-3 rounded-xl text-base font-semibold hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:scale-105"
                    style={{ background: 'linear-gradient(135deg, #9B7D43, #C9A96E)', color: '#FAF7F2' }}
                  >
                    <FaChartLine />
                    <span>Tick2Test</span>
                  </Link>
                  <button
                    onClick={() => { handleLogout(); setIsOpen(false); }}
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
                    className="w-full px-4 py-3 rounded-xl text-base font-semibold transition-all duration-300 flex items-center justify-center space-x-2 hover:scale-105"
                    style={{ color: '#1C1A17', border: '1.5px solid #D4B896' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#9B7D43'; e.currentTarget.style.backgroundColor = '#F0E8DC'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#D4B896'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <span>Login</span>
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setIsOpen(false)}
                    className="w-full px-4 py-3 rounded-xl text-base font-semibold hover:shadow-xl transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:scale-105"
                    style={{ background: 'linear-gradient(135deg, #1C1A17, #3A3530)', color: '#F5F0E8' }}
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
