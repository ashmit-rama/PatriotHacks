import React from 'react';
import { motion } from 'framer-motion';
import './Footer.css';
import Logo from './ui/Logo';

const Footer = () => {
  const footerLinks = {
    Product: [
      { label: 'Overview', href: '#product-overview' },
      { label: 'How It Works', href: '#how-it-works' },
      { label: 'Docs', href: '#docs' }
    ],
    Company: [
      { label: 'About', href: '#about' },
      { label: 'Careers', href: '#careers' }
    ],
    Resources: [
      { label: 'Blog', href: '#blog' },
      { label: 'Community', href: '#community' },
      { label: 'Support', href: '#support' }
    ],
    Legal: [
      { label: 'Privacy', href: '#privacy' },
      { label: 'Terms', href: '#terms' }
    ]
  };

  return (
    <motion.footer 
      className="footer"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6 }}
    >
      <div className="footer-container">
        <motion.div 
          className="footer-brand-column"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Logo variant="text" className="footer-logo" />
          <p className="footer-tagline">
            Build your product. We'll handle the blockchain.
          </p>
        </motion.div>
        {Object.entries(footerLinks).map(([category, links], categoryIndex) => (
          <motion.div 
            key={category} 
            className="footer-column"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.2 + categoryIndex * 0.1 }}
          >
            <h3 className="footer-column-title">{category}</h3>
            <ul className="footer-links">
              {links.map((link, index) => (
                <motion.li 
                  key={index}
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <a href={link.href} className="footer-link">{link.label}</a>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
      <motion.div 
        className="footer-bottom"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: 0.6 }}
      >
        <p className="footer-copyright">© {new Date().getFullYear()} Kairo. All rights reserved.</p>
      </motion.div>
    </motion.footer>
  );
};

export default Footer;

