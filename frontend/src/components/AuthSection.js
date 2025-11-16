import React, { useEffect, useState } from 'react';
import './AuthSection.css';
import Card from './ui/Card';
import Button from './ui/Button';
import SectionHeader from './ui/SectionHeader';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const AuthSection = ({
  initialMode = 'signup',
  session,
  onAuthSuccess = () => {},
  onLogout = () => {},
}) => {
  const [mode, setMode] = useState(initialMode);

  const [signupForm, setSignupForm] = useState({ email: '', password: '', fullName: '' });
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetForm, setResetForm] = useState({ accessToken: '', newPassword: '' });
  const [profile, setProfile] = useState(null);

  const [status, setStatus] = useState({ type: null, message: '' });
  const [loading, setLoading] = useState(false);

  const updateStatus = (type, message) => setStatus({ type, message });

  const handleSignup = async (event) => {
    event.preventDefault();
    console.log("🔥 handleSignup called with", signupForm);
    setLoading(true);
    updateStatus(null, '');
    try {
      const response = await fetch(`${API_BASE}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: signupForm.email,
          password: signupForm.password,
          full_name: signupForm.fullName || undefined,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Unable to create account');
      updateStatus('success', 'Account created! Please confirm your email, then log in.');
      setSignupForm({ email: '', password: '', fullName: '' });
      setMode('login');
    } catch (error) {
      updateStatus('error', error.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    updateStatus(null, '');
    try {
      const response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.error || data.detail || 'Invalid email or password');
      }
      onAuthSuccess(data.data);
      updateStatus('success', 'Logged in successfully.');
      setMode('profile');
    } catch (error) {
      updateStatus('error', error.message || 'Unable to log in.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    if (!session?.access_token) {
      onLogout();
      setProfile(null);
      return;
    }
    setLoading(true);
    updateStatus(null, '');
    try {
      await fetch(`${API_BASE}/auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: session.access_token }),
      });
    } catch (error) {
      console.warn('Logout failed, clearing session anyway.', error);
    } finally {
      onLogout();
      setProfile(null);
      updateStatus('success', 'Logged out.');
      setLoading(false);
      setMode('login');
    }
  };

  const handleForgot = async (event) => {
    event.preventDefault();
    setLoading(true);
    updateStatus(null, '');
    try {
      await fetch(`${API_BASE}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      updateStatus('success', 'If that email exists, a reset link is on the way.');
      setForgotEmail('');
    } catch (error) {
      updateStatus('error', 'Unable to request password reset.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (event) => {
    event.preventDefault();
    setLoading(true);
    updateStatus(null, '');
    try {
      const response = await fetch(`${API_BASE}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_token: resetForm.accessToken,
          new_password: resetForm.newPassword,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Reset failed');
      updateStatus('success', 'Password updated! You can log in with the new password.');
      setResetForm({ accessToken: '', newPassword: '' });
      setMode('login');
    } catch (error) {
      updateStatus('error', error.message || 'Unable to reset password.');
    } finally {
      setLoading(false);
    }
  };

  const handleFetchProfile = async () => {
    if (!session?.access_token) {
      updateStatus('error', 'Log in to view your profile.');
      return;
    }
    setLoading(true);
    updateStatus(null, '');
    try {
      const response = await fetch(`${API_BASE}/auth/me`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || 'Unable to fetch profile.');
      setProfile(data.data);
      updateStatus('success', 'Profile refreshed.');
    } catch (error) {
      updateStatus('error', error.message || 'Unable to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.access_token) {
      handleFetchProfile();
      setMode('profile');
      return;
    }
    setProfile(null);
    setMode(initialMode);
    updateStatus(null, '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialMode, session?.access_token]);

  const renderStatus = () => {
    if (!status.type) return null;
    return (
      <div className={`auth-status auth-status-${status.type}`}>
        {status.message}
      </div>
    );
  };

  const renderSignup = () => (
    <Card padding="lg" className="auth-card" hover>
      <h3>Create an account</h3>
      <form className="auth-form" onSubmit={handleSignup}>
        <label className="auth-label">
          Full name
          <input
            type="text"
            value={signupForm.fullName}
            onChange={(e) => setSignupForm({ ...signupForm, fullName: e.target.value })}
            placeholder="Satoshi Builder"
          />
        </label>
        <label className="auth-label">
          Email
          <input
            type="email"
            value={signupForm.email}
            onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
            placeholder="you@startup.xyz"
            required
          />
        </label>
        <label className="auth-label">
          Password
          <input
            type="password"
            value={signupForm.password}
            onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
            placeholder="••••••••"
            required
          />
        </label>
        <Button type="submit" variant="primary" size="lg" loading={loading}>
          Sign up
        </Button>
      </form>
    </Card>
  );

  const renderLogin = () => (
    <Card padding="lg" className="auth-card" hover>
      <h3>Welcome back</h3>
      <form className="auth-form" onSubmit={handleLogin}>
        <label className="auth-label">
          Email
          <input
            type="email"
            value={loginForm.email}
            onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
            placeholder="team@w3connect.io"
            required
          />
        </label>
        <label className="auth-label">
          Password
          <input
            type="password"
            value={loginForm.password}
            onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
            placeholder="••••••••"
            required
          />
        </label>
        <div className="auth-form-footer">
          <button type="button" className="auth-inline-link" onClick={() => setMode('forgot')}>
            Forgot password?
          </button>
        </div>
        <Button type="submit" variant="secondary" size="lg" loading={loading}>
          Log in
        </Button>
      </form>
    </Card>
  );

  const renderForgot = () => (
    <Card padding="lg" className="auth-card" hover>
      <h3>Forgot password</h3>
      <p className="auth-subtitle">
        Enter the email tied to your account and we'll send a reset link.
      </p>
      <form className="auth-form" onSubmit={handleForgot}>
        <label className="auth-label">
          Email
          <input
            type="email"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            placeholder="founder@startup.xyz"
            required
          />
        </label>
        <Button type="submit" variant="primary" size="lg" loading={loading}>
          Send reset email
        </Button>
      </form>
    </Card>
  );

  const renderReset = () => (
    <Card padding="lg" className="auth-card" hover>
      <h3>Reset password</h3>
      <p className="auth-subtitle">
        Paste the <code>access_token</code> from the reset link URL and choose a new password.
      </p>
      <form className="auth-form" onSubmit={handleReset}>
        <label className="auth-label">
          Access token
          <input
            type="text"
            value={resetForm.accessToken}
            onChange={(e) => setResetForm({ ...resetForm, accessToken: e.target.value })}
            placeholder="paste token here"
            required
          />
        </label>
        <label className="auth-label">
          New password
          <input
            type="password"
            value={resetForm.newPassword}
            onChange={(e) => setResetForm({ ...resetForm, newPassword: e.target.value })}
            placeholder="new secure password"
            required
          />
        </label>
        <Button type="submit" variant="primary" size="lg" loading={loading}>
          Update password
        </Button>
      </form>
    </Card>
  );

  const renderProfile = () => (
    <Card padding="lg" className="auth-card" hover>
      <h3>Your account</h3>
      {session?.user ? (
        <div className="auth-profile">
          <p><strong>Email:</strong> {session.user.email}</p>
          <p><strong>User ID:</strong> {session.user.id}</p>
          <p><strong>Full name:</strong> {profile?.full_name || '—'}</p>
          <div className="auth-profile-actions">
            <Button variant="secondary" onClick={handleFetchProfile} loading={loading}>
              Refresh profile
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        </div>
      ) : (
        <p className="auth-subtitle">Log in to see your profile details.</p>
      )}
    </Card>
  );

  const renderActiveCard = () => {
    switch (mode) {
      case 'signup':
        return renderSignup();
      case 'forgot':
        return renderForgot();
      case 'reset':
        return renderReset();
      case 'profile':
        return renderProfile();
      case 'login':
      default:
        return renderLogin();
    }
  };

  const tabs = [
    { id: 'signup', label: 'Sign up' },
    { id: 'login', label: 'Log in' },
    { id: 'forgot', label: 'Forgot password' },
    { id: 'reset', label: 'Reset password' },
    { id: 'profile', label: 'My account' },
  ];

  return (
    <section className="auth-section">
      <div className="auth-container">
        <SectionHeader
          title="Account Portal"
          subtitle="Manage sign ups, logins, and password resets without leaving the builder."
        />

        <div className="auth-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`auth-tab ${mode === tab.id ? 'active' : ''}`}
              onClick={() => {
                setMode(tab.id);
                updateStatus(null, '');
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {renderStatus()}

        <div className="auth-card-wrapper">
          {renderActiveCard()}
        </div>
      </div>
    </section>
  );
};

export default AuthSection;
