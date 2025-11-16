import React from 'react';
import './Logo.css';

const Logo = ({ variant = 'full', className = '' }) => {
  if (variant === 'text') {
    // Simple text version for navbar
    return (
      <div className={`logo-text-only ${className}`}>
        <span className="logo-text-kairo">Kairo</span>
        <svg
          viewBox="0 0 20 20"
          className="logo-symbol-inline"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Abstract symbol - two horizontal bars with diagonal cut */}
          <g transform="translate(2, 7)">
            {/* Top bar with diagonal cut */}
            <rect x="0" y="0" width="8" height="3" rx="0.5" fill="currentColor" />
            <path d="M 8 0 L 10.5 2.5 L 8 3 Z" fill="currentColor" />
            {/* Bottom bar */}
            <rect x="0" y="5" width="8" height="3" rx="0.5" fill="currentColor" />
          </g>
        </svg>
      </div>
    );
  }

  // Full logo with dotted circle
  return (
    <div className={`logo-container ${className}`}>
      <svg
        viewBox="0 0 200 200"
        className="logo-svg"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Dotted circular outline - individual glowing dots */}
        {Array.from({ length: 24 }).map((_, i) => {
          const angle = (i * 360) / 24;
          const rad = (angle * Math.PI) / 180;
          const x = 100 + 90 * Math.cos(rad);
          const y = 100 + 90 * Math.sin(rad);
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="2.5"
              className="logo-dot"
            />
          );
        })}
        
        {/* Kairo text */}
        <text
          x="100"
          y="115"
          textAnchor="middle"
          className="logo-text"
          fontSize="32"
          fontWeight="700"
          letterSpacing="-0.02em"
        >
          Kairo
        </text>
        
        {/* Abstract symbol - two horizontal bars with diagonal cut */}
        <g className="logo-symbol" transform="translate(100, 100)">
          {/* Top bar with diagonal cut */}
          <rect x="25" y="-8" width="15" height="6" rx="1" className="logo-symbol-path" />
          <path d="M 40 -8 L 45 -3 L 40 -2 Z" className="logo-symbol-path" />
          {/* Bottom bar */}
          <rect x="25" y="2" width="15" height="6" rx="1" className="logo-symbol-path" />
        </g>
      </svg>
    </div>
  );
};

export default Logo;
