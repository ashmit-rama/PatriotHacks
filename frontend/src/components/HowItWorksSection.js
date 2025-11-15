import React from 'react';
import './HowItWorksSection.css';
import SectionHeader from './ui/SectionHeader';
import Card from './ui/Card';

const HowItWorksSection = () => {
  const steps = [
    {
      number: '1',
      title: 'Type your idea',
      description: 'Describe your Web3 startup concept in plain language. No technical knowledge required.'
    },
    {
      number: '2',
      title: 'AI generates the blueprint',
      description: 'Our AI analyzes your idea and creates a complete framework with contracts, tokenomics, and code.'
    },
    {
      number: '3',
      title: 'Download or Deploy',
      description: 'Get your complete starter project as a downloadable zip or deploy directly to your preferred chain.'
    }
  ];

  return (
    <section className="how-it-works-section">
      <div className="how-it-works-container">
        <SectionHeader
          title="How It Works"
          subtitle="Get from idea to launch in three simple steps"
        />
        <div className="steps-container">
          {steps.map((step, index) => (
            <Card key={index} padding="lg" hover className="step-card">
              <div className="step-number">{step.number}</div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-description">{step.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
