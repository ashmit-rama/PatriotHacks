import React from 'react';
import './Footer.css';

const Footer = () => {
  const footerLinks = {
    Product: [
      { label: 'Overview', href: '#overview' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'Docs', href: '#docs' },
      { label: 'Changelog', href: '#changelog' }
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
    <footer className="footer">
      <div className="footer-container">
        {Object.entries(footerLinks).map(([category, links]) => (
          <div key={category} className="footer-column">
            <h3 className="footer-column-title">{category}</h3>
            <ul className="footer-links">
              {links.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="footer-link">{link.label}</a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="footer-bottom">
        <p className="footer-copyright">© {new Date().getFullYear()} W3Connect. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;

