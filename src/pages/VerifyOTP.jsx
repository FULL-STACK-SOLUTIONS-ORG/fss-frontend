import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaCheckCircle, FaExclamationCircle, FaClock } from 'react-icons/fa';
const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyOTP, resendOTP } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const userId = location.state?.userId;
  const email = location.state?.email;
  useEffect(() => {
    if (!userId) {
      navigate('/signup');
    }
  }, [userId, navigate]);
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; 
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); 
    setOtp(newOtp);
    setError('');
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`).focus();
    }
    if (index === 5 && value && newOtp.every(digit => digit !== '')) {
      handleVerify(newOtp.join(''));
    }
  };
  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`).focus();
    }
  };
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6).split('');
    if (pastedData.every(char => /^\d$/.test(char))) {
      const newOtp = [...otp];
      pastedData.forEach((char, index) => {
        if (index < 6) newOtp[index] = char;
      });
      setOtp(newOtp);
      if (pastedData.length === 6) {
        handleVerify(newOtp.join(''));
      }
    }
  };
  const handleVerify = async (otpCode = null) => {
    const otpToVerify = otpCode || otp.join('');
    if (otpToVerify.length !== 6) {
      setError('Please enter a 6-digit OTP');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const result = await verifyOTP(userId, otpToVerify);
      if (result.success) {
        setSuccess('Email verified successfully! Redirecting...');
        setTimeout(() => {
          navigate('/tick2test');
        }, 1500);
      }
    } catch (err) {
      setError(err.message || 'Invalid or expired OTP');
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-0').focus();
    } finally {
      setLoading(false);
    }
  };
  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const result = await resendOTP(userId);
      if (result.success) {
        setSuccess('OTP resent successfully! Check your email.');
        setResendCooldown(60); 
        setOtp(['', '', '', '', '', '']);
        document.getElementById('otp-0').focus();
      }
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {}
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-teal-500/20 rounded-full flex items-center justify-center mb-4">
            <FaClock className="text-teal-500 text-3xl" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-2">
            Verify Your Email
          </h2>
          <p className="text-slate-400">
            We've sent a 6-digit code to
          </p>
          <p className="text-teal-400 font-medium mt-1">
            {email}
          </p>
        </div>
        {/* Form Card */}
        <div className="bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-700">
          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-900/30 border border-red-500 rounded-lg flex items-start gap-3">
              <FaExclamationCircle className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}
          {/* Success Message */}
          {success && (
            <div className="mb-6 p-4 bg-green-900/30 border border-green-500 rounded-lg flex items-start gap-3">
              <FaCheckCircle className="text-green-500 mt-0.5 flex-shrink-0" />
              <p className="text-green-400 text-sm">{success}</p>
            </div>
          )}
          {/* OTP Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-300 mb-4 text-center">
              Enter OTP
            </label>
            <div className="flex justify-center gap-2" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-12 h-14 text-center text-2xl font-bold bg-slate-700 border-2 border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  disabled={loading}
                />
              ))}
            </div>
          </div>
          {/* Verify Button */}
          <button
            onClick={() => handleVerify()}
            disabled={loading || otp.some(digit => digit === '')}
            className="w-full py-3 px-4 bg-gradient-to-r from-teal-500 to-blue-600 text-white font-semibold rounded-lg hover:from-teal-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Verifying...
              </span>
            ) : (
              'Verify Email'
            )}
          </button>
          {/* Resend OTP */}
          <div className="mt-6 text-center">
            <p className="text-slate-400 text-sm mb-2">
              Didn't receive the code?
            </p>
            <button
              onClick={handleResend}
              disabled={loading || resendCooldown > 0}
              className="text-teal-400 hover:text-teal-300 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {resendCooldown > 0 
                ? `Resend OTP in ${resendCooldown}s` 
                : 'Resend OTP'}
            </button>
          </div>
        </div>
        {}
        <div className="text-center">
          <Link to="/signup" className="text-slate-400 hover:text-white transition-colors text-sm">
            ← Back to Signup
          </Link>
        </div>
      </div>
    </div>
  );
};
export default VerifyOTP;
