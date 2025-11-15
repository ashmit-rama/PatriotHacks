import React from 'react';
import './FinalCTASection.css';
import Button from './ui/Button';

const FinalCTASection = ({ onStartBuilding }) => {
  return (
    <section className="final-cta-section">
      <div className="final-cta-container">
        <h2 className="final-cta-title">Build the future. Faster.</h2>
        <div className="final-cta-actions">
          <Button variant="primary" size="lg" onClick={onStartBuilding}>
            Start building
          </Button>
          <Button variant="secondary" size="lg">
            Contact us
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FinalCTASection;
