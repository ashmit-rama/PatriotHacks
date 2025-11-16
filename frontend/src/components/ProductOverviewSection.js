import React from 'react';
import { motion } from 'framer-motion';
import './ProductOverviewSection.css';
import SectionHeader from './ui/SectionHeader';
import Card from './ui/Card';

const ProductOverviewSection = () => {
  const features = [
    {
      title: 'Smart Contract Engine',
      description: 'Automatically generate secure, auditable smart contracts tailored to your business logic and requirements.'
    },
    {
      title: 'Tokenomics',
      description: 'Get a complete tokenomics model with token distribution, economic incentives, and reward mechanisms designed for your project.'
    },
    {
      title: 'Governance',
      description: 'Receive governance structures, voting mechanisms, and decision-making frameworks to manage your decentralized organization.'
    },
    {
      title: 'DApp Starter Code',
      description: 'Receive ready-to-deploy frontend and backend code with Web3 integration, authentication, and UI components.'
    },
    {
      title: 'Chain Selection & Deployment',
      description: 'Get recommendations for the best blockchain network and automated deployment scripts for seamless launch.'
    },
    {
      title: 'Web3 Libraries',
      description: 'Access pre-configured Web3 libraries and SDKs including wallet connectors, contract interaction tools, and blockchain utilities.'
    }
  ];

  return (
    <section id="product-overview" className="product-overview-section">
      <div className="product-overview-container">
        <SectionHeader
          title="From Idea to Launch"
          className="section-header-centered"
        />
        
        <div className="feature-cards-grid">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: [0.4, 0, 0.2, 1] }}
              whileHover={{ y: -4 }}
            >
              <Card padding="lg" hover className="feature-card">
                <motion.h3 
                  className="feature-card-title"
                  whileHover={{ scale: 1.02 }}
                >
                  {feature.title}
                </motion.h3>
                <p className="feature-card-description">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductOverviewSection;
