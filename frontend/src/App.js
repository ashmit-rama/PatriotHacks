import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import Login from './pages/Login';
import GetStarted from './pages/GetStarted';
import ForgotPassword from './pages/ForgotPassword';

// Home page wrapper for the tabbed content
function HomePage({
  activeTab,
  setActiveTab,
  handleStartBuilding,
  handleTabChange,
  agentResult,
  setAgentResult,
}) {
  const renderContent = () => {
    switch (activeTab) {
      case 'build':
        return (
          <BuildSection
            agentResult={agentResult}
            setAgentResult={setAgentResult}
          />
        );
      case 'stored-zips':
        return (
          <StoredZipsSection
            agentResult={agentResult}
          />
        );
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
    <main className="app-main">
      {renderContent()}
    </main>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState('home');
  // ⬇️ full multi-agent backend response lives here
  const [agentResult, setAgentResult] = useState(null);

  const handleStartBuilding = () => {
    setActiveTab('build');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <BrowserRouter>
      <div className="app">
        <AnimatedBackground />
        <Navbar activeTab={activeTab} onTabChange={handleTabChange} />

        <Routes>
          <Route
            path="/login"
            element={
              <>
                <main className="app-main">
                  <Login />
                </main>
                <Footer />
              </>
            }
          />

          <Route
            path="/get-started"
            element={
              <>
                <main className="app-main">
                  <GetStarted />
                </main>
                <Footer />
              </>
            }
          />

          <Route
            path="/forgot-password"
            element={
              <>
                <main className="app-main">
                  <ForgotPassword />
                </main>
                <Footer />
              </>
            }
          />

          <Route
            path="/"
            element={
              <>
                <HomePage
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  handleStartBuilding={handleStartBuilding}
                  handleTabChange={handleTabChange}
                  agentResult={agentResult}
                  setAgentResult={setAgentResult}
                />
                <Footer />
              </>
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
