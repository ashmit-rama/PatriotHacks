import React from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import './Auth.css';

const AccountSettings = ({ user, onLogout }) => {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <Card className="auth-card" padding="xl">
          <h1 className="auth-title">Account settings</h1>
          {user ? (
            <div className="auth-profile">
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>User ID:</strong> {user.id}</p>
              {user.email_confirmed_at && (
                <p><strong>Confirmed:</strong> {new Date(user.email_confirmed_at).toLocaleString()}</p>
              )}
              <div className="auth-profile-actions">
                <Button variant="ghost" size="md" onClick={onLogout}>
                  Sign out
                </Button>
              </div>
            </div>
          ) : (
            <p className="auth-description">Log in to view your account details.</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AccountSettings;
