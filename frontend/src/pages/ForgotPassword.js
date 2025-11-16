import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    try {
      await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setStatus({ type: 'success', message: 'If an account exists with this email, you will receive a reset link.' });
      setEmail('');
    } catch (error) {
      setStatus({ type: 'error', message: 'Unable to process request right now.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Card className="auth-card" padding="xl">
          <h1 className="auth-title">Reset your password</h1>
          
          <p className="auth-description">
            Enter your email and we'll send you a reset link.
          </p>
          {status && (
            <div className={`auth-status auth-status-${status.type}`}>
              {status.message}
            </div>
          )}
          <form onSubmit={handleSubmit} className="auth-form">
            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="auth-submit-button"
              loading={loading}
            >
              Send reset link
            </Button>
          </form>
          
          <div className="auth-links">
            <Link to="/login" className="auth-link">
              Back to log in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
