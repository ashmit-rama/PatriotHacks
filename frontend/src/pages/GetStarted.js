import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';


const GetStarted = ({ onSignupComplete = () => {} }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  console.log('Sign-up form submitted:', formData);

  // Basic validation
  if (formData.password !== formData.confirmPassword) {
    alert('Passwords do not match');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
        // backend only requires email + password; name can go into profiles later
      }),
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // show real error from backend if available
      throw new Error(data.error || data.detail || 'Unable to create account');
    }

    alert('Account created! Please confirm the email we just sent, then log in.');
    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
    onSignupComplete();
    navigate('/');
  } catch (err) {
    console.error('Signup failed:', err);
    alert(err.message || 'Failed to create account.');
  }
};

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Card className="auth-card" padding="xl">
          <h1 className="auth-title">Get started</h1>
          
          <form onSubmit={handleSubmit} className="auth-form">
            <Input
              label="Name"
              type="text"
              name="name"
              placeholder="Your name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            
            <Input
              label="Email"
              type="email"
              name="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
            
            <Input
              label="Password"
              type="password"
              name="password"
              placeholder="Create a password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            
            <Input
              label="Confirm Password"
              type="password"
              name="confirmPassword"
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            
            <Button 
              type="submit" 
              variant="primary" 
              size="md" 
              className="auth-submit-button"
            >
              Create account
            </Button>
          </form>
          
          <div className="auth-links">
            <Link to="/login" className="auth-link">
              Already have an account? Log in
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default GetStarted;
