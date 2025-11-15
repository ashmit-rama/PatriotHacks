import React from 'react';
import './StoredZipsSection.css';
import SectionHeader from './ui/SectionHeader';
import Card from './ui/Card';

const StoredZipsSection = () => {
  return (
    <section className="stored-zips-section">
      <div className="stored-zips-container">
        <SectionHeader
          title="Your Stored Projects"
          subtitle="View and manage your previously generated Web3 project blueprints and starter code."
        />
        <Card padding="xl" className="stored-zips-empty">
          <p>No stored projects yet. Generate your first project to see it here!</p>
        </Card>
      </div>
    </section>
  );
};

export default StoredZipsSection;
