import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaEnvelope, FaLock, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!formData.email || !formData.password) { setError('Please fill in all fields'); return; }
    setLoading(true);
    try {
      const result = await login(formData.email, formData.password);
      if (result.success) { navigate('/tick2test'); }
      else if (result.needsVerification) { navigate('/verify-otp', { state: { userId: result.userId, email: formData.email } }); }
    } catch (err) {
      if (err.needsVerification) { navigate('/verify-otp', { state: { userId: err.userId, email: formData.email } }); }
      else { setError(err.message || 'Invalid email or password'); }
    } finally { setLoading(false); }
  };
  const inputStyle = { backgroundColor: '#FAF7F2', color: '#1C1A17', borderColor: '#D4B896' };
  const focusStyle = 'focus:outline-none focus:ring-2 focus:ring-[#9B7D43] focus:border-transparent';
  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#F5F0E8' }}>
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-4xl font-bold mb-2" style={{ color: '#1C1A17', fontFamily: "'Playfair Display', Georgia, serif" }}>
            Welcome Back
          </h2>
          <p style={{ color: '#5A5550' }}>Login to continue your learning journey</p>
        </div>
        <div className="rounded-2xl shadow-lg p-8" style={{ backgroundColor: '#FAF7F2', border: '1px solid #D4B896' }}>
          {error && (
            <div className="mb-4 p-4 rounded-lg flex items-start gap-3" style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5' }}>
              <FaExclamationCircle className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold mb-2" style={{ color: '#1C1A17' }}>Email Address</label>
              <div className="relative">
                <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#9B7D43' }} />
                <input
                  id="email" name="email" type="email" required
                  value={formData.email} onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg ${focusStyle} placeholder-[#9A8A7A]`}
                  style={inputStyle} placeholder="Enter your email"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold mb-2" style={{ color: '#1C1A17' }}>Password</label>
              <div className="relative">
                <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#9B7D43' }} />
                <input
                  id="password" name="password" type="password" required
                  value={formData.password} onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-3 border-2 rounded-lg ${focusStyle} placeholder-[#9A8A7A]`}
                  style={inputStyle} placeholder="Enter your password"
                />
              </div>
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full py-3 px-4 font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#1C1A17', color: '#F5F0E8' }}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5" style={{ color: '#F5F0E8' }} fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Logging in...
                </span>
              ) : 'Log In'}
            </button>
          </form>
          <div className="mt-6 text-center">
            <p style={{ color: '#5A5550' }}>
              Don't have an account?{' '}
              <Link to="/signup" className="font-semibold transition-colors" style={{ color: '#9B7D43' }}
                onMouseEnter={e => e.currentTarget.style.color = '#6B4F2A'}
                onMouseLeave={e => e.currentTarget.style.color = '#9B7D43'}
              >Sign up</Link>
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
export default Login;
