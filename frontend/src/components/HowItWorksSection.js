import React from 'react';
import { motion } from 'framer-motion';
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
          className="section-header-centered"
        />
        <div className="steps-container">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.15, ease: [0.4, 0, 0.2, 1] }}
              whileHover={{ y: -6, scale: 1.02 }}
            >
              <Card padding="lg" hover className="step-card">
                <motion.div 
                  className="step-number"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {step.number}
                </motion.div>
                <motion.h3 
                  className="step-title"
                  whileHover={{ scale: 1.02 }}
                >
                  {step.title}
                </motion.h3>
                <p className="step-description">{step.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
