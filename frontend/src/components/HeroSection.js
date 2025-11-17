import React from 'react';
import { motion } from 'framer-motion';
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
          <motion.div 
            className="hero-content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <motion.div 
              className="hero-badges"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Badge variant="accent">AI-Powered</Badge>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <Badge variant="default">Web3</Badge>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <Badge variant="default">Fast</Badge>
              </motion.div>
            </motion.div>
            
            <motion.h1 
              className="hero-title"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
            >
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                style={{ display: 'block' }}
              >
                Build your product.
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                style={{ display: 'block' }}
              >
                We'll handle the blockchain.
              </motion.span>
            </motion.h1>
            
            <motion.p 
              className="hero-subtitle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7, ease: [0.4, 0, 0.2, 1] }}
            >
              The first AI-powered platform that turns any idea into a complete Web3 startup blueprint. 
              Get smart contracts, governance, tokenomics, authentication, deployment, and starter code—all in one place.
            </motion.p>

            {/* Feature icons */}
            <motion.div 
              className="hero-features"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.9 }}
            >
              {features.map((feature, index) => (
                <motion.div 
                  key={index} 
                  className="hero-feature-item"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 1 + index * 0.1 }}
                  whileHover={{ scale: 1.05, x: 4 }}
                >
                  <div className="hero-feature-icon">
                    {getFeatureIcon(feature.icon)}
                  </div>
                  <span className="hero-feature-label">{feature.label}</span>
                </motion.div>
              ))}
            </motion.div>
            
            <motion.div 
              className="hero-actions"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.4 }}
            >
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button variant="primary" size="lg" onClick={onStartBuilding} className="hero-btn-primary">
                  Start building
                </Button>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button variant="secondary" size="lg" onClick={handleLearnMore} className="hero-btn-secondary">
                  Learn more
                  <span className="btn-arrow">→</span>
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Right: Animated Blockchain Design */}
          <motion.div 
            className="hero-blockchain"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            <div className="blockchain-container">
              <svg 
                viewBox="0 0 400 400" 
                className="blockchain-svg"
                style={{ width: '100%', height: '100%', maxWidth: '500px', maxHeight: '500px' }}
              >
                <defs>
                  <radialGradient id="centralGradient">
                    <stop offset="0%" stopColor="#a78bfa" stopOpacity="1" />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.8" />
                  </radialGradient>
                  <filter id="glow">
                    <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                  <filter id="glow-strong">
                    <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                    <feMerge>
                      <feMergeNode in="coloredBlur"/>
                      <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                  </filter>
                </defs>
                
                {/* Central glowing circle with diamond */}
                <motion.g
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
                >
                  <motion.circle
                    cx="200"
                    cy="200"
                    r="50"
                    fill="url(#centralGradient)"
                    filter="url(#glow-strong)"
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.8, 1, 0.8],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  
                  {/* White Square - Centered */}
                  <motion.rect
                    x="175"
                    y="175"
                    width="50"
                    height="50"
                    fill="#ffffff"
                    opacity={0.98}
                    rx="4"
                    initial={{ scale: 0, rotate: 0 }}
                    animate={{ 
                      scale: 1, 
                      rotate: 0,
                    }}
                    transition={{ duration: 0.8, delay: 0.7, ease: [0.4, 0, 0.2, 1] }}
                    filter="url(#glow)"
                  />
                  
                  {/* Rhombus/Diamond inside square */}
                  <motion.polygon
                    points="200,185 215,200 200,215 185,200"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    opacity={0.9}
                    initial={{ scale: 0, rotate: 45 }}
                    animate={{ 
                      scale: 1, 
                      rotate: 45,
                    }}
                    transition={{ duration: 0.6, delay: 0.9, ease: [0.4, 0, 0.2, 1] }}
                  />
                  
                  {/* Additional inner rhombus for depth */}
                  <motion.polygon
                    points="200,190 210,200 200,210 190,200"
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="1"
                    opacity={0.5}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 1.1 }}
                  />
                </motion.g>

                {/* 8 surrounding circles */}
                {[
                  { angle: 0, x: 200, y: 100 },      // Top
                  { angle: 45, x: 300, y: 100 },     // Top-right
                  { angle: 90, x: 300, y: 200 },     // Right
                  { angle: 135, x: 300, y: 300 },    // Bottom-right
                  { angle: 180, x: 200, y: 300 },    // Bottom
                  { angle: 225, x: 100, y: 300 },    // Bottom-left
                  { angle: 270, x: 100, y: 200 },    // Left
                  { angle: 315, x: 100, y: 100 },    // Top-left
                ].map((pos, index) => (
                  <motion.g key={`circle-${index}`}>
                    <motion.circle
                      cx={pos.x}
                      cy={pos.y}
                      r="20"
                      fill={`rgba(${index % 2 === 0 ? '139, 92, 246' : '99, 102, 241'}, 0.8)`}
                      filter="url(#glow)"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ 
                        scale: [1, 1.2, 1],
                        opacity: [0.6, 1, 0.6],
                      }}
                      transition={{
                        duration: 2 + index * 0.2,
                        repeat: Infinity,
                        delay: index * 0.1,
                        ease: "easeInOut",
                      }}
                    />
                  </motion.g>
                ))}

                {/* 4 pill-shaped outlines */}
                {[
                  { x: 250, y: 150, rotation: 45 },
                  { x: 250, y: 250, rotation: -45 },
                  { x: 150, y: 250, rotation: 45 },
                  { x: 150, y: 150, rotation: -45 },
                ].map((pos, index) => (
                  <motion.g 
                    key={`pill-${index}`}
                    transform={`translate(${pos.x}, ${pos.y}) rotate(${pos.rotation})`}
                  >
                    <motion.ellipse
                      cx="0"
                      cy="0"
                      rx="30"
                      ry="12"
                      fill="none"
                      stroke={`rgba(${index % 2 === 0 ? '167, 139, 250' : '139, 92, 246'}, 0.6)`}
                      strokeWidth="2"
                      filter="url(#glow)"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ 
                        scale: [1, 1.15, 1],
                        opacity: [0.4, 0.8, 0.4],
                      }}
                      transition={{
                        duration: 2.5 + index * 0.3,
                        repeat: Infinity,
                        delay: 1 + index * 0.15,
                        ease: "easeInOut",
                      }}
                    />
                  </motion.g>
                ))}
              </svg>
            </div>
            <div className="blockchain-glow" />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
