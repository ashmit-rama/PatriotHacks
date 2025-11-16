import React from 'react';
import './AccountSection.css';
import Card from './ui/Card';
import Button from './ui/Button';
import SectionHeader from './ui/SectionHeader';

const AccountSection = ({ session, profile, onStartBuilding, onSignOut }) => {
  if (!session) return null;

  const safeValue = (value) => {
    if (!value) return '—';
    if (typeof value === 'string' && value.length > 32) {
      return `${value.slice(0, 20)}…${value.slice(-6)}`;
    }
    return value;
  };

  const fullName = profile?.full_name || 'Builder';
  const createdAt = profile?.created_at
    ? new Date(profile.created_at).toLocaleString()
    : 'Pending confirmation';
  const metadataEntries = profile?.metadata
    ? Object.entries(profile.metadata).filter(([, value]) => value !== null)
    : [];

  return (
    <section className="account-section">
      <div className="account-container">
        <SectionHeader
          title="Your account"
          subtitle="Manage your session and jump back into building Web3 projects."
        />

        <div className="account-grid">
          <Card className="account-card" padding="xl">
            <div className="account-card-header">
              <div className="account-avatar">
                {(session.email || 'W')[0].toUpperCase()}
              </div>
              <div>
                <p className="account-email">{session.email || 'Anonymous builder'}</p>
                <p className="account-id-label">User ID</p>
                <p className="account-id-value">{safeValue(session.userId)}</p>
              </div>
            </div>

            <div className="account-details">
              <div>
                <p className="account-detail-label">Full name</p>
                <p className="account-detail-value">{fullName}</p>
              </div>
              <div>
                <p className="account-detail-label">Email</p>
                <p className="account-detail-value">{session.email || '—'}</p>
              </div>
              <div>
                <p className="account-detail-label">Account created</p>
                <p className="account-detail-value">{createdAt}</p>
              </div>
              <div>
                <p className="account-detail-label">Access token</p>
                <p className="account-detail-value">{safeValue(session.accessToken)}</p>
              </div>
              <div>
                <p className="account-detail-label">Refresh token</p>
                <p className="account-detail-value">{safeValue(session.refreshToken)}</p>
              </div>
              <div>
                <p className="account-detail-label">Expires in</p>
                <p className="account-detail-value">
                  {session.expiresIn ? `${session.expiresIn} seconds` : 'Auto-managed'}
                </p>
              </div>
            </div>

            <div className="account-actions">
              <Button variant="primary" size="lg" onClick={onStartBuilding}>
                Continue building
              </Button>
              <Button variant="ghost" size="lg" onClick={onSignOut}>
                Sign out
              </Button>
            </div>
          </Card>

          <Card className="account-card secondary" padding="xl">
            <h3>Profile data</h3>
            <ul className="account-data-list">
              <li>
                <span>Full name</span>
                <strong>{fullName}</strong>
              </li>
              <li>
                <span>Email</span>
                <strong>{session.email || '—'}</strong>
              </li>
              <li>
                <span>User ID</span>
                <strong>{safeValue(session.userId)}</strong>
              </li>
              <li>
                <span>Created</span>
                <strong>{createdAt}</strong>
              </li>
            </ul>

            {metadataEntries.length > 0 && (
              <>
                <p className="account-metadata-title">Extra profile metadata</p>
                <ul className="account-metadata-list">
                  {metadataEntries.map(([key, value]) => (
                    <li key={key}>
                      <span>{key}</span>
                      <strong>{safeValue(value)}</strong>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <p className="account-hint">
              All of this data is stored securely in Supabase so your workspace follows you
              across sessions.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default AccountSection;
