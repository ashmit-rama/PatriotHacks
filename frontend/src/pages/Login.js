import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const Login = ({ onAuthSuccess = () => {} }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
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
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Invalid email or password');
      }

      // 🔥 IMPORTANT: pull out the inner session object
      const sessionData = data.data || data;
      console.log('🔥 sessionData from login:', sessionData);

      // This updates AppRoutes -> session + currentUser
      onAuthSuccess(sessionData);

      navigate('/');
    } catch (error) {
      alert(error.message || 'Unable to log in.');
    }
  };



  return (
    <div className="auth-page">
      <div className="auth-container">
        <Card className="auth-card" padding="xl">
          <h1 className="auth-title">Log in to Kairo</h1>
          
          <form onSubmit={handleSubmit} className="auth-form">
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
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            
            <Button 
              type="submit" 
              variant="primary" 
              size="md" 
              className="auth-submit-button"
            >
              Log in
            </Button>
          </form>
          
          <div className="auth-links">
            <Link to="/get-started" className="auth-link">
              Don't have an account? Get started
            </Link>
            <Link to="/forgot-password" className="auth-link">
              Forgot password?
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Login;
