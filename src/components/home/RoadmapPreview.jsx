import React from 'react';
import { Link } from 'react-router-dom';
const RoadmapPreview = () => {
  const previewModules = [
    { 
      name: 'HTML', 
      icon: (
        <svg className="w-6 h-6" fill="#E34F26" viewBox="0 0 24 24">
          <path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.564-2.438L1.5 0zm17.09 4.413L5.41 4.41l.213 2.622h10.125l-.255 2.716h-6.64l.24 2.573h6.182l-.366 3.523-2.91.804-2.955-.81-.188-2.11h-2.61l.29 3.855L12 19.288l5.373-1.53L18.59 4.414z"/>
        </svg>
      )
    },
    { 
      name: 'CSS', 
      icon: (
        <svg className="w-6 h-6" fill="#1572B6" viewBox="0 0 24 24">
          <path d="M1.5 0h21l-1.91 21.563L11.977 24l-8.565-2.438L1.5 0zm17.09 4.413L5.41 4.41l.213 2.622h10.125l-.255 2.716h-6.64l.24 2.573h6.182l-.366 3.523-2.91.804-2.955-.81-.188-2.11h-2.61l.29 3.855L12 19.288l5.373-1.53L18.59 4.414z"/>
        </svg>
      )
    },
    { 
      name: 'JavaScript', 
      icon: (
        <svg className="w-6 h-6" fill="#F7DF1E" viewBox="0 0 24 24">
          <path d="M0 0h24v24H0V0zm22.034 18.276c-.175-1.095-.888-2.015-3.003-2.873-.736-.345-1.554-.585-1.797-1.14-.091-.33-.105-.51-.046-.705.15-.646.915-.84 1.515-.66.39.12.75.42.976.9 1.034-.676 1.034-.676 1.755-1.125-.27-.42-.404-.601-.586-.78-.63-.705-1.469-1.065-2.834-1.034l-.705.089c-.676.165-1.32.525-1.71 1.005-1.14 1.291-.811 3.541.569 4.471 1.365 1.02 3.361 1.244 3.616 2.205.24 1.17-.87 1.545-1.966 1.41-.811-.18-1.26-.586-1.755-1.336l-1.83 1.051c.21.48.45.689.81 1.109 1.74 1.756 6.09 1.666 6.871-1.004.029-.09.24-.705.074-1.65l.046.067zm-8.983-7.245h-2.248c0 1.938-.009 3.864-.009 5.805 0 1.232.063 2.363-.138 2.711-.33.689-1.18.601-1.566.48-.396-.196-.597-.466-.83-.855-.063-.105-.11-.196-.127-.196l-1.825 1.125c.305.63.75 1.172 1.324 1.517.855.51 2.004.675 3.207.405.783-.226 1.458-.691 1.811-1.411.51-.93.402-2.07.397-3.346.012-2.054 0-4.109 0-6.179l.004-.056z"/>
        </svg>
      )
    },
    { 
      name: 'React', 
      icon: <span className="text-2xl font-bold" style={{ color: '#61DAFB' }}>⚛</span>
    },
    { 
      name: 'Node', 
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24">
          <path d="M12 2L2 7v10l10 5 10-5V7L12 2z" fill="#339933"/>
          <path d="M12 2v20M2 7l10 5M22 7l-10 5M2 17l10 5M22 17l-10 5" stroke="#ffffff" strokeWidth="0.5" fill="none"/>
          <text x="12" y="16" textAnchor="middle" fontSize="7" fill="#ffffff" fontWeight="bold">JS</text>
        </svg>
      )
    },
    { 
      name: 'MongoDB', 
      icon: <span className="text-2xl font-bold" style={{ color: '#47A248' }}>🍃</span>
    },
    { 
      name: 'PostgreSQL', 
      icon: <span className="text-2xl font-bold" style={{ color: '#336791' }}>🐘</span>
    },
    { 
      name: 'AWS', 
      icon: <span className="text-2xl font-bold" style={{ color: '#FF9900' }}>☁</span>
    },
    { 
      name: 'Python', 
      icon: (
        <svg className="w-6 h-6" viewBox="0 0 24 24">
          <path d="M14.25.18l.9.2.73.26.59.3.45.32.34.34.25.34.16.33.1.3.04.26.02.2-.01.13V8.5l-.05.63-.13.55-.21.46-.26.38-.3.31-.33.25-.35.19-.35.14-.33.1-.3.07-.26.04-.21.02H8.77l-.69.05-.59.14-.5.22-.41.27-.33.32-.27.35-.2.36-.15.37-.1.35-.07.32-.04.27-.02.21v3.06H3.17l-.21-.03-.28-.07-.32-.12-.35-.18-.36-.26-.36-.36-.35-.46-.32-.59-.28-.73-.21-.88-.14-1.05-.05-1.23.06-1.22.16-1.04.24-.87.32-.71.36-.57.4-.44.42-.33.42-.24.4-.16.36-.1.32-.05.24-.01h.16l.06.01h8.16v-.83H6.18l-.01-2.75-.02-.37.05-.34.11-.31.17-.28.25-.26.31-.23.38-.2.44-.18.51-.15.58-.12.64-.1.71-.06.77-.04.84-.02 1.27.05zm-6.3 1.98l-.23.33-.08.41.08.41.23.34.33.22.41.09.41-.09.33-.22.23-.34.08-.41-.08-.41-.23-.33-.33-.22-.41-.09-.41.09zm13.09 3.95l.28.06.32.12.35.18.36.27.36.35.35.47.32.59.28.73.21.88.14 1.04.05 1.23-.06 1.23-.16 1.04-.24.86-.32.71-.36.57-.4.45-.42.33-.42.24-.4.16-.36.09-.32.05-.24.02-.16-.01h-8.22v.82h5.84l.01 2.76.02.36-.05.34-.11.31-.17.29-.25.25-.31.24-.38.2-.44.17-.51.15-.58.13-.64.09-.71.07-.77.04-.84.01-1.27-.04-1.07-.14-.9-.2-.73-.25-.59-.3-.45-.33-.34-.34-.25-.34-.16-.33-.1-.3-.04-.25-.02-.2.01-.13v-5.34l.05-.64.13-.54.21-.46.26-.38.3-.32.33-.24.35-.2.35-.14.33-.1.3-.06.26-.04.21-.02.13-.01h5.84l.69-.05.59-.14.5-.21.41-.28.33-.32.27-.35.2-.36.15-.36.1-.35.07-.32.04-.28.02-.21V6.07h2.09l.14.01zm-6.47 14.25l-.23.33-.08.41.08.41.23.33.33.23.41.08.41-.08.33-.23.23-.33.08-.41-.08-.41-.23-.33-.33-.23-.41-.08-.41.08z" fill="#3776AB"/>
        </svg>
      )
    },
    { 
      name: 'Agentic AI', 
      icon: <span className="text-2xl font-bold" style={{ color: '#8B5CF6' }}>🤖</span>
    },
    { 
      name: 'DSA', 
      icon: <span className="text-2xl font-bold" style={{ color: '#10B981' }}>📊</span>
    },
    { 
      name: 'Microservices', 
      icon: <span className="text-2xl font-bold" style={{ color: '#3B82F6' }}>🔧</span>
    }
  ];
  return (
    <section id="roadmap-preview" className="py-20 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-800 dark:text-slate-100 mb-4">
            Your Learning Roadmap
          </h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8">
            Master full-stack development through our comprehensive 26-module program
          </p>
          <Link
            to="/roadmap"
            className="shiny-button inline-block bg-gradient-to-r from-gray-900 via-black to-gray-800 dark:from-teal-600 dark:via-teal-500 dark:to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-2xl hover:shadow-gray-400/50 dark:hover:shadow-teal-500/30 transform hover:scale-105 transition-all duration-300 border border-gray-600/30 dark:border-teal-400/30"
          >
            View Full Roadmap →
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 mb-12">
          {previewModules.map((module, index) => (
            <div
              key={index}
              className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-black-md hover:shadow-black-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 dark:border-slate-700 text-center"
            >
              <div className="w-12 h-12 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center mx-auto mb-3 shadow-gray-400/50 dark:shadow-black/50 border-2 border-gray-200 dark:border-slate-600">
                {module.icon}
              </div>
              <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                {module.name}
              </h3>
            </div>
          ))}
        </div>
        <div className="bg-gradient-to-r from-gray-50 to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-8 md:p-12 text-center border border-gray-200 dark:border-slate-700">
          <h3 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4">
            Ready to Start Learning?
          </h3>
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-6 max-w-2xl mx-auto">
            Join hundreds of students who are transforming their careers with our free mentorship program
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/free-mentorship"
              className="shiny-button inline-block bg-gradient-to-r from-gray-900 via-black to-gray-800 dark:from-teal-600 dark:via-teal-500 dark:to-teal-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:shadow-2xl hover:shadow-gray-400/50 dark:hover:shadow-teal-500/30 transform hover:scale-105 transition-all duration-300 border border-gray-600/30 dark:border-teal-400/30"
            >
              Apply for Free Mentorship
            </Link>
            <Link
              to="/roadmap"
              className="inline-block bg-white dark:bg-transparent text-gray-800 dark:text-slate-200 border-2 border-gray-600 dark:border-slate-500 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-black dark:hover:text-white transform hover:scale-105 transition-all duration-300"
            >
              Explore Roadmap
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
export default RoadmapPreview;
