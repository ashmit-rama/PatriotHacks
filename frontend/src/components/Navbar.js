import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';
import Button from './ui/Button';
import ThemeToggle from './ui/ThemeToggle';
import Logo from './ui/Logo';

const Navbar = ({ activeTab, onTabChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthPage = ['/login', '/get-started', '/forgot-password'].includes(location.pathname);

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
          <Link to="/login" className="nav-link">
            <Button variant="ghost" size="sm">Log in</Button>
          </Link>
          <Link to="/get-started">
            <Button variant="primary" size="sm">Get Started</Button>
          </Link>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
