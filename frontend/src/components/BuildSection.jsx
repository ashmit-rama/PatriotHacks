import React, { useState } from 'react';
import './BuildSection.css';
import Card from './ui/Card';
import CollapsibleCard from './ui/CollapsibleCard';
import Button from './ui/Button';
import Badge from './ui/Badge';
import SectionHeader from './ui/SectionHeader';
import { TokenomicsSection } from "./TokenomicsSection";

const API_BASE = 'http://localhost:8000';

// Icons for sections
const SectionIcons = {
  components: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="3" width="5" height="5" rx="1" />
      <rect x="9" y="3" width="5" height="5" rx="1" />
      <rect x="2" y="10" width="5" height="5" rx="1" />
      <rect x="9" y="10" width="5" height="5" rx="1" />
    </svg>
  ),
  users: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="5" r="2.5" />
      <path d="M3 14c0-2.5 2.2-4.5 5-4.5s5 2 5 4.5" />
    </svg>
  ),
  value: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <polygon points="8,2 10,6 14,7 11,10 11.5,14 8,12 4.5,14 5,10 2,7 6,6" />
    </svg>
  ),
  contracts: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="4" width="10" height="8" rx="1" />
      <path d="M6 4V2a1 1 0 0 1 1-1h2a1 1 0 0 1 1v2" />
      <line x1="5" y1="8" x2="11" y2="8" />
    </svg>
  ),
  backend: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="3" width="12" height="10" rx="1" />
      <circle cx="5" cy="8" r="1" />
      <circle cx="8" cy="8" r="1" />
      <circle cx="11" cy="8" r="1" />
    </svg>
  ),
  web3: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6" />
      <circle cx="8" cy="8" r="3" />
    </svg>
  ),
  nextSteps: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 3h10v10H3z" />
      <path d="M6 3v10M3 8h10" />
    </svg>
  ),
  tokenomics: (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6" />
      <path d="M8 2 A6 6 0 0 1 14 8" />
      <path d="M14 8 A6 6 0 0 1 8 14" />
    </svg>
  ),
};

