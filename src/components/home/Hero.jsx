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
    <section id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-16">
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
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-slate-800 dark:text-slate-100 leading-tight">
                <span className="whitespace-nowrap text-2xl md:text-3xl lg:text-4xl">Want to become a <span className="text-2xl md:text-3xl lg:text-4xl font-bold text-teal-600 dark:text-teal-400">Software Engineer</span></span><br />
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
            <div className="w-full max-w-md mx-auto lg:mx-0 shadow-black-xl rounded-2xl overflow-hidden">
              <Lottie 
                animationData={frustratedAnimation} 
                loop={true}
                className="w-full h-auto"
              />
            </div>
            {}
            <div className="flex flex-col items-start text-left">
              <h2 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-6">
                But you may struggling while self learning with?
              </h2>
              <ul className="space-y-2 w-full max-w-md">
                {problems.map((problem, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-orange-600 dark:text-orange-400 font-bold text-xl mt-1">•</span>
                    <span className={`text-lg text-orange-600 dark:text-orange-400 ${index === 1 || index === 3 ? 'whitespace-nowrap' : ''}`}>{problem}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          {}
          <div className="text-center mt-16">
            <div className="relative max-w-4xl mx-auto">
              {}
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 via-emerald-400/20 to-lime-400/20 dark:from-emerald-900/20 dark:via-teal-900/20 dark:to-green-900/20 rounded-3xl transform rotate-2 blur-xl"></div>
              <div className="absolute inset-0 bg-gradient-to-tl from-green-100 via-emerald-100 to-lime-100 dark:from-slate-800 dark:via-slate-900 dark:to-black rounded-3xl transform -rotate-1 opacity-80"></div>
              <div className="relative bg-gradient-to-br from-white via-green-50 to-green-100 dark:from-slate-800 dark:via-slate-900 dark:to-black backdrop-blur-md rounded-3xl p-8 md:p-12 shadow-black-xl border-2 border-green-200 dark:border-slate-700">
                <p className="text-2xl md:text-3xl lg:text-4xl text-slate-800 dark:text-slate-100 mb-8 max-w-3xl mx-auto leading-relaxed font-bold">
                  Don't worry Join Full Stack Solutions Free Personalized 1:1 Mentorship Program and build your career with confidence
                </p>
                <Link
                  to="/free-mentorship"
                  className="shiny-button inline-block bg-gradient-to-r from-gray-900 via-black to-gray-800 dark:from-teal-600 dark:via-teal-500 dark:to-teal-600 text-white px-10 py-5 rounded-xl text-lg md:text-xl font-semibold hover:shadow-2xl hover:shadow-gray-400/50 dark:hover:shadow-teal-500/30 transform hover:scale-105 transition-all duration-300 shadow-lg border border-gray-600/30 dark:border-teal-400/30"
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
