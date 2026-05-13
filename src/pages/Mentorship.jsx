import React, { useState } from 'react';
import { applicantAPI } from '../services/api';
import { useMentor } from '../hooks/useMentor';

const inputStyle = { backgroundColor: '#FAF7F2', color: '#1C1A17', borderColor: '#D4B896' };
const inputClass = (hasError) =>
  `w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#9B7D43] focus:border-transparent placeholder-[#9A8A7A] ${hasError ? 'border-red-400' : ''}`;

const Mentorship = () => {
  const [role, setRole] = useState('student');
  const [studentData, setStudentData] = useState({
    fullName: '', phone: '', email: '', place: '', educationalQualifications: '', programmingLanguages: ''
  });
  const [mentorData, setMentorData] = useState({
    name: '', email: '', phone: '', experience: '', currentRole: '', skills: '', availability: '', linkedin: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [studentError, setStudentError] = useState('');
  const [isStudentSubmitting, setIsStudentSubmitting] = useState(false);
  const [showExperienceWarning, setShowExperienceWarning] = useState(false);
  const { loading: isMentorSubmitting, error: mentorApiError, validationErrors: mentorValidationErrors, submitMentorApplication, clearErrors: clearMentorErrors } = useMentor();

  const handleStudentChange = (e) => {
    const { name, value } = e.target;
    setStudentData(prev => ({ ...prev, [name]: value }));
    if (studentError) setStudentError('');
  };
  const handleMentorChange = (e) => {
    const { name, value } = e.target;
    setMentorData(prev => ({ ...prev, [name]: value }));
    if (name === 'experience' && value && parseInt(value) < 2) setShowExperienceWarning(true);
    else setShowExperienceWarning(false);
    if (mentorApiError) clearMentorErrors();
  };
  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    setIsStudentSubmitting(true); setStudentError('');
    try {
      const result = await applicantAPI.create(studentData);
      if (result.success) {
        setIsSubmitted(true);
        setStudentData({ fullName: '', phone: '', email: '', place: '', educationalQualifications: '', programmingLanguages: '' });
        setTimeout(() => setIsSubmitted(false), 5000);
      }
    } catch (err) {
      setStudentError(err.message || 'Failed to submit application. Please try again.');
    } finally { setIsStudentSubmitting(false); }
  };
  const handleMentorSubmit = async (e) => {
    e.preventDefault();
    if (parseInt(mentorData.experience) < 2) { alert('Minimum 2 years of experience is required to become a mentor.'); return; }
    clearMentorErrors();
    try {
      await submitMentorApplication({
        name: mentorData.name.trim(), email: mentorData.email.trim(), phone: mentorData.phone.trim(),
        experience: parseInt(mentorData.experience), currentRole: mentorData.currentRole.trim(),
        skills: mentorData.skills ? mentorData.skills.trim() : '', availability: mentorData.availability, linkedin: mentorData.linkedin.trim()
      });
      setIsSubmitted(true);
      setMentorData({ name: '', email: '', phone: '', experience: '', currentRole: '', skills: '', availability: '', linkedin: '' });
      setShowExperienceWarning(false);
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error) { console.error('Mentor submission failed:', error); }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F5F0E8', color: '#1C1A17' }}>
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <div className="mb-8 flex justify-center">
              <div className="relative inline-flex items-center gap-2 p-1.5 rounded-xl" style={{ backgroundColor: '#EDE8DC', border: '1px solid #D4B896' }}>
                <button
                  onClick={() => setRole('student')}
                  className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
                  style={role === 'student' ? { backgroundColor: '#1C1A17', color: '#F5F0E8', boxShadow: '0 2px 8px rgba(28,26,23,0.2)' } : { color: '#5A5550' }}
                >
                  I want to be a Student
                </button>
                <button
                  onClick={() => setRole('mentor')}
                  className="px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200"
                  style={role === 'mentor' ? { backgroundColor: '#9B7D43', color: '#FAF7F2', boxShadow: '0 2px 8px rgba(155,125,67,0.3)' } : { color: '#5A5550' }}
                >
                  I want to be a Mentor
                </button>
              </div>
            </div>
          </div>

          {isSubmitted ? (
            <div className="rounded-xl p-8 text-center" style={{ backgroundColor: '#FAF7F2', border: '2px solid #A5C896' }}>
              <div className="text-5xl mb-4">✅</div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: '#2D6A2D', fontFamily: "'Playfair Display', Georgia, serif" }}>Application Submitted!</h3>
              <p style={{ color: '#3A6A3A' }}>
                {role === 'student' ? "We'll review your application and get back to you soon." : "We'll review your profile and get back to you within 3-5 business days."}
              </p>
            </div>
          ) : (
            <div className="rounded-xl shadow-lg p-8 transition-all duration-300" style={{ backgroundColor: '#FAF7F2', border: '1px solid #D4B896' }}>
              {role === 'student' ? (
                <form onSubmit={handleStudentSubmit} className="space-y-6">
                  <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(155,125,67,0.08)', border: '1px solid rgba(155,125,67,0.3)' }}>
                    <h4 className="font-semibold mb-1" style={{ color: '#9B7D43', fontFamily: "'Playfair Display', Georgia, serif" }}>Student Application</h4>
                    <p className="text-sm" style={{ color: '#5A5550' }}>Apply for our mentorship program to accelerate your learning.</p>
                  </div>
                  {studentError && (
                    <div className="p-4 rounded-xl text-sm" style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5', color: '#dc2626' }}>{studentError}</div>
                  )}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#1C1A17' }}>Full Name *</label>
                    <input type="text" name="fullName" value={studentData.fullName} onChange={handleStudentChange} required className={inputClass(false)} style={inputStyle} placeholder="Enter your full name" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: '#1C1A17' }}>Phone Number *</label>
                      <input type="tel" name="phone" value={studentData.phone} onChange={handleStudentChange} required className={inputClass(false)} style={inputStyle} placeholder="+91 1234567890" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: '#1C1A17' }}>Email *</label>
                      <input type="email" name="email" value={studentData.email} onChange={handleStudentChange} required className={inputClass(false)} style={inputStyle} placeholder="your.email@example.com" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#1C1A17' }}>Place *</label>
                    <input type="text" name="place" value={studentData.place} onChange={handleStudentChange} required className={inputClass(false)} style={inputStyle} placeholder="Enter your city/place" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#1C1A17' }}>Educational Qualifications *</label>
                    <textarea name="educationalQualifications" value={studentData.educationalQualifications} onChange={handleStudentChange} required rows="3" className={`${inputClass(false)} resize-none`} style={inputStyle} placeholder="e.g., B.Tech Computer Science, MCA, B.Sc IT, etc." />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#1C1A17' }}>Familiar Programming Languages & Stack *</label>
                    <textarea name="programmingLanguages" value={studentData.programmingLanguages} onChange={handleStudentChange} required rows="3" className={`${inputClass(false)} resize-none`} style={inputStyle} placeholder="e.g., JavaScript, React, Node.js, Python, Java, etc." />
                  </div>
                  <button type="submit" disabled={isStudentSubmitting}
                    className="w-full py-4 px-6 rounded-lg text-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
                    style={{ backgroundColor: '#1C1A17', color: '#F5F0E8' }}
                  >
                    {isStudentSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </span>
                    ) : 'Submit Student Application'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleMentorSubmit} className="space-y-6">
                  <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'rgba(155,125,67,0.08)', border: '1px solid rgba(155,125,67,0.3)' }}>
                    <h4 className="font-semibold mb-1" style={{ color: '#9B7D43', fontFamily: "'Playfair Display', Georgia, serif" }}>Mentor Application</h4>
                    <p className="text-sm" style={{ color: '#5A5550' }}>Share your expertise and guide the next generation of developers.</p>
                  </div>
                  {mentorApiError && (
                    <div className="p-4 rounded-xl text-sm" style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5', color: '#dc2626' }}>{mentorApiError}</div>
                  )}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#1C1A17' }}>Full Name *</label>
                    <input type="text" name="name" value={mentorData.name} onChange={handleMentorChange} required className={inputClass(mentorValidationErrors.name)} style={inputStyle} placeholder="Enter your full name" />
                    {mentorValidationErrors.name && <p className="mt-1 text-xs text-red-500">{mentorValidationErrors.name}</p>}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: '#1C1A17' }}>Email Address *</label>
                      <input type="email" name="email" value={mentorData.email} onChange={handleMentorChange} required className={inputClass(mentorValidationErrors.email)} style={inputStyle} placeholder="your.email@example.com" />
                      {mentorValidationErrors.email && <p className="mt-1 text-xs text-red-500">{mentorValidationErrors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2" style={{ color: '#1C1A17' }}>Phone Number *</label>
                      <input type="tel" name="phone" value={mentorData.phone} onChange={handleMentorChange} required className={inputClass(mentorValidationErrors.phone)} style={inputStyle} placeholder="+91 1234567890" />
                      {mentorValidationErrors.phone && <p className="mt-1 text-xs text-red-500">{mentorValidationErrors.phone}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#1C1A17' }}>Years of Experience * (Min 2 years)</label>
                    <input type="number" name="experience" value={mentorData.experience} onChange={handleMentorChange} required min="2"
                      className={inputClass(showExperienceWarning)} style={{ ...inputStyle, borderColor: showExperienceWarning ? '#f87171' : '#D4B896' }} placeholder="Enter years of experience" />
                    {showExperienceWarning && <p className="mt-2 text-sm font-medium text-red-500">⚠️ Minimum 2 years of experience required.</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#1C1A17' }}>Current Role / Position *</label>
                    <input type="text" name="currentRole" value={mentorData.currentRole} onChange={handleMentorChange} required className={inputClass(mentorValidationErrors.currentRole)} style={inputStyle} placeholder="e.g., Senior Software Engineer" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#1C1A17' }}>Technical Skills (Optional)</label>
                    <textarea name="skills" value={mentorData.skills} onChange={handleMentorChange} rows="3" className={`${inputClass(false)} resize-none`} style={inputStyle} placeholder="e.g., React, Node.js, AWS, etc." />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#1C1A17' }}>Weekly Availability *</label>
                    <select name="availability" value={mentorData.availability} onChange={handleMentorChange} required className={inputClass(false)} style={inputStyle}>
                      <option value="">Select availability</option>
                      <option value="2-5">2-5 hours per week</option>
                      <option value="5-10">5-10 hours per week</option>
                      <option value="10-15">10-15 hours per week</option>
                      <option value="15+">15+ hours per week</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#1C1A17' }}>LinkedIn Profile *</label>
                    <input type="text" name="linkedin" value={mentorData.linkedin} onChange={handleMentorChange} required className={inputClass(mentorValidationErrors.linkedin)} style={inputStyle} placeholder="https://linkedin.com/in/yourprofile" />
                  </div>
                  <button type="submit" disabled={isMentorSubmitting || showExperienceWarning}
                    className="w-full py-4 px-6 rounded-lg text-lg font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02]"
                    style={{ background: 'linear-gradient(135deg, #9B7D43, #C9A96E)', color: '#FAF7F2' }}
                  >
                    {isMentorSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Submitting...
                      </span>
                    ) : 'Submit Mentor Application'}
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