const BuildSection = () => {
  const [idea, setIdea] = useState('');
  const [stage, setStage] = useState('new');
  const [industry, setIndustry] = useState('');
  const [framework, setFramework] = useState(null);
  const [error, setError] = useState('');
  const [loadingFramework, setLoadingFramework] = useState(false);
  const [loadingZip, setLoadingZip] = useState(false);
  const [tokenomics, setTokenomics] = useState(null);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [deploymentInfo, setDeploymentInfo] = useState(null);
  const [deploymentErrorMsg, setDeploymentErrorMsg] = useState('');
  const [deploymentStatus, setDeploymentStatus] = useState('idle'); // idle | pending | success | error | skipped | none

  const DEFAULT_TOKENOMICS = {
    tokenSymbol: 'W3C',
    allocations: [
      {
        id: 'community',
        label: 'Community Rewards & Incentives',
        percent: 35,
        description:
          'Rewards for early users, liquidity mining, referral programs, and rental activity incentives.',
      },
      {
        id: 'treasury',
        label: 'Protocol Treasury',
        percent: 25,
        description: 'Long-term ecosystem development, partnerships, grants, and maintenance.',
      },
      {
        id: 'team',
        label: 'Core Team',
        percent: 18,
        description: 'Founders and team with multi-year vesting to align incentives.',
      },
      {
        id: 'investors',
        label: 'Investors & Strategic Partners',
        percent: 12,
        description: 'Seed and future funding rounds with vesting and lockups.',
      },
      {
        id: 'liquidity',
        label: 'DEX/CEX Liquidity',
        percent: 5,
        description: 'Liquidity pools on decentralized exchanges and market making.',
      },
      {
        id: 'advisors',
        label: 'Advisors',
        percent: 5,
        description: 'Key advisors and industry experts with vesting schedules.',
      },
    ],
    healthSummary: 'Balanced distribution supporting community growth, long-term runway, and aligned incentives.',
  };

  const mapTokenomics = (rawTokenomics) => {
    if (!rawTokenomics || typeof rawTokenomics !== 'object') {
      return null;
    }

    const allocations = Array.isArray(rawTokenomics.allocations)
      ? rawTokenomics.allocations
          .map((allocation, idx) => ({
            id:
              allocation.id ||
              (allocation.label
                ? allocation.label.toLowerCase().replace(/\s+/g, '-')
                : `allocation-${idx}`),
            label: allocation.label || `Allocation ${idx + 1}`,
            percent: Number(allocation.percent) || 0,
            description: allocation.description || '',
          }))
          .filter((slice) => slice.percent > 0)
      : [];

    if (!allocations.length) {
      return null;
    }

    return {
      tokenSymbol: (
        rawTokenomics.tokenSymbol ||
        rawTokenomics.token_symbol ||
        rawTokenomics.symbol ||
        'W3C'
      )
        .slice(0, 6)
        .toUpperCase(),
      allocations,
      healthSummary:
        rawTokenomics.healthSummary || rawTokenomics.health_summary || rawTokenomics.summary,
    };
  };

  const handleGenerateFramework = async (e) => {
    e.preventDefault();
    setError('');
    setFramework(null);
    setTokenomics(null);
    setDeploymentInfo(null);
    setDeploymentErrorMsg('');
    setDeploymentStatus('idle');

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

      const normalized = mapTokenomics(data.tokenomics);
      setTokenomics(normalized || DEFAULT_TOKENOMICS);

      setHasGenerated(true);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong while generating.');
    } finally {
      setLoadingFramework(false);
    }
  };

  const handleGenerateNewIdea = () => {
    setIdea('');
    setStage('new');
    setIndustry('');
    setFramework(null);
    setTokenomics(null);
    setError('');
    setHasGenerated(false);
    setDeploymentInfo(null);
    setDeploymentErrorMsg('');
    setDeploymentStatus('idle');
  };

  const handleDownloadZip = async () => {
    setError('');
    setDeploymentStatus('pending');
    setDeploymentInfo(null);
    setDeploymentErrorMsg('');
    
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

      const data = await res.json();
      const filename = data.filename || 'web3-starter.zip';
      const zipBase64 = data.zip_base64;
      if (!zipBase64) {
        throw new Error('Server response did not include a ZIP payload.');
      }

      const binaryString = window.atob(zipBase64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i += 1) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const blob = new Blob([bytes], { type: 'application/zip' });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setDeploymentInfo(data.deployment || null);
      if (data.deployment) {
        setDeploymentStatus('success');
        setDeploymentErrorMsg('');
      } else if (data.deployment_error) {
        setDeploymentStatus('error');
        setDeploymentErrorMsg(data.deployment_error);
      } else {
        setDeploymentStatus('skipped');
        setDeploymentErrorMsg('');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Something went wrong while downloading.');
      setDeploymentStatus('error');
      setDeploymentErrorMsg(err.message || 'Something went wrong while downloading.');
    } finally {
      setLoadingZip(false);
    }
  };

  const renderList = (items) => {
    if (!items || !items.length) return null;
    return (
      <ul className="section-list">
        {items.map((item, idx) => (
          <li key={idx} className="section-list-item">
            {item}
          </li>
        ))}
      </ul>
    );
  };

  const renderSectionCard = (title, icon, items, collapsible = false, defaultExpanded = true) => {
    if (!items || !items.length) return null;

    const content = renderList(items);

    if (collapsible) {
      return (
        <CollapsibleCard
          key={title}
          title={title}
          icon={icon}
          defaultExpanded={defaultExpanded}
          className="framework-section-card"
        >
          {content}
        </CollapsibleCard>
      );
    }

    return (
      <Card key={title} className="framework-section-card" padding="md">
        <div className="section-card-header">
          {icon && <span className="section-card-icon">{icon}</span>}
          <h4 className="section-card-title">{title}</h4>
        </div>
        {content}
      </Card>
    );
  };

  return (
    <section className="build-section">
      <div className="build-container">
        <SectionHeader
          title="Build Your Web3 Project"
          subtitle="Describe your website request and we'll generate a complete framework with components for your project."
          actions={
            hasGenerated ? (
              <Button
                variant="secondary"
                size="md"
                onClick={handleGenerateNewIdea}
                className="generate-new-idea-button"
              >
                Generate New Idea
              </Button>
            ) : null
          }
        />

        <div className={`build-layout ${hasGenerated ? 'build-layout-generated' : ''}`}>
          {/* Left: Input Panel (only when not generated) or Tokenomics (when generated) */}
          {!hasGenerated ? (
            <div className="build-input-panel">
              <Card className="input-panel-card" padding="lg">
                <h3 className="input-panel-heading">Your Web3 Idea</h3>
                <p className="input-panel-helper">
                  Describe your project and we'll generate a complete Web3 blueprint.
                </p>

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
          ) : tokenomics ? (
            <div className="build-tokenomics-panel">
              <Card className="tokenomics-card" padding="lg">
                <div className="tokenomics-header">
                  {SectionIcons.tokenomics}
                  <h3 className="tokenomics-title">Tokenomics Overview</h3>
                </div>
                <p className="tokenomics-subtitle">
                  Supply split by allocation (100% = total token supply).
                </p>
                <TokenomicsSection
                  tokenSymbol={tokenomics.tokenSymbol}
                  slices={tokenomics.allocations}
                  healthSummary={tokenomics.healthSummary}
                />
              </Card>
            </div>
          ) : null}

          {/* Right: Output Panel */}
          <div className="build-output-panel">
            {framework ? (
              <div className="output-container">
                {/* Project Summary */}
                <Card className="summary-card" padding="lg">
                  <h3 className="summary-title">Project Summary</h3>
                  <p className="summary-text">{framework.summary}</p>

                  {/* Quick Overview Box */}
                  <div className="quick-overview">
                    <div className="quick-overview-label">🔍 Quick Overview</div>
                    <div className="quick-overview-content">
                      <div className="quick-overview-item">
                        <span className="quick-overview-label-text">Product:</span>
                        <span className="quick-overview-value">
                          {(() => {
                            // Helper function to convert to title case
                            const toTitleCase = (str) => {
                              return str
                                .toLowerCase()
                                .split(' ')
                                .map(word => {
                                  // Skip common articles/prepositions, but capitalize first word always
                                  const skipWords = ['a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
                                  return word.length > 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word;
                                })
                                .join(' ');
                            };

                            // Extract a concise product description from the idea
                            if (idea.trim()) {
                              // Take first meaningful part (before any punctuation that indicates continuation)
                              const cleanIdea = idea.trim();
                              // Extract core concept - try to get the main noun phrase
                              const match = cleanIdea.match(/^([^.!?]+?)(?:[.!?]|$)/);
                              if (match) {
                                let product = match[1].trim();
                                // Limit to reasonable length for quick overview
                                if (product.length > 60) {
                                  // Try to cut at word boundary
                                  product = product.substring(0, 57).trim();
                                  const lastSpace = product.lastIndexOf(' ');
                                  if (lastSpace > 30) {
                                    product = product.substring(0, lastSpace);
                                  }
                                  return toTitleCase(product) + '...';
                                }
                                return toTitleCase(product);
                              }
                              // Fallback: first 60 chars
                              const truncated = cleanIdea.length > 60 ? cleanIdea.substring(0, 57).trim() + '...' : cleanIdea;
                              return toTitleCase(truncated);
                            }
                            // Fallback to summary if idea not available
                            if (framework.summary) {
                              const firstSentence = framework.summary.split('.')[0].trim();
                              const truncated = firstSentence.length > 60 
                                ? firstSentence.substring(0, 57).trim() + '...'
                                : firstSentence;
                              return toTitleCase(truncated);
                            }
                            return 'Web3 Application';
                          })()}
                        </span>
                      </div>
                      <div className="quick-overview-item">
                        <span className="quick-overview-label-text">Chain:</span>
                        <Badge variant="outline">{framework.recommended_chain || 'Not specified'}</Badge>
                      </div>
                      <div className="quick-overview-item">
                        <span className="quick-overview-label-text">Library:</span>
                        <Badge variant="outline">{framework.web3_library || 'Not specified'}</Badge>
                      </div>
                      {framework.user_segments && framework.user_segments.length > 0 && (
                        <div className="quick-overview-item">
                          <span className="quick-overview-label-text">Users:</span>
                          <span className="quick-overview-value">{framework.user_segments[0]}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Chain and Library Badges */}
                  {(framework.recommended_chain || framework.web3_library) && (
                    <div className="summary-badges">
                      <div className="summary-badges-left">
                        {framework.recommended_chain && (
                          <div className="summary-badge-group">
                            <span className="summary-badge-label">Recommended Chain:</span>
                            <Badge variant="outline">{framework.recommended_chain}</Badge>
                          </div>
                        )}
                        {framework.web3_library && (
                          <div className="summary-badge-group">
                            <span className="summary-badge-label">Web3 Library:</span>
                            <Badge variant="outline">{framework.web3_library}</Badge>
                          </div>
                        )}
                      </div>
                      <Button
                        type="button"
                        onClick={handleDownloadZip}
                        disabled={loadingZip}
                        loading={loadingZip}
                        variant="primary"
                        size="sm"
                        className="summary-badges-download-button"
                      >
                        Download ZIP
                      </Button>
                    </div>
                  )}
                  {deploymentStatus === 'pending' && (
                    <div className="mt-4 rounded-lg border border-slate-600/60 bg-slate-800/30 p-3 text-sm text-slate-200">
                      Deploying contract to the testnet...
                    </div>
                  )}
                  {deploymentStatus === 'success' && deploymentInfo && (
                    <div className="mt-4 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-4 text-sm text-emerald-50">
                      <p className="font-semibold text-emerald-200">On-chain Deployment</p>
                      <p className="mt-1">
                        Deployed to <strong>{deploymentInfo.network}</strong>
                      </p>
                      <p className="mt-1 break-all">
                        Address:{' '}
                        <code className="text-emerald-100">{deploymentInfo.address}</code>
                      </p>
                      {deploymentInfo.explorer_url && (
                        <a
                          href={deploymentInfo.explorer_url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-200 underline"
                        >
                          View on explorer
                        </a>
                      )}
                    </div>
                  )}
                  {deploymentStatus === 'error' && deploymentErrorMsg && (
                    <div className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-100">
                      Automatic deployment failed: {deploymentErrorMsg}
                    </div>
                  )}
                  {deploymentStatus === 'skipped' && !deploymentErrorMsg && (
                    <div className="mt-4 rounded-lg border border-slate-600/40 bg-slate-800/20 p-3 text-sm text-slate-300">
                      Deployment was skipped (no contract was available). You can still use the ZIP to deploy manually.
                    </div>
                  )}
                </Card>

                {/* Sections */}
                <div className="framework-sections">
                  {renderSectionCard('Frontend Components', SectionIcons.components, framework.frontend_components, true, false)}
                  {renderSectionCard('User Segments', SectionIcons.users, framework.user_segments, true, false)}
                  {renderSectionCard('Value Proposition', SectionIcons.value, framework.value_proposition, true, false)}
                  {renderSectionCard('Smart Contracts', SectionIcons.contracts, framework.smart_contracts, true, false)}
                  {renderSectionCard('Backend Services', SectionIcons.backend, framework.backend_services, true, false)}
                  {renderSectionCard('Web3 Integration Focus', SectionIcons.web3, framework.web3_integration, true, false)}
                  {renderSectionCard('Suggested Next Steps', SectionIcons.nextSteps, framework.next_steps, true, false)}
                </div>

                {/* Download CTA */}
                <Card className="download-cta-card" padding="lg">
                  <p className="download-cta-text">
                    Ready to build? Download the starter frontend, backend, and contracts in one zip.
                  </p>
                  <Button
                    type="button"
                    onClick={handleDownloadZip}
                    disabled={loadingZip}
                    loading={loadingZip}
                    variant="primary"
                    size="lg"
                    className="download-cta-button"
                  >
                    Download Starter Project (.zip)
                  </Button>
                </Card>
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
