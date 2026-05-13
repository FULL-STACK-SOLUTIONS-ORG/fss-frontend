import React from 'react';
import { Link } from 'react-router-dom';
const HowItWorks = () => {
  const steps = [
    {
      number: 1,
      title: 'Fill the Form'
    },
    {
      number: 2,
      title: 'Executive Will Contact You'
    },
    {
      number: 3,
      title: 'Enrolling FSS Program as Free'
    }
  ];
  const stepColors = [
    { bg: 'linear-gradient(135deg, #C9A96E, #9B7D43)', shadow: 'rgba(155,125,67,0.3)' },
    { bg: 'linear-gradient(135deg, #9B7D43, #6B5530)', shadow: 'rgba(107,85,48,0.3)' },
    { bg: 'linear-gradient(135deg, #6B5530, #4A3B22)', shadow: 'rgba(74,59,34,0.3)' }
  ];
  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 relative" style={{ backgroundColor: '#EDE8DC' }}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4" style={{ color: '#1C1A17', fontFamily: "'Playfair Display', Georgia, serif" }}>
            How to join FSS Mentorship Program
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: '#5A5550' }}>
            A simple 3-step process to join our mentorship program
          </p>
        </div>
        <div className="relative">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
            {steps.map((step, index) => (
              <React.Fragment key={index}>
                <div className="flex flex-col items-center">
                  <div
                    className="w-16 h-16 rounded-full text-white font-bold text-xl flex items-center justify-center mb-4"
                    style={{
                      background: stepColors[index % stepColors.length].bg,
                      boxShadow: `0 8px 20px ${stepColors[index % stepColors.length].shadow}`,
                      border: '3px solid #FAF7F2'
                    }}
                  >
                    {step.number}
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-center max-w-xs" style={{ color: '#1C1A17', fontFamily: "'Playfair Display', Georgia, serif" }}>
                    {step.title.split('\n').map((line, i) => (
                      <React.Fragment key={i}>
                        {i > 0 && <br />}
                        {line}
                      </React.Fragment>
                    ))}
                  </h3>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:flex items-center flex-shrink-0 px-4">
                    <div className="h-0.5 w-16 rounded-full" style={{ background: 'linear-gradient(90deg, #C9A96E, #9B7D43)' }}></div>
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#9B7D43' }}>
                      <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
        <div className="mt-16 text-center">
          <Link
            to="/mentorship"
            className="shiny-button inline-block px-8 py-4 rounded-xl text-lg font-semibold transform hover:scale-105 transition-all duration-300 shadow-lg"
            style={{ backgroundColor: '#1C1A17', color: '#F5F0E8' }}
          >
            Apply for Mentorship →
          </Link>
        </div>
      </div>
    </section>
  );
};
export default HowItWorks;
