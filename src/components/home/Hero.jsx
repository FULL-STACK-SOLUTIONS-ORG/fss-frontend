import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Lottie from 'lottie-react';
import softwareEngineerAnimation from '../../assets/animations/softwareengineer.json';
import frustratedAnimation from '../../assets/animations/frustrated.json';
import './ShinyText.css';
const Hero = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isTextVisible, setIsTextVisible] = useState(false);
  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsTextVisible(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);
  const problems = [
    'Nobody to validate your learning with tech review',
    'There is no experinced mentors for proper guidence',
    'Struggle to build real-world projects',
    'Need help improving communication skills for interviews',
    'No proper tech support to clear your doubts'
  ];
  return (
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-16" style={{ backgroundColor: '#F5F0E8' }}>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className={`transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          {}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 items-center mb-12 relative">
            {}
            <div
              className={`flex flex-col items-start text-left transform transition-all duration-1000 ease-out ${
                isTextVisible
                  ? 'translate-x-0 opacity-100'
                  : '-translate-x-full opacity-0'
              }`}
            >
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold leading-tight" style={{ color: '#1C1A17', fontFamily: "'Playfair Display', Georgia, serif" }}>
                <span className="whitespace-nowrap text-2xl md:text-3xl lg:text-4xl">
                  Want to become a{' '}
                  <span className="text-2xl md:text-3xl lg:text-4xl font-bold italic" style={{ color: '#9B7D43' }}>Software Engineer</span>
                </span>
                <br />
                <span className="whitespace-nowrap text-2xl md:text-3xl lg:text-4xl">through self-learning?</span>
              </h1>
            </div>
            {}
            <div className="w-full max-w-md mx-auto lg:mx-0">
              <Lottie
                animationData={softwareEngineerAnimation}
                loop={true}
                className="w-full h-auto"
              />
            </div>
          </div>
          {}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8 items-center mb-12 relative">
            {}
            <div className="w-full max-w-md mx-auto lg:mx-0 rounded-2xl overflow-hidden" style={{ boxShadow: '0 10px 30px rgba(28,26,23,0.12)' }}>
              <Lottie
                animationData={frustratedAnimation}
                loop={true}
                className="w-full h-auto"
              />
            </div>
            {}
            <div className="flex flex-col items-start text-left">
              <h2 className="text-2xl md:text-3xl font-bold mb-6" style={{ color: '#1C1A17', fontFamily: "'Playfair Display', Georgia, serif" }}>
                But you may struggling while self learning with?
              </h2>
              <ul className="space-y-2 w-full max-w-md">
                {problems.map((problem, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="font-bold text-xl mt-1" style={{ color: '#C07A3A' }}>•</span>
                    <span className={`text-lg font-medium ${index === 1 || index === 3 ? 'whitespace-nowrap' : ''}`} style={{ color: '#9B5A25' }}>{problem}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {}
          <div className="text-center mt-16">
            <div className="relative max-w-4xl mx-auto">
              {}
              <div className="absolute inset-0 rounded-3xl transform rotate-2 blur-xl" style={{ backgroundColor: 'rgba(155, 125, 67, 0.15)' }}></div>
              <div className="absolute inset-0 rounded-3xl transform -rotate-1 opacity-80" style={{ backgroundColor: '#FAF7F2' }}></div>
              <div className="relative backdrop-blur-md rounded-3xl p-8 md:p-12" style={{ backgroundColor: '#FAF7F2', border: '1.5px solid #D4B896', boxShadow: '0 20px 40px rgba(28,26,23,0.1)' }}>
                <p className="text-2xl md:text-3xl lg:text-4xl mb-8 max-w-3xl mx-auto leading-relaxed font-bold" style={{ color: '#1C1A17', fontFamily: "'Playfair Display', Georgia, serif" }}>
                  Don't worry Join Full Stack Solutions Personalized 1:1 Mentorship Program and build your career with confidence
                </p>
                <Link
                  to="/mentorship"
                  className="shiny-button inline-block px-10 py-5 rounded-xl text-lg md:text-xl font-semibold transform hover:scale-105 transition-all duration-300 shadow-lg"
                  style={{ backgroundColor: '#1C1A17', color: '#F5F0E8' }}
                >
                  <span className="shiny-text">🚀 Start My Journey</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default Hero;
