import React from 'react';
import { Link } from 'react-router-dom';
const Features = () => {
  const features = [
    {
      icon: '👥',
      title: 'Expert Mentors',
      description: 'Learn from experienced developers with 2+ years of industry experience',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20'
    },
    {
      icon: '📚',
      title: 'Hands on Projects',
      description: 'Build real-world projects to strengthen your portfolio and skills',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20'
    },
    {
      icon: '💬',
      title: 'Communication Class',
      description: 'Improve your communication skills and professional presentation',
      color: 'from-teal-500 to-cyan-500',
      bgColor: 'bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-900/20 dark:to-cyan-900/20'
    },
    {
      icon: '🤝',
      title: 'Self Learn with Like-minded Developers',
      description: 'Join a community of learners and grow together with peer support',
      color: 'from-blue-500 to-indigo-500',
      bgColor: 'bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20'
    },
    {
      icon: '🎯',
      title: 'Placement Assistance',
      description: 'Get help with job placements and career opportunities',
      color: 'from-pink-500 to-rose-500',
      bgColor: 'bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-900/20 dark:to-rose-900/20'
    },
    {
      icon: '🛠️',
      title: '24*7 Tech Support',
      description: 'Round-the-clock technical assistance whenever you need help',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20'
    }
  ];
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 dark:text-slate-100 mb-4">
            Why Choose Our Program?
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`group relative ${feature.bgColor} rounded-2xl p-8 shadow-black-lg hover:shadow-black-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-slate-700`}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`}></div>
              <div className="relative">
                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-3 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-gray-700 group-hover:via-gray-600 group-hover:to-gray-700 dark:group-hover:from-slate-200 dark:group-hover:via-slate-100 dark:group-hover:to-slate-200 group-hover:bg-clip-text transition-all duration-300">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link
            to="/free-mentorship"
            className="shiny-button inline-block bg-gradient-to-r from-gray-900 via-black to-gray-800 dark:from-teal-600 dark:via-teal-500 dark:to-teal-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-2xl hover:shadow-gray-400/50 dark:hover:shadow-teal-500/30 transform hover:scale-105 transition-all duration-300 border border-gray-600/30 dark:border-teal-400/30"
          >
            Get Started Free →
          </Link>
        </div>
      </div>
    </section>
  );
};
export default Features;
