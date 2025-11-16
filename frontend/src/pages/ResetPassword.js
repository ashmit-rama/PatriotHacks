import React, { useMemo, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import './Auth.css';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function useQueryParam(name) {
  const location = useLocation();
  return useMemo(() => {
    const hashParams = new URLSearchParams(location.hash.replace(/^#/, ''));
    if (hashParams.get(name)) return hashParams.get(name);
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get(name) || '';
  }, [location, name]);
}

const ResetPassword = () => {
  const navigate = useNavigate();
  const token = useQueryParam('access_token');
  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      setStatus({ type: 'error', message: 'Reset token missing. Use the link from your email.' });
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match.' });
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: token, new_password: formData.password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.detail || data.error || 'Unable to update password.');
      }
      setStatus({ type: 'success', message: data.message || 'Password updated! Redirecting…' });
      setTimeout(() => navigate('/login'), 1500);
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Unable to update password.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Card className="auth-card" padding="xl">
          <h1 className="auth-title">Set a new password</h1>
          <p className="auth-description">
            Enter your new password and confirm it below.
          </p>
          {status && (
            <div className={`auth-status auth-status-${status.type}`}>
              {status.message}
            </div>
          )}
          <form onSubmit={handleSubmit} className="auth-form">
            <Input
              label="New password"
              type="password"
              name="password"
              placeholder="New password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <Input
              label="Confirm password"
              type="password"
              name="confirmPassword"
              placeholder="Confirm new password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
            <Button type="submit" variant="primary" size="md" loading={loading}>
              Update password
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

export default ResetPassword;
