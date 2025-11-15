import React from 'react';
import './Card.css';

/**
 * Card component - Linear-style card
 */
const Card = ({ 
  children, 
  className = '',
  hover = false,
  padding = 'lg',
  ...props 
}) => {
  const baseClass = 'card';
  const hoverClass = hover ? 'card-hover' : '';
  const paddingClass = `card-padding-${padding}`;
  
  return (
    <div
      className={`${baseClass} ${hoverClass} ${paddingClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;

