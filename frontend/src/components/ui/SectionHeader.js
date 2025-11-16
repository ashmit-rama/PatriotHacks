import React from 'react';
import { motion } from 'framer-motion';
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
    <motion.div 
      className={`section-header ${className}`.trim()} 
      {...props}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      <div className="section-header-content">
        <div className="section-header-title-group">
          <motion.h2 
            className="section-header-title"
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            {title}
            {badge && <span className="section-header-badge">{badge}</span>}
          </motion.h2>
          {subtitle && (
            <motion.p 
              className="section-header-subtitle"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              {subtitle}
            </motion.p>
          )}
        </div>
        {actions && (
          <div className="section-header-actions">
            {actions}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default SectionHeader;

