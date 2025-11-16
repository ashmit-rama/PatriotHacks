import React, { useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
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

function HomePage({
  activeTab,
  setActiveTab,
  handleStartBuilding,
  handleTabChange,
  projects,
  onProjectGenerated,
  onProjectDeleted,
}) {
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

const API_BASE = 'http://localhost:8000';

function AppRoutes() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  // ⬇️ full multi-agent backend response lives here
  const [agentResult, setAgentResult] = useState(null);
  const [session, setSession] = useState(() => {
    try {
      const raw = localStorage.getItem('kairo.session');
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      console.warn('Failed to parse stored session', error);
      return null;
    }
  });
  const [currentUser, setCurrentUser] = useState(null);
  const [projects, setProjects] = useState(() => {
    try {
      const raw = localStorage.getItem('kairo.projects');
      return raw ? JSON.parse(raw) : [];
    } catch (error) {
      console.warn('Failed to parse stored projects', error);
      return [];
    }
  });

  const handleStartBuilding = () => {
    setActiveTab('build');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const persistSession = useCallback((payload) => {
    if (payload) {
      localStorage.setItem('kairo.session', JSON.stringify(payload));
    } else {
      localStorage.removeItem('kairo.session');
    }
    setSession(payload);
  }, []);

  const fetchCurrentUser = useCallback(async (accessToken) => {
    if (!accessToken) {
      setCurrentUser(null);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!res.ok) {
        throw new Error('Unable to load profile');
      }
      const data = await res.json();
      setCurrentUser(data);
    } catch (error) {
      console.error('Failed to fetch current user', error);
      // don't clear session here
    }
  }, []);


  useEffect(() => {
    if (session?.user) {
      // We already know who the user is (from login)
      setCurrentUser(session.user);
    } else if (session?.access_token) {
      // No user object stored, try to fetch it
      fetchCurrentUser(session.access_token);
    } else {
      setCurrentUser(null);
    }
  }, [session, fetchCurrentUser]);

  const handleAuthSuccess = useCallback((payload) => {
    console.log('✅ handleAuthSuccess payload:', payload);
    persistSession(payload);
    if (payload?.user) {
      console.log('✅ setting currentUser from payload.user:', payload.user);
      setCurrentUser(payload.user);
    } else if (payload?.access_token) {
      console.log('ℹ️ no payload.user, fetching via /auth/me');
      fetchCurrentUser(payload.access_token);
    }
    setActiveTab('home');
    navigate('/');
  }, [persistSession, navigate, fetchCurrentUser]);

  const handleLogout = useCallback(async () => {
    try {
      if (session?.access_token) {
        await fetch(`${API_BASE}/auth/logout`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: session.access_token }),
        });
      }
    } catch (error) {
      console.warn('Logout request failed', error);
    } finally {
      persistSession(null);
      setCurrentUser(null);
      setActiveTab('home');
      navigate('/');
    }
  }, [session, persistSession, navigate]);

  const handleSignupComplete = useCallback(() => {
    setActiveTab('home');
    navigate('/');
  }, [navigate]);

  const handleProjectSaved = useCallback((project) => {
    setProjects((prev) => {
      const next = [...prev, project];
      localStorage.setItem('kairo.projects', JSON.stringify(next));
      return next;
    });
  }, []);

  const handleProjectDeleted = useCallback((projectId) => {
    setProjects((prev) => {
      const next = prev.filter((project) => project.id !== projectId);
      localStorage.setItem('kairo.projects', JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <div className="app">
      <AnimatedBackground />
      <Navbar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onOpenAuth={(mode) => {
          if (mode === 'login') {
            navigate('/login');
          } else {
            navigate('/get-started');
          }
        }}
        session={session}
        currentUser={currentUser}
        onAccountClick={() => navigate('/settings')}
      />
      <Routes>
        <Route
          path="/login"
          element={
            <>
              <main className="app-main">
                <Login onAuthSuccess={handleAuthSuccess} />
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
                <GetStarted onSignupComplete={handleSignupComplete} />
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
          path="/reset-password"
          element={
            <>
              <main className="app-main">
                <ResetPassword />
              </main>
              <Footer />
            </>
          }
        />
        <Route
          path="/settings"
          element={
            <>
              <main className="app-main">
                <AccountSettings user={currentUser} onLogout={handleLogout} />
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
                projects={projects}
                onProjectGenerated={handleProjectSaved}
                onProjectDeleted={handleProjectDeleted}
              />
              <Footer />
            </>
          }
        />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
