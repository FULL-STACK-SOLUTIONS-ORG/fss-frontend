import React from 'react';
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#F5F0E8' }}>
    <div className="text-center">
      <div className="w-20 h-20 mx-auto mb-4">
        <div className="animate-spin rounded-full h-20 w-20 border-b-4" style={{ borderColor: '#9B7D43' }}></div>
      </div>
      <p className="font-medium" style={{ color: '#5A5550' }}>Loading...</p>
    </div>
  </div>
);
export default LoadingSpinner;
