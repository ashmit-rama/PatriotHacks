import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './FinalCTASection.css';
import Button from './ui/Button';
import { submitContactMessage } from '../api';

const emptyForm = { name: '', email: '', message: '' };

const FinalCTASection = ({ onStartBuilding }) => {
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [contactForm, setContactForm] = useState(emptyForm);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const handleContactChange = (event) => {
    const { name, value } = event.target;
    setContactForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetContactState = () => {
    setIsContactOpen(false);
    setContactForm(emptyForm);
    setSending(false);
    setFeedback(null);
  };

  const handleContactSubmit = async (event) => {
    event.preventDefault();
    if (sending) return;

    const trimmed = {
      name: contactForm.name.trim(),
      email: contactForm.email.trim(),
      message: contactForm.message.trim(),
    };

    if (!trimmed.name || !trimmed.email || !trimmed.message) {
      setFeedback({ type: 'error', message: 'Please fill out all fields.' });
      return;
    }

    setSending(true);
    setFeedback(null);
    try {
      await submitContactMessage(trimmed);
      setFeedback({
        type: 'success',
        message: 'Thanks for reaching out! We will contact you shortly.',
      });
      setContactForm(emptyForm);
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err.message || 'Unable to send message right now.',
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="final-cta-section">
      <div className="final-cta-container">
        <motion.h2 
          className="final-cta-title"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        >
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{ display: 'block' }}
          >
            Build the future.
          </motion.span>
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            style={{ display: 'block' }}
          >
            Faster.
          </motion.span>
        </motion.h2>
        <motion.div 
          className="final-cta-actions"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button variant="primary" size="lg" onClick={onStartBuilding}>
              Start building
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button variant="secondary" size="lg" onClick={() => setIsContactOpen(true)}>
              Contact us
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {isContactOpen && (
        <div
          className="contact-modal-overlay"
          role="dialog"
          aria-modal="true"
          onClick={resetContactState}
        >
          <div
            className="contact-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="contact-modal-header">
              <h3>Contact us</h3>
              <button
                className="contact-close-button"
                aria-label="Close contact form"
                onClick={resetContactState}
              >
                &times;
              </button>
            </div>
            <p className="contact-modal-text">
              Share how we can help and we&apos;ll follow up via email.
            </p>
            <form className="contact-form" onSubmit={handleContactSubmit}>
              <label className="contact-label">
                Name
                <input
                  type="text"
                  name="name"
                  value={contactForm.name}
                  onChange={handleContactChange}
                  className="contact-input"
                  placeholder="Your name"
                />
              </label>
              <label className="contact-label">
                Email
                <input
                  type="email"
                  name="email"
                  value={contactForm.email}
                  onChange={handleContactChange}
                  className="contact-input"
                  placeholder="you@example.com"
                />
              </label>
              <label className="contact-label">
                Message
                <textarea
                  name="message"
                  rows="4"
                  value={contactForm.message}
                  onChange={handleContactChange}
                  className="contact-textarea"
                  placeholder="Tell us more about your project..."
                />
              </label>
              {feedback && (
                <div
                  className={`contact-feedback ${
                    feedback.type === 'error' ? 'error' : 'success'
                  }`}
                >
                  {feedback.message}
                </div>
              )}
              <div className="contact-actions">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={resetContactState}
                  disabled={sending}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  loading={sending}
                  disabled={sending}
                >
                  Send message
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};

export default FinalCTASection;
