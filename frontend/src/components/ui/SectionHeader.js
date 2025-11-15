import React from 'react';
import './SectionHeader.css';

/**
 * SectionHeader component - Linear-style section header
 */
const SectionHeader = ({ 
  title,
  subtitle,
  badge,
  actions,
  className = '',
  ...props 
}) => {
  return (
    <div className={`section-header ${className}`.trim()} {...props}>
      <div className="section-header-content">
        <div className="section-header-title-group">
          <h2 className="section-header-title">
            {title}
            {badge && <span className="section-header-badge">{badge}</span>}
          </h2>
          {subtitle && (
            <p className="section-header-subtitle">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="section-header-actions">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default SectionHeader;

