import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement password reset logic
    console.log('Password reset requested for:', email);
    alert('If an account exists with this email, you will receive a reset link.');
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Card className="auth-card" padding="xl">
          <h1 className="auth-title">Reset your password</h1>
          
          <p className="auth-description">
            Enter your email and we'll send you a reset link.
          </p>
          
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

