import React, { useState } from 'react';
import Card from './Card';
import './CollapsibleCard.css';

const CollapsibleCard = ({ 
  title, 
  icon, 
  children, 
  defaultExpanded = true,
  className = '',
  padding = 'md',
  ...props 
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <Card className={`collapsible-card ${className}`.trim()} padding={padding} {...props}>
      <div 
        className="collapsible-card-header"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{ cursor: 'pointer' }}
      >
        <div className="collapsible-card-header-left">
          {icon && <span className="collapsible-card-icon">{icon}</span>}
          <h4 className="collapsible-card-title">{title}</h4>
        </div>
        <svg
          className={`collapsible-card-caret ${isExpanded ? 'expanded' : ''}`}
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M4 6l4 4 4-4" />
        </svg>
      </div>
      {isExpanded && (
        <div className="collapsible-card-content">
          {children}
        </div>
      )}
    </Card>
  );
};

export default CollapsibleCard;
