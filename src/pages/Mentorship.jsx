import React, { useState } from 'react';
import { applicantAPI } from '../services/api';
import { useMentor } from '../hooks/useMentor';

const Mentorship = () => {
  const [role, setRole] = useState('student'); // 'student' or 'mentor'
  
  // Student Form State
  const [studentData, setStudentData] = useState({
    fullName: '',
    phone: '',
    email: '',
    place: '',
    educationalQualifications: '',
    programmingLanguages: ''
  });

  // Mentor Form State
  const [mentorData, setMentorData] = useState({
    name: '',
    email: '',
    phone: '',
    experience: '',
    currentRole: '',
    skills: '',
    availability: '',
    linkedin: ''
  });

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [studentError, setStudentError] = useState('');
  const [isStudentSubmitting, setIsStudentSubmitting] = useState(false);
  const [showExperienceWarning, setShowExperienceWarning] = useState(false);

  // Mentor Hook
  const {
    loading: isMentorSubmitting,
    error: mentorApiError,
    validationErrors: mentorValidationErrors,
    submitMentorApplication,
    clearErrors: clearMentorErrors
  } = useMentor();

  const handleStudentChange = (e) => {
    const { name, value } = e.target;
    setStudentData(prev => ({ ...prev, [name]: value }));
    if (studentError) setStudentError('');
  };

  const handleMentorChange = (e) => {
    const { name, value } = e.target;
    setMentorData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'experience' && value && parseInt(value) < 2) {
      setShowExperienceWarning(true);
    } else {
      setShowExperienceWarning(false);
    }
    if (mentorApiError) {
      clearMentorErrors();
    }
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setIsStudentSubmitting(true);
    setStudentError('');
    try {
      const result = await applicantAPI.create(studentData);
      if (result.success) {
        setIsSubmitted(true);
        setStudentData({
          fullName: '',
          phone: '',
          email: '',
          place: '',
          educationalQualifications: '',
          programmingLanguages: ''
        });
        setTimeout(() => setIsSubmitted(false), 5000);
      }
    } catch (err) {
      console.error('Error submitting student application:', err);
      setStudentError(err.message || 'Failed to submit application. Please try again.');
    } finally {
      setIsStudentSubmitting(false);
    }
  };

  const handleMentorSubmit = async (e) => {
    e.preventDefault();
    if (parseInt(mentorData.experience) < 2) {
      alert('Minimum 2 years of experience is required to become a mentor.');
      return;
    }
    clearMentorErrors();
    try {
      const result = await submitMentorApplication({
        name: mentorData.name.trim(),
        email: mentorData.email.trim(),
        phone: mentorData.phone.trim(),
        experience: parseInt(mentorData.experience),
        currentRole: mentorData.currentRole.trim(),
        skills: mentorData.skills ? mentorData.skills.trim() : '',
        availability: mentorData.availability,
        linkedin: mentorData.linkedin.trim()
      });
      setIsSubmitted(true);
      setMentorData({
        name: '',
        email: '',
        phone: '',
        experience: '',
        currentRole: '',
        skills: '',
        availability: '',
        linkedin: ''
      });
      setShowExperienceWarning(false);
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error) {
      console.error('Mentor submission failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4 sm:px-6 lg:px-8 text-white">
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            {/* Title Removed */}
            
            {/* Role Selector */}
            <div className="mb-8 flex justify-center">
              <div className="relative inline-flex items-center gap-2 bg-slate-800 p-1.5 rounded-xl border border-slate-700">
                <button
                  onClick={() => setRole('student')}
                  className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    role === 'student'
                      ? 'bg-teal-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  I want to be a Student
                </button>
                <button
                  onClick={() => setRole('mentor')}
                  className={`px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    role === 'mentor'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  I want to be a Mentor
                </button>
              </div>
            </div>
          </div>

          {isSubmitted ? (
            <div className="bg-green-900/20 border-2 border-green-700 rounded-xl p-8 text-center animate-fade-in">
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-2xl font-bold text-green-400 mb-2">Application Submitted!</h3>
              <p className="text-green-300">
                {role === 'student' 
                  ? "We'll review your application and get back to you soon."
                  : "We'll review your profile and get back to you within 3-5 business days."}
              </p>
            </div>
          ) : (
            <div className="bg-slate-800 rounded-xl shadow-black-xl p-8 border border-slate-700 transition-all duration-300">
              {role === 'student' ? (
                /* Student Form */
                <form onSubmit={handleStudentSubmit} className="space-y-6">
                   <div className="mb-6 p-4 bg-teal-900/20 border border-teal-700/50 rounded-lg">
                    <h4 className="text-teal-400 font-semibold mb-1">Student Application</h4>
                    <p className="text-sm text-slate-400">Apply for our mentorship program to accelerate your learning.</p>
                  </div>

                  {studentError && (
                    <div className="p-4 bg-red-900/20 border-2 border-red-700 rounded-xl text-sm text-red-400">
                      {studentError}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="fullName"
                      value={studentData.fullName}
                      onChange={handleStudentChange}
                      required
                      className="w-full px-4 py-3 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-700 text-white placeholder-slate-400"
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number *</label>
                        <input
                        type="tel"
                        name="phone"
                        value={studentData.phone}
                        onChange={handleStudentChange}
                        required
                        className="w-full px-4 py-3 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-700 text-white placeholder-slate-400"
                        placeholder="+91 1234567890"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Email *</label>
                        <input
                        type="email"
                        name="email"
                        value={studentData.email}
                        onChange={handleStudentChange}
                        required
                        className="w-full px-4 py-3 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-700 text-white placeholder-slate-400"
                        placeholder="your.email@example.com"
                        />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Place *</label>
                    <input
                      type="text"
                      name="place"
                      value={studentData.place}
                      onChange={handleStudentChange}
                      required
                      className="w-full px-4 py-3 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-slate-700 text-white placeholder-slate-400"
                      placeholder="Enter your city/place"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Educational Qualifications *</label>
                    <textarea
                      name="educationalQualifications"
                      value={studentData.educationalQualifications}
                      onChange={handleStudentChange}
                      required
                      rows="3"
                      className="w-full px-4 py-3 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none bg-slate-700 text-white placeholder-slate-400"
                      placeholder="e.g., B.Tech Computer Science, MCA, B.Sc IT, etc."
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Familiar Programming Languages & Stack *</label>
                    <textarea
                      name="programmingLanguages"
                      value={studentData.programmingLanguages}
                      onChange={handleStudentChange}
                      required
                      rows="3"
                      className="w-full px-4 py-3 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none bg-slate-700 text-white placeholder-slate-400"
                      placeholder="e.g., JavaScript, React, Node.js, Python, Java, etc."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={isStudentSubmitting}
                    className={`w-full py-4 px-6 rounded-lg text-lg font-semibold transition-all duration-300 ${
                      isStudentSubmitting
                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        : 'shiny-button bg-gradient-to-r from-teal-600 to-teal-800 text-white hover:shadow-2xl hover:scale-[1.02] border border-teal-500/30'
                    }`}
                  >
                    {isStudentSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                         <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                         </svg>
                        Submitting...
                      </span>
                    ) : (
                      'Submit Student Application'
                    )}
                  </button>
                </form>
              ) : (
                /* Mentor Form */
                <form onSubmit={handleMentorSubmit} className="space-y-6">
                  <div className="mb-6 p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                    <h4 className="text-blue-400 font-semibold mb-1">Mentor Application</h4>
                    <p className="text-sm text-slate-400">Share your expertise and guide the next generation of developers.</p>
                  </div>

                  {mentorApiError && (
                    <div className="p-4 bg-red-900/20 border-2 border-red-700 rounded-xl text-sm text-red-400">
                      {mentorApiError}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={mentorData.name}
                      onChange={handleMentorChange}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-700 text-white placeholder-slate-400 ${
                        mentorValidationErrors.name ? 'border-red-300' : 'border-slate-600'
                      }`}
                      placeholder="Enter your full name"
                    />
                    {mentorValidationErrors.name && <p className="mt-1 text-xs text-red-400">{mentorValidationErrors.name}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Email Address *</label>
                        <input
                        type="email"
                        name="email"
                        value={mentorData.email}
                        onChange={handleMentorChange}
                        required
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-700 text-white placeholder-slate-400 ${
                            mentorValidationErrors.email ? 'border-red-300' : 'border-slate-600'
                        }`}
                        placeholder="your.email@example.com"
                        />
                        {mentorValidationErrors.email && <p className="mt-1 text-xs text-red-400">{mentorValidationErrors.email}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Phone Number *</label>
                        <input
                        type="tel"
                        name="phone"
                        value={mentorData.phone}
                        onChange={handleMentorChange}
                        required
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-700 text-white placeholder-slate-400 ${
                            mentorValidationErrors.phone ? 'border-red-300' : 'border-slate-600'
                        }`}
                        placeholder="+91 1234567890"
                        />
                        {mentorValidationErrors.phone && <p className="mt-1 text-xs text-red-400">{mentorValidationErrors.phone}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Years of Experience * (Min 2 years)</label>
                    <input
                      type="number"
                      name="experience"
                      value={mentorData.experience}
                      onChange={handleMentorChange}
                      required
                      min="2"
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-700 text-white placeholder-slate-400 ${
                        showExperienceWarning ? 'border-red-500' : 'border-slate-600'
                      }`}
                      placeholder="Enter years of experience"
                    />
                    {showExperienceWarning && (
                      <p className="mt-2 text-sm text-red-400 font-medium">⚠️ Minimum 2 years of experience required.</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Current Role / Position *</label>
                    <input
                      type="text"
                      name="currentRole"
                      value={mentorData.currentRole}
                      onChange={handleMentorChange}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-700 text-white placeholder-slate-400 ${
                        mentorValidationErrors.currentRole ? 'border-red-300' : 'border-slate-600'
                      }`}
                      placeholder="e.g., Senior Software Engineer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Technical Skills (Optional)</label>
                    <textarea
                      name="skills"
                      value={mentorData.skills}
                      onChange={handleMentorChange}
                      rows="3"
                      className="w-full px-4 py-3 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none bg-slate-700 text-white placeholder-slate-400"
                      placeholder="e.g., React, Node.js, AWS, etc."
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">Weekly Availability *</label>
                    <select
                      name="availability"
                      value={mentorData.availability}
                      onChange={handleMentorChange}
                      required
                      className="w-full px-4 py-3 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-700 text-white"
                    >
                      <option value="">Select availability</option>
                      <option value="2-5">2-5 hours per week</option>
                      <option value="5-10">5-10 hours per week</option>
                      <option value="10-15">10-15 hours per week</option>
                      <option value="15+">15+ hours per week</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-2">LinkedIn Profile *</label>
                    <input
                      type="text"
                      name="linkedin"
                      value={mentorData.linkedin}
                      onChange={handleMentorChange}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-700 text-white placeholder-slate-400 ${
                        mentorValidationErrors.linkedin ? 'border-red-300' : 'border-slate-600'
                      }`}
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isMentorSubmitting || showExperienceWarning}
                    className={`w-full py-4 px-6 rounded-lg text-lg font-semibold transition-all duration-300 ${
                      isMentorSubmitting || showExperienceWarning
                        ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                        : 'shiny-button bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:shadow-2xl hover:scale-[1.02] border border-blue-500/30'
                    }`}
                  >
                    {isMentorSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </span>
                    ) : (
                      'Submit Mentor Application'
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Mentorship;
