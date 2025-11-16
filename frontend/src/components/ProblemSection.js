import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './ProblemSection.css';

const ProblemSection = () => {
  const [hoveredNode, setHoveredNode] = useState(null);

  const challenges = [
    {
      id: 1,
      title: 'Wallet Integration',
      description: 'Confusion around wallet integration and management',
      icon: 'wallet',
      angle: 0, // degrees from top
    },
    {
      id: 2,
      title: 'Chain Selection',
      description: 'Uncertainty about which blockchain chain to choose',
      icon: 'link',
      angle: 51.4, // 360 / 7
    },
    {
      id: 3,
      title: 'Smart Contracts',
      description: 'Complexity of writing and deploying smart contracts',
      icon: 'code',
      angle: 102.8,
    },
    {
      id: 4,
      title: 'Tokenomics Design',
      description: 'Challenges with tokenomics design and token creation',
      icon: 'chart',
      angle: 154.2,
    },
    {
      id: 5,
      title: 'Governance Structure',
      description: 'Governance structure and decision-making frameworks',
      icon: 'users',
      angle: 205.6,
    },
    {
      id: 6,
      title: 'User Onboarding',
      description: 'Web3 authentication and user onboarding',
      icon: 'key',
      angle: 257.0,
    },
    {
      id: 7,
      title: 'Deployment',
      description: 'Deployment and infrastructure setup',
      icon: 'rocket',
      angle: 308.4,
    },
  ];

  const getIconSVG = (iconName) => {
    const icons = {
      wallet: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="7" width="20" height="14" rx="2" />
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </svg>
      ),
      link: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
        </svg>
      ),
      code: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="16 18 22 12 16 6" />
          <polyline points="8 6 2 12 8 18" />
        </svg>
      ),
      chart: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="12" y1="20" x2="12" y2="10" />
          <line x1="18" y1="20" x2="18" y2="4" />
          <line x1="6" y1="20" x2="6" y2="16" />
        </svg>
      ),
      users: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      key: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
        </svg>
      ),
      rocket: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
          <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
          <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
          <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
        </svg>
      ),
    };
    return icons[iconName] || icons.wallet;
  };

  return (
    <section className="problem-section">
      <div className="problem-container">
        <div className="problem-layout">
          {/* Left Column: Text Content */}
          <motion.div 
            className="problem-content-column"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          >
            <motion.div 
              className="problem-overline"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              Why Web3
            </motion.div>
            <motion.h2 
              className="problem-heading"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
            >
              A new ownership layer for the internet
            </motion.h2>
            <motion.p 
              className="problem-body"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
            >
              Web3 lets founders build products where users actually own their assets, identities, and data. Tokens, smart contracts, and decentralized infrastructure unlock new business models—but they also add a huge amount of technical complexity.
            </motion.p>
            <motion.ul 
              className="problem-benefits"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              {[
                'Programmable value with tokens and smart contracts',
                'Global, permissionless access from day one',
                'Built-in composability with existing protocols',
                'Community-driven growth through governance and incentives'
              ].map((benefit, index) => (
                <motion.li
                  key={index}
                  className="problem-benefit-item"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                  whileHover={{ x: 4 }}
                >
                  {benefit}
                </motion.li>
              ))}
            </motion.ul>
          </motion.div>

          {/* Right Column: Circular Diagram */}
          <div className="problem-diagram-column">
            <div className="circular-diagram-container">
          {/* Animated background halo */}
          <div className="diagram-halo" />
          
          {/* Central node */}
          <div className="central-node">
            <div className="central-node-content">
              <div className="central-node-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              </div>
              <h3 className="central-node-title">Web3 Founder Challenges</h3>
            </div>
          </div>

          {/* Outer ring */}
          <div className="outer-ring" />
          
          {/* Connecting lines */}
          <svg className="connection-lines" viewBox="0 0 600 600" preserveAspectRatio="xMidYMid meet">
            {challenges.map((challenge) => {
              const centerX = 300;
              const centerY = 300;
              const radius = 200;
              const angleRad = (challenge.angle * Math.PI) / 180;
              const x = centerX + radius * Math.sin(angleRad);
              const y = centerY - radius * Math.cos(angleRad);
              
              return (
                <line
                  key={challenge.id}
                  x1={centerX}
                  y1={centerY}
                  x2={x}
                  y2={y}
                  className="connection-line"
                />
              );
            })}
          </svg>

          {/* Outer nodes */}
          <div className="outer-nodes">
            {challenges.map((challenge) => {
              const angleRad = (challenge.angle * Math.PI) / 180;
              const radius = 200; // pixels from center
              const x = Math.sin(angleRad) * radius;
              const y = -Math.cos(angleRad) * radius;
              
              return (
                <div
                  key={challenge.id}
                  className={`outer-node ${hoveredNode === challenge.id ? 'hovered' : ''}`}
                  style={{
                    '--angle': `${challenge.angle}deg`,
                    '--x': `${x}px`,
                    '--y': `${y}px`,
                  }}
                  onMouseEnter={() => setHoveredNode(challenge.id)}
                  onMouseLeave={() => setHoveredNode(null)}
                >
                  <div className="outer-node-circle">
                    <div className="outer-node-icon">
                      {getIconSVG(challenge.icon)}
                    </div>
                  </div>
                  <div className="outer-node-content">
                    <h4 className="outer-node-title">{challenge.title}</h4>
                    <p className={`outer-node-description ${hoveredNode === challenge.id ? 'visible' : ''}`}>
                      {challenge.description}
                    </p>
                  </div>
                </div>
              );
            })}
            </div>
          </div>
          </div>
        </div>

        {/* Mobile: Vertical list */}
        <div className="challenges-list-mobile">
          {challenges.map((challenge) => (
            <div key={challenge.id} className="challenge-item-mobile">
              <div className="challenge-icon-mobile">
                {getIconSVG(challenge.icon)}
              </div>
              <div className="challenge-content-mobile">
                <h4 className="challenge-title-mobile">{challenge.title}</h4>
                <p className="challenge-description-mobile">{challenge.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
