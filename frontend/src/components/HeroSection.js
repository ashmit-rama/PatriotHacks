import React from 'react';
import './HeroSection.css';
import Button from './ui/Button';
import Badge from './ui/Badge';

const HeroSection = ({ onStartBuilding }) => {
  const handleLearnMore = () => {
    const productSection = document.getElementById('product-overview');
    if (productSection) {
      productSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const features = [
    { icon: 'contract', label: 'Smart Contracts' },
    { icon: 'governance', label: 'Governance' },
    { icon: 'token', label: 'Tokenomics' },
    { icon: 'auth', label: 'Authentication' },
    { icon: 'deploy', label: 'Deployment' },
  ];

  const getFeatureIcon = (iconName) => {
    const icons = {
      contract: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="5" width="14" height="10" rx="1" />
          <path d="M7 5V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1v2" />
          <line x1="7" y1="10" x2="13" y2="10" />
        </svg>
      ),
      governance: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      token: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="10" cy="10" r="7" />
          <line x1="10" y1="3" x2="10" y2="17" />
          <line x1="3" y1="10" x2="17" y2="10" />
        </svg>
      ),
      auth: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="11" width="10" height="8" rx="1" />
          <path d="M5 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      ),
      deploy: (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M5 12l5-5 5 5" />
          <path d="M5 12h10" />
          <path d="M10 7v10" />
        </svg>
      ),
    };
    return icons[iconName] || icons.contract;
  };

  return (
    <section id="home" className="hero-section">
      <div className="hero-glow" />
      <div className="hero-container">
        <div className="hero-layout">
          {/* Left: Content */}
          <div className="hero-content">
            <div className="hero-badges">
              <Badge variant="accent">AI-Powered</Badge>
              <Badge variant="default">Web3</Badge>
              <Badge variant="default">Fast</Badge>
            </div>
            
            <h1 className="hero-title">
              Build your product.<br />
              We'll handle the blockchain.
            </h1>
            
            <p className="hero-subtitle">
              The first AI-powered platform that turns any idea into a complete Web3 startup blueprint. 
              Get smart contracts, governance, tokenomics, authentication, deployment, and starter code—all in one place.
            </p>

            {/* Feature icons */}
            <div className="hero-features">
              {features.map((feature, index) => (
                <div key={index} className="hero-feature-item">
                  <div className="hero-feature-icon">
                    {getFeatureIcon(feature.icon)}
                  </div>
                  <span className="hero-feature-label">{feature.label}</span>
                </div>
              ))}
            </div>
            
            <div className="hero-actions">
              <Button variant="primary" size="lg" onClick={onStartBuilding} className="hero-btn-primary">
                Start building
              </Button>
              <Button variant="secondary" size="lg" onClick={handleLearnMore} className="hero-btn-secondary">
                Learn more
                <span className="btn-arrow">→</span>
              </Button>
            </div>
          </div>

          {/* Right: Product Preview Card */}
          <div className="hero-preview">
            <div className="hero-preview-card">
              <div className="preview-header">
                <div className="preview-dots">
                  <span className="preview-dot"></span>
                  <span className="preview-dot"></span>
                  <span className="preview-dot"></span>
                </div>
                <div className="preview-title">Project Dashboard</div>
              </div>
              <div className="preview-content">
                <div className="preview-sidebar">
                  <div className="preview-sidebar-item active"></div>
                  <div className="preview-sidebar-item"></div>
                  <div className="preview-sidebar-item"></div>
                  <div className="preview-sidebar-item"></div>
                </div>
                <div className="preview-main">
                  <div className="preview-code-block">
                    <div className="code-line"></div>
                    <div className="code-line"></div>
                    <div className="code-line highlight"></div>
                    <div className="code-line"></div>
                    <div className="code-line"></div>
                  </div>
                  <div className="preview-stats">
                    <div className="preview-stat"></div>
                    <div className="preview-stat"></div>
                    <div className="preview-stat"></div>
                  </div>
                </div>
              </div>
            </div>
            <div className="preview-glow" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
