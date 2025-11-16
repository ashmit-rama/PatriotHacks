import React from 'react';
import './Navbar.css';
import Button from './ui/Button';
import ThemeToggle from './ui/ThemeToggle';
import Logo from './ui/Logo';

const Navbar = ({ activeTab, onTabChange }) => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="navbar-brand" onClick={() => onTabChange('home')} style={{ cursor: 'pointer' }}>
          <Logo variant="text" className="navbar-logo" />
        </div>
        
        <div className="navbar-tabs">
          <button 
            onClick={() => onTabChange('home')} 
            className={`nav-tab ${activeTab === 'home' ? 'active' : ''}`}
          >
            Home
          </button>
          <button 
            onClick={() => onTabChange('build')} 
            className={`nav-tab ${activeTab === 'build' ? 'active' : ''}`}
          >
            Build
          </button>
          <button 
            onClick={() => onTabChange('stored-zips')} 
            className={`nav-tab ${activeTab === 'stored-zips' ? 'active' : ''}`}
          >
            Projects
          </button>
        </div>

        <div className="navbar-actions">
          <Button variant="ghost" size="sm">Docs</Button>
          <ThemeToggle />
          <Button variant="primary" size="sm">Get Started</Button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
