import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaLock, FaUser, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorIsExisting, setErrorIsExisting] = useState(false);
  const [success, setSuccess] = useState('');
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
    setErrorIsExisting(false);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setErrorIsExisting(false); setSuccess('');
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) { setError('Please fill in all fields'); return; }
    if (formData.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (formData.password !== formData.confirmPassword) { setError('Passwords do not match'); return; }
    setLoading(true);
    try {
      const result = await signup(formData.email, formData.password, formData.name);
      if (result.success) {
        setSuccess(result.message);
        setTimeout(() => { navigate('/verify-otp', { state: { userId: result.userId, email: formData.email } }); }, 1500);
      }
    } catch (err) {
      const msg = err.message || '';
      if (msg.includes('User already exists') || msg.includes('already exists')) {
        setError('An account with this email already exists.');
        setErrorIsExisting(true);
      } else if (msg.includes('provide all required')) {
        setError('Please fill in all fields before submitting.');
      } else if (msg.includes('Network') || msg.includes('fetch')) {
        setError('Unable to connect to the server. Please check your internet connection and try again.');
      } else {
        setError(msg || 'Something went wrong. Please try again.');
      }
    }
    finally { setLoading(false); }
  };
  const inputStyle = { backgroundColor: '#FAF7F2', color: '#1C1A17', borderColor: '#D4B896' };
  const focusStyle = 'focus:outline-none focus:ring-2 focus:ring-[#9B7D43] focus:border-transparent';
  const fields = [
    { id: 'name', label: 'Full Name', type: 'text', icon: FaUser, placeholder: 'Enter your full name' },
    { id: 'email', label: 'Email Address', type: 'email', icon: FaEnvelope, placeholder: 'Enter your email' },
    { id: 'password', label: 'Password', type: 'password', icon: FaLock, placeholder: 'At least 6 characters' },
    { id: 'confirmPassword', label: 'Confirm Password', type: 'password', icon: FaLock, placeholder: 'Re-enter your password' },
  ];
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F5F0E8' }}>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-2" style={{ color: '#1C1A17', fontFamily: "'Playfair Display', Georgia, serif" }}>
            Create Account
          </h2>
          <p style={{ color: '#5A5550' }}>Join Full Stack Solutions and start learning</p>
        </div>
        <div className="rounded-2xl shadow-lg p-8" style={{ backgroundColor: '#FAF7F2', border: '1px solid #D4B896' }}>
          {error && (
            <div className="mb-4 p-4 rounded-lg flex items-start gap-3" style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5' }}>
              <FaExclamationCircle className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-red-600 text-sm">
                {error}{' '}
                {errorIsExisting && (
                  <Link to="/login" className="font-semibold underline" style={{ color: '#b91c1c' }}>Log in instead</Link>
                )}
              </p>
            </div>
          )}
          {success && (
            <div className="mb-4 p-4 rounded-lg flex items-start gap-3" style={{ backgroundColor: '#dcfce7', border: '1px solid #86efac' }}>
              <FaCheckCircle className="text-green-600 mt-0.5 flex-shrink-0" />
              <p className="text-green-700 text-sm">{success}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            {fields.map(({ id, label, type, icon: Icon, placeholder }) => (
              <div key={id}>
                <label htmlFor={id} className="block text-sm font-semibold mb-2" style={{ color: '#1C1A17' }}>{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#9B7D43' }} />
                  <input
                    id={id} name={id} type={type} required
                    value={formData[id]} onChange={handleChange}
                    className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg ${focusStyle} placeholder-[#9A8A7A]`}
                    style={inputStyle} placeholder={placeholder}
                  />
                </div>
              </div>
            ))}
            <button
              type="submit" disabled={loading}
              className="w-full py-3 px-4 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#1C1A17', color: '#F5F0E8' }}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating account...
                </span>
              ) : 'Sign Up'}
            </button>
          </form>
          <div className="mt-6 text-center">
            <p style={{ color: '#5A5550' }}>
              Already have an account?{' '}
              <Link to="/login" className="font-semibold transition-colors" style={{ color: '#9B7D43' }}
                onMouseEnter={e => e.currentTarget.style.color = '#6B4F2A'}
                onMouseLeave={e => e.currentTarget.style.color = '#9B7D43'}
              >Log in</Link>
            </p>
          </div>
        </div>
        <div className="text-center">
          <Link to="/" className="transition-colors text-sm" style={{ color: '#5A5550' }}
            onMouseEnter={e => e.currentTarget.style.color = '#1C1A17'}
            onMouseLeave={e => e.currentTarget.style.color = '#5A5550'}
          >← Back to Home</Link>
        </div>
      </div>
    </div>
  );
};
export default Signup;
