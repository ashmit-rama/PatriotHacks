import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';
import Button from './ui/Button';
import ThemeToggle from './ui/ThemeToggle';
import Logo from './ui/Logo';

const Navbar = ({
  activeTab,
  onTabChange,
  onOpenAuth = () => {},
  session = null,
  currentUser = null,
  onAccountClick = () => {},
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = ['/login', '/get-started', '/forgot-password', '/reset-password'].includes(location.pathname);
  const user = currentUser || session?.user || null;
  const displayName = user?.full_name
    ? user.full_name
    : user?.email
    ? user.email.split('@')[0]
    : null;

  const handleLogoClick = () => {
    if (onTabChange) {
      onTabChange('home');
    }
    navigate('/');
  };

  const handleTabClick = (tab) => {
    if (onTabChange) {
      onTabChange(tab);
    }
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
          <Logo variant="text" className="navbar-logo" />
        </div>
        
        {!isAuthPage && (
          <div className="navbar-tabs">
            <button 
              onClick={() => handleTabClick('home')} 
              className={`nav-tab ${activeTab === 'home' ? 'active' : ''}`}
            >
              Home
            </button>
            <button 
              onClick={() => handleTabClick('build')} 
              className={`nav-tab ${activeTab === 'build' ? 'active' : ''}`}
            >
              Build
            </button>
            <button 
              onClick={() => handleTabClick('stored-zips')} 
              className={`nav-tab ${activeTab === 'stored-zips' ? 'active' : ''}`}
            >
              Projects
            </button>
          </div>
        )}

        <div className="navbar-actions">
          <ThemeToggle />
          {user ? (
            <Button
              variant="primary"
              size="sm"
              className="navbar-account-button"
              onClick={onAccountClick}
            >
              {displayName}
            </Button>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => onOpenAuth('login')}>
                Log in
              </Button>
              <Button variant="primary" size="sm" onClick={() => onOpenAuth('signup')}>
                Get Started
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
