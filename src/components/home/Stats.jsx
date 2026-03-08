import React, { useState, useEffect } from 'react';
const Stats = () => {
  const [counted, setCounted] = useState(false);
  const stats = [
    { number: 500, suffix: '+', label: 'Active Learners' },
    { number: 50, suffix: '+', label: 'Expert Mentors' },
    { number: 100, suffix: '%', label: 'Free Program' },
    { number: 20, suffix: '', label: 'Comprehensive Modules' }
  ];
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !counted) {
            setCounted(true);
          }
        });
      },
      { threshold: 0.5 }
    );
    const element = document.getElementById('stats-section');
    if (element) {
      observer.observe(element);
    }
    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [counted]);
  return (
    <section id="stats-section" className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-teal-500 via-teal-600 to-teal-500 dark:from-gray-900 dark:via-black dark:to-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-2">
                {counted ? `${stat.number}${stat.suffix}` : '0'}
              </div>
              <div className="text-lg md:text-xl text-white/90 font-semibold">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
export default Stats;
