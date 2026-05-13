import React from 'react';
import { Link } from 'react-router-dom';
const Features = () => {
  const features = [
    {
      icon: '👥',
      title: 'Expert Mentors',
      description: 'Learn from experienced developers with 2+ years of industry experience',
      borderColor: '#D4A5C0'
    },
    {
      icon: '📚',
      title: 'Hands on Projects',
      description: 'Build real-world projects to strengthen your portfolio and skills',
      borderColor: '#D4B896'
    },
    {
      icon: '💬',
      title: 'Communication Class',
      description: 'Improve your communication skills and professional presentation',
      borderColor: '#96C8C8'
    },
    {
      icon: '🤝',
      title: 'Self Learn with Like-minded Developers',
      description: 'Join a community of learners and grow together with peer support',
      borderColor: '#96ABCD'
    },
    {
      icon: '🎯',
      title: 'Placement Assistance',
      description: 'Get help with job placements and career opportunities',
      borderColor: '#D4A5B4'
    },
    {
      icon: '🛠️',
      title: '24*7 Tech Support',
      description: 'Round-the-clock technical assistance whenever you need help',
      borderColor: '#A5C896'
    }
  ];
  return (
    <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 relative" style={{ backgroundColor: '#F5F0E8' }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4" style={{ color: '#1C1A17', fontFamily: "'Playfair Display', Georgia, serif" }}>
            Why Choose Our Program?
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative rounded-2xl p-8 transition-all duration-300 transform hover:-translate-y-2"
              style={{
                backgroundColor: '#FAF7F2',
                border: `1px solid #E0D8CC`,
                boxShadow: '0 4px 12px rgba(28,26,23,0.06)'
              }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 16px 32px rgba(28,26,23,0.12)'; e.currentTarget.style.borderColor = feature.borderColor; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(28,26,23,0.06)'; e.currentTarget.style.borderColor = '#E0D8CC'; }}
            >
              <div className="relative">
                <div className="text-5xl mb-4 transform group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3" style={{ color: '#1C1A17', fontFamily: "'Playfair Display', Georgia, serif" }}>
                  {feature.title}
                </h3>
                <p className="leading-relaxed" style={{ color: '#5A5550' }}>
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link
            to="/mentorship"
            className="shiny-button inline-block px-8 py-4 rounded-xl text-lg font-semibold transform hover:scale-105 transition-all duration-300 shadow-lg"
            style={{ backgroundColor: '#1C1A17', color: '#F5F0E8' }}
          >
            Get Started Free →
          </Link>
        </div>
      </div>
    </section>
  );
};
export default Features;
