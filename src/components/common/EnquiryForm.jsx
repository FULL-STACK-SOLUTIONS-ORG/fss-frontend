import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useEnquiry } from '../../hooks/useEnquiry';
const EnquiryForm = ({ isOpen, onClose }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);
  const [formData, setFormData] = useState({
    name: '',
    service: '',
    phone: '',
    email: '',
    message: ''
  });
  const [isSuccess, setIsSuccess] = useState(false);
  const {
    loading: isSubmitting,
    error: apiError,
    validationErrors,
    submitEnquiry,
    clearErrors
  } = useEnquiry();
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (apiError) clearErrors();
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    clearErrors();
    try {
      await submitEnquiry({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        service: formData.service,
        message: formData.message.trim()
      });
      setFormData({ name: '', service: '', phone: '', email: '', message: '' });
      setIsSuccess(true);
      setTimeout(() => { setIsSuccess(false); onClose(); }, 3000);
    } catch (error) {}
  };
  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({ name: '', service: '', phone: '', email: '', message: '' });
      setIsSuccess(false);
      clearErrors();
      onClose();
    }
  };
  if (!isOpen) return null;
  const inputClass = (hasError) => `w-full pl-12 pr-4 py-3 border-2 rounded-xl focus:ring-0 focus:outline-none transition-all ${hasError ? 'border-red-400' : 'border-[#E0D8CC] focus:border-[#9B7D43]'}`;
  const inputStyle = { backgroundColor: '#FAF7F2', color: '#1C1A17' };
  const modalContent = (
    <>
      <div
        className="fixed inset-0 backdrop-blur-md animate-fadeIn"
        onClick={() => !isSubmitting && handleClose()}
        style={{ zIndex: 99998, backgroundColor: 'rgba(28,26,23,0.5)' }}
      />
      <div
        className="fixed inset-0 flex items-center justify-center p-4 animate-fadeIn overflow-y-auto pointer-events-none"
        style={{ zIndex: 99999 }}
      >
        <div
          className="relative w-full max-w-lg rounded-2xl transform animate-scaleIn my-auto pointer-events-auto"
          style={{ backgroundColor: '#FAF7F2', border: '1px solid #D4B896', boxShadow: '0 25px 60px rgba(28,26,23,0.2)', zIndex: 100000 }}
        >
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="absolute -top-3 -right-3 z-20 w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 disabled:opacity-50 hover:scale-110"
            style={{ backgroundColor: '#FAF7F2', color: '#5A5550', border: '1.5px solid #D4B896' }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#fee2e2'; e.currentTarget.style.color = '#dc2626'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#FAF7F2'; e.currentTarget.style.color = '#5A5550'; }}
            aria-label="Close form"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="p-8">
            {isSuccess ? (
              <div className="text-center py-8">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-scaleIn" style={{ background: 'linear-gradient(135deg, #9B7D43, #C9A96E)' }}>
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-3xl font-bold mb-3" style={{ color: '#1C1A17', fontFamily: "'Playfair Display', Georgia, serif" }}>
                  Thank You!
                </h2>
                <p className="mb-6 text-lg" style={{ color: '#5A5550' }}>
                  Your enquiry has been submitted successfully.
                </p>
                <div className="rounded-xl p-5" style={{ backgroundColor: '#F0E8DC', border: '1px solid #D4B896' }}>
                  <p className="font-semibold text-base" style={{ color: '#6B4F2A' }}>
                    ✨ Our executive will contact you shortly!
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <h2 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#1C1A17', fontFamily: "'Playfair Display', Georgia, serif" }}>
                    Get In Touch
                  </h2>
                  <p className="text-sm mt-2" style={{ color: '#5A5550' }}>
                    Fill out the form below and we'll get back to you soon
                  </p>
                  <div className="w-24 h-1 mx-auto mt-4 rounded-full" style={{ background: 'linear-gradient(90deg, #9B7D43, #C9A96E, #9B7D43)' }}></div>
                </div>
                {apiError && (
                  <div className="mb-6 p-4 rounded-xl text-sm animate-fadeIn" style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5', color: '#dc2626' }}>
                    <div className="flex items-center gap-2">
                      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{apiError}</span>
                    </div>
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-5">
                  {[
                    { label: 'Full Name', name: 'name', type: 'text', placeholder: 'Enter your full name', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
                    { label: 'Phone Number', name: 'phone', type: 'tel', placeholder: '+91 1234567890', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
                    { label: 'Email Address', name: 'email', type: 'email', placeholder: 'your.email@example.com', icon: 'M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207' }
                  ].map(field => (
                    <div key={field.name}>
                      <label className="block text-sm font-semibold mb-2" style={{ color: '#1C1A17' }}>
                        {field.label} <span style={{ color: '#dc2626' }}>*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ color: '#9B7D43' }}>
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={field.icon} />
                          </svg>
                        </div>
                        <input
                          type={field.type}
                          name={field.name}
                          value={formData[field.name]}
                          onChange={handleInputChange}
                          placeholder={field.placeholder}
                          className={inputClass(validationErrors[field.name])}
                          style={inputStyle}
                          disabled={isSubmitting}
                        />
                      </div>
                      {validationErrors[field.name] && (
                        <p className="text-xs mt-1.5 flex items-center gap-1" style={{ color: '#dc2626' }}>
                          {validationErrors[field.name]}
                        </p>
                      )}
                    </div>
                  ))}
                  <div>
                    <label className="block text-sm font-semibold mb-2" style={{ color: '#1C1A17' }}>
                      Message
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={4}
                      placeholder="Tell us about your requirements..."
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-0 focus:outline-none transition-all resize-none ${validationErrors.message ? 'border-red-400' : 'border-[#E0D8CC] focus:border-[#9B7D43]'}`}
                      style={inputStyle}
                      disabled={isSubmitting}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="shiny-button w-full py-4 px-6 font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg text-base"
                    style={{ backgroundColor: '#1C1A17', color: '#F5F0E8' }}
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-[#F5F0E8]/30 border-t-[#F5F0E8] rounded-full animate-spin"></div>
                        Submitting...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Submit Enquiry
                      </span>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
  return createPortal(modalContent, document.body);
};
export default EnquiryForm;
