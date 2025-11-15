import React, { useState } from 'react';
import './BuildSection.css';
import Card from './ui/Card';
import Button from './ui/Button';
import SectionHeader from './ui/SectionHeader';

const API_BASE = 'http://localhost:8000';

const BuildSection = () => {
  const [idea, setIdea] = useState('');
  const [stage, setStage] = useState('new');
  const [industry, setIndustry] = useState('');
  const [framework, setFramework] = useState(null);
  const [error, setError] = useState('');
  const [loadingFramework, setLoadingFramework] = useState(false);
  const [loadingZip, setLoadingZip] = useState(false);

  const handleGenerateFramework = async (e) => {
    e.preventDefault();
    setError('');
    setFramework(null);

    if (!idea.trim()) {
      setError('Please enter your website request before generating.');
      return;
    }

    setLoadingFramework(true);
    try {
      const res = await fetch(`${API_BASE}/api/generate-framework`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idea,
          stage,
          industry: industry || null,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to generate framework');
      }

      const data = await res.json();
      setFramework(data);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong while generating.');
    } finally {
      setLoadingFramework(false);
    }
  };

  const handleDownloadZip = async () => {
    setError('');

    if (!idea.trim()) {
      setError('Please enter your website request before downloading a starter project.');
      return;
    }

    setLoadingZip(true);
    try {
      const res = await fetch(`${API_BASE}/api/generate-project-zip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idea,
          stage,
          industry: industry || null,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to generate starter project zip');
      }

      const blob = await res.blob();

      const disposition = res.headers.get('Content-Disposition') || '';
      let filename = 'web3-starter.zip';
      const match = disposition.match(/filename="([^"]+)"/);
      if (match && match[1]) {
        filename = match[1];
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong while downloading.');
    } finally {
      setLoadingZip(false);
    }
  };

  const renderList = (title, items) => {
    if (!items || !items.length) return null;
    return (
      <Card className="framework-list-card" padding="md">
        <h4 className="framework-list-title">{title}</h4>
        <ul className="framework-list">
          {items.map((item, idx) => (
            <li key={`${title}-${idx}`} className="framework-list-item">
              {item}
            </li>
          ))}
        </ul>
      </Card>
    );
  };

  return (
    <section className="build-section">
      <div className="build-container">
        <SectionHeader
          title="Build Your Web3 Project"
          subtitle="Describe your website request and we'll generate a complete framework with components for your project."
        />

        <div className="build-layout">
          {/* Left: Form */}
          <div className="build-form-column">
            <Card padding="lg" hover>
              <form onSubmit={handleGenerateFramework} className="build-form">
                <div className="form-group">
                  <label className="form-label">Your Website Request</label>
                  <textarea
                    value={idea}
                    onChange={(e) => setIdea(e.target.value)}
                    rows={6}
                    className="form-textarea"
                    placeholder="Describe what you want for your website..."
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Stage</label>
                    <select
                      value={stage}
                      onChange={(e) => setStage(e.target.value)}
                      className="form-select"
                    >
                      <option value="new">New Idea</option>
                      <option value="existing">Established</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Industry (optional)</label>
                    <input
                      type="text"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      placeholder="e.g., events, gaming, finance"
                      className="form-input"
                    />
                  </div>
                </div>

                {error && (
                  <div className="error-message">
                    {error}
                  </div>
                )}

                <div className="form-actions">
                  <Button
                    type="submit"
                    disabled={loadingFramework}
                    loading={loadingFramework}
                    variant="primary"
                    size="lg"
                  >
                    Generate Framework
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Right: Results */}
          <div className="build-results-column">
            {framework ? (
              <div className="results-container">
                <Card padding="lg" className="results-summary">
                  <h3 className="results-summary-title">Project Summary</h3>
                  <p className="results-summary-text">{framework.summary}</p>
                  {framework.recommended_chain && (
                    <div className="results-chain">
                      <strong>Recommended chain:</strong> {framework.recommended_chain}
                    </div>
                  )}
                </Card>

                <div className="results-components">
                  <h3 className="results-components-title">Website Components</h3>
                  <div className="framework-components-grid">
                    {renderList('Frontend Components', framework.frontend_components)}
                    {renderList('User Segments', framework.user_segments)}
                    {renderList('Value Proposition', framework.value_proposition)}
                    {renderList('Smart Contracts', framework.smart_contracts)}
                    {renderList('Backend Services', framework.backend_services)}
                    {renderList('Web3 Integration Focus', framework.web3_integration)}
                    {renderList('Suggested Next Steps', framework.next_steps)}
                  </div>
                </div>

                <div className="results-actions">
                  <Button
                    type="button"
                    onClick={handleDownloadZip}
                    disabled={loadingZip}
                    loading={loadingZip}
                    variant="primary"
                    size="lg"
                  >
                    Download Starter Project (.zip)
                  </Button>
                </div>
              </div>
            ) : (
              <Card padding="xl" className="results-empty">
                <div className="results-empty-content">
                  <p className="results-empty-text">
                    Generate a framework to see results here
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default BuildSection;
