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
  const gradientClasses = [
    'bg-gradient-to-br from-amber-500 via-orange-500 to-red-500',
    'bg-gradient-to-br from-blue-500 via-indigo-500 to-cyan-500',
    'bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500'
  ];
  return (
    <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 dark:text-slate-100 mb-4">
            How to join FSS Mentorship Program
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            A simple 3-step process to join our free mentorship program
          </p>
        </div>
        <div className="relative">
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
            {steps.map((step, index) => (
              <React.Fragment key={index}>
                <div className="flex flex-col items-center">
                  <div className={`w-16 h-16 rounded-full ${gradientClasses[index % gradientClasses.length]} text-white font-bold text-xl flex items-center justify-center shadow-xl border-4 border-white dark:border-slate-900 mb-4 shadow-gray-400/50 dark:shadow-black/50`}>
                    {step.number}
                  </div>
                  <h3 className="text-lg md:text-xl font-bold text-slate-800 dark:text-slate-100 text-center max-w-xs">
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
                    <div className="h-1 w-16 bg-gradient-to-r from-teal-500 via-blue-500 to-indigo-500 rounded-full"></div>
                    <svg className="w-6 h-6 text-indigo-500 dark:text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
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
            to="/free-mentorship"
            className="shiny-button inline-block bg-gradient-to-r from-gray-900 via-black to-gray-800 dark:from-teal-600 dark:via-teal-500 dark:to-teal-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-2xl hover:shadow-gray-400/50 dark:hover:shadow-teal-500/30 transform hover:scale-105 transition-all duration-300 shadow-lg border border-gray-600/30 dark:border-teal-400/30"
          >
            Apply for Free Mentorship →
          </Link>
        </div>
      </div>
    </section>
  );
};
export default HowItWorks;
