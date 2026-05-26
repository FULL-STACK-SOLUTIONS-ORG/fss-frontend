import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || '9061';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const enteredPassword = password.trim();
    try {
      if (enteredPassword === ADMIN_PASSWORD) {
        sessionStorage.setItem('adminAuthenticated', 'true');
        sessionStorage.setItem('adminLoginTime', Date.now().toString());
        navigate('/admin/dashboard');
      } else {
        setError('Invalid password. Please try again.');
      }
    } catch (err) {
      setError('Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F0E8] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-[#D4C9B8] p-8">
          <h1 className="text-3xl font-bold text-[#1C1A17] mb-8 text-center" style={{ fontFamily: 'Playfair Display, serif' }}>
            Admin Login
          </h1>
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-2 border-red-300 rounded-xl text-sm text-red-700">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 border-2 border-[#D4C9B8] rounded-xl focus:ring-0 focus:outline-none focus:border-[#9B7D43] transition-all placeholder-[#9A8A7A] bg-white text-[#1C1A17]"
                required
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full py-4 px-6 bg-[#9B7D43] hover:bg-[#7A6235] text-white font-semibold rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-md"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Logging in...
                </span>
              ) : (
                'Login'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
