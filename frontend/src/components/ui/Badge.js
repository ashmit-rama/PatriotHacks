import React from 'react';
import './Badge.css';

/**
 * Badge component - Linear-style badge
 */
const Badge = ({ 
  children, 
  variant = 'default',
  className = '',
  ...props 
}) => {
  const baseClass = 'badge';
  const variantClass = `badge-${variant}`;
  
  return (
    <span
      className={`${baseClass} ${variantClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;

