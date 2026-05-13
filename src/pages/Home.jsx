import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '../components/home/Hero';
import Features from '../components/home/Features';
import HowItWorks from '../components/home/HowItWorks';
import RoadmapPreview from '../components/home/RoadmapPreview';
const Home = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return (
    <div className="home-page min-h-screen" style={{ backgroundColor: '#F5F0E8' }}>
      <Hero />
      <Features />
      <HowItWorks />
      <RoadmapPreview />
    </div>
  );
};
export default Home;
