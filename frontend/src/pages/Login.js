import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const Login = () => {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Implement authentication logic
    console.log('Login form submitted:', formData);
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

