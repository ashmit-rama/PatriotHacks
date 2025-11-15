import React, { useState } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import ProblemSection from './components/ProblemSection';
import ProductOverviewSection from './components/ProductOverviewSection';
import HowItWorksSection from './components/HowItWorksSection';
import FinalCTASection from './components/FinalCTASection';
import Footer from './components/Footer';
import BuildSection from './components/BuildSection';
import StoredZipsSection from './components/StoredZipsSection';
import AnimatedBackground from './components/AnimatedBackground';

function App() {
  const [activeTab, setActiveTab] = useState('home');

  const handleStartBuilding = () => {
    setActiveTab('build');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'build':
        return <BuildSection />;
      case 'stored-zips':
        return <StoredZipsSection />;
      case 'home':
      default:
        return (
          <>
            <HeroSection onStartBuilding={handleStartBuilding} />
            <ProblemSection />
            <ProductOverviewSection />
            <HowItWorksSection />
            <FinalCTASection onStartBuilding={handleStartBuilding} />
          </>
        );
    }
  };

  return (
    <div className="app">
      <AnimatedBackground />
      <Navbar activeTab={activeTab} onTabChange={handleTabChange} />
      <main className="app-main">
        {renderContent()}
      </main>
      <Footer />
    </div>
  );
}

export default App;
