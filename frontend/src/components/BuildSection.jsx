import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import './BuildSection.css';
import Card from './ui/Card';
import CollapsibleCard from './ui/CollapsibleCard';
import Button from './ui/Button';
import Badge from './ui/Badge';
import SectionHeader from './ui/SectionHeader';
import Input from './ui/Input';
import { TokenomicsSection } from './TokenomicsSection';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// Default tokenomics data
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

const BuildSection = ({ agentResult, setAgentResult, onProjectSaved, session }) => {
  const { projectId } = useParams();
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

  const mapTokenomics = (rawTokenomics) => {
    // Handle null, undefined, or non-object input
    if (!rawTokenomics || typeof rawTokenomics !== 'object' || Array.isArray(rawTokenomics)) {
      return null;
    }

    // Normalize allocations array - handle various field name variations
    let allocations = [];
    if (Array.isArray(rawTokenomics.allocations)) {
      allocations = rawTokenomics.allocations
        .filter((allocation) => allocation && typeof allocation === 'object')
        .map((allocation, idx) => {
          // Handle different percentage field names: percent, percentage, value
          const percentValue = Number(
            allocation.percent || allocation.percentage || allocation.value || 0
          );

          // Generate ID from label, allocation_name, or index
          const labelText =
            allocation.label || allocation.allocation_name || allocation.name || '';
          const id =
            allocation.id ||
            (labelText
              ? labelText.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
              : `allocation-${idx}`);

          return {
            id,
            label: labelText || `Allocation ${idx + 1}`,
            percent: percentValue,
            description:
              allocation.description ||
              allocation.desc ||
              allocation.summary ||
              '',
          };
        })
        .filter((slice) => slice.percent > 0);
    }

    // Return null if no valid allocations found
    if (!allocations.length) {
      return null;
    }

    // Normalize token symbol - handle various field names
    const tokenSymbol =
      rawTokenomics.tokenSymbol ||
      rawTokenomics.token_symbol ||
      rawTokenomics.symbol ||
      rawTokenomics.token ||
      'W3C';

    // Normalize health summary - handle various field names
    const healthSummary =
      rawTokenomics.healthSummary ||
      rawTokenomics.health_summary ||
      rawTokenomics.summary ||
      rawTokenomics.ai_summary ||
      null;

    return {
      tokenSymbol: String(tokenSymbol).slice(0, 6).toUpperCase(),
      allocations,
      healthSummary,
    };
  };

  // ---------- Project detail loading ----------

  useEffect(() => {
    let isMounted = true;
    const loadProject = async () => {
      if (!projectId) return;
      if (!session?.access_token) {
        setError('Please log in to view this project.');
        return;
      }
      setError('');
      setLoadingFramework(true);
      try {
        const res = await fetch(`${API_BASE}/api/projects/${projectId}`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.detail || 'Failed to load project.');
        }
        const project = await res.json();
        if (!isMounted) return;

        setIdea(project.idea || '');
        setStage(project.stage || 'new');
        setIndustry(project.industry || '');

        if (project.framework) {
          setFramework(project.framework);
          setHasGenerated(true);
          if (setAgentResult) {
            setAgentResult({
              framework: project.framework,
              tokenomics: project.tokenomics || null,
            });
          }
        } else {
          setFramework(null);
          setHasGenerated(false);
        }

        const normalized = mapTokenomics(project.tokenomics);
        setTokenomics(normalized || DEFAULT_TOKENOMICS);
        setDeploymentInfo(null);
        setDeploymentErrorMsg('');
        setDeploymentStatus('idle');
      } catch (err) {
        if (isMounted) {
          console.error('Failed to load project', err);
          setError(err.message || 'Unable to load project.');
        }
      } finally {
        if (isMounted) {
          setLoadingFramework(false);
        }
      }
    };

    loadProject();

    return () => {
      isMounted = false;
    };
  }, [projectId, session?.access_token, setAgentResult]);

  // Save project modal state
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');

  const resolveUserId = () => {
    return (
      session?.user?.id ||
      session?.user_id ||
      session?.data?.user?.id ||
      session?.user?.user?.id ||
      null
    );
  };

  const handleSaveProject = async () => {
    if (!projectName.trim()) {
      setSaveError('Please enter a project name.');
      return;
    }
    if (!framework) {
      setSaveError('Generate a framework before saving.');
      return;
    }
    const userId = resolveUserId();
    if (!session?.access_token || !userId) {
      setSaveError('Please log in to save your project.');
      return;
    }

    setSaving(true);
    setSaveError('');
    try {
      const res = await fetch(`${API_BASE}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          user_id: userId,
          name: projectName.trim(),
          idea,
          stage,
          industry,
          framework,
          tokenomics,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to save project.');
      }

      const savedProject = await res.json();

      if (typeof onProjectSaved === 'function') {
        try {
          onProjectSaved(savedProject);
        } catch (err) {
          console.warn('onProjectSaved callback threw:', err);
        }
      }

      setShowSaveModal(false);
      setProjectName('');
      setSaveError('');
    } catch (err) {
      console.error('Failed to save project:', err);
      setSaveError(err.message || 'Failed to save project.');
    } finally {
      setSaving(false);
    }
  };

  // ---------- Tokenomics helpers ----------

  // ---------- API handlers ----------

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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 480000); // 8 minutes

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
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to generate framework');
      }

      const data = await res.json();

      // Debug if you want:
      console.log('tokenomics from backend 👉', data.tokenomics);

      // full multi-agent result from backend
      if (setAgentResult) {
        setAgentResult(data);
      }

      // framework is nested inside the multi-agent result
      setFramework(data.framework);

      const normalized = mapTokenomics(data.tokenomics);
      setTokenomics(normalized || DEFAULT_TOKENOMICS);

      setHasGenerated(true);
    } catch (err) {
      console.error(err);
      if (err.name === 'AbortError') {
        setError('Request timed out. The framework generation is taking longer than expected. Please try again.');
      } else {
        setError(err.message || 'Something went wrong while generating.');
      }
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

    if (!framework) {
      setError('Please generate a framework first before downloading the starter project.');
      return;
    }

    try {
      setLoadingZip(true);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 480000); // 8 minutes

      const res = await fetch(`${API_BASE}/api/generate-zip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idea,
          stage,
          industry: industry || null,
          framework, // Pass the already-generated framework
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || 'Failed to generate zip file');
      }

      const data = await res.json();
      const zipBase64 = data.zip_base64;
      const filename = data.filename || 'web3-starter.zip';
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

  // ---------- small render helpers ----------

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

  // ---------- security + cost agents from agentResult ----------

  const securityAgent =
    agentResult &&
    ((agentResult.agent_traces &&
      agentResult.agent_traces.find((a) => a.name === 'Security Auditor')) ||
      (agentResult.security_report && { output: agentResult.security_report }));

  const costAgent =
    agentResult &&
    agentResult.agent_traces &&
    agentResult.agent_traces.find((a) => a.name === 'Cost Estimator');

  // ---------- JSX ----------

  // Determine if tokenomics exists
  const hasTokenomics = Boolean(tokenomics && tokenomics.allocations && tokenomics.allocations.length > 0);

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

        {/* Generate Framework Input Area - Centered and Polished */}
        {!hasGenerated ? (
          <div className="build-input-container">
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

                {error && <div className="error-message">{error}</div>}

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
        ) : (
          <div className="build-results-container">
            {/* Project Overview - Always at Top, Full Width */}
            {framework && (
              <div className="project-overview-section">
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
                            const toTitleCase = (str) =>
                              str
                                .toLowerCase()
                                .split(' ')
                                .map((word) =>
                                  word.length > 0
                                    ? word.charAt(0).toUpperCase() + word.slice(1)
                                    : word
                                )
                                .join(' ');

                            if (idea.trim()) {
                              const cleanIdea = idea.trim();
                              const match = cleanIdea.match(/^([^.!?]+?)(?:[.!?]|$)/);
                              if (match) {
                                let product = match[1].trim();
                                if (product.length > 60) {
                                  product = product.substring(0, 57).trim();
                                  const lastSpace = product.lastIndexOf(' ');
                                  if (lastSpace > 30) {
                                    product = product.substring(0, lastSpace);
                                  }
                                  return toTitleCase(product) + '...';
                                }
                                return toTitleCase(product);
                              }
                              const truncated =
                                cleanIdea.length > 60
                                  ? cleanIdea.substring(0, 57).trim() + '...'
                                  : cleanIdea;
                              return toTitleCase(truncated);
                            }

                            if (framework.summary) {
                              const firstSentence = framework.summary.split('.')[0].trim();
                              const truncated =
                                firstSentence.length > 60
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
                        <Badge variant="outline">
                          {framework.recommended_chain || 'Not specified'}
                        </Badge>
                      </div>
                      <div className="quick-overview-item">
                        <span className="quick-overview-label-text">Library:</span>
                        <Badge variant="outline">
                          {framework.web3_library || 'Not specified'}
                        </Badge>
                      </div>
                      {framework.user_segments && framework.user_segments.length > 0 && (
                        <div className="quick-overview-item">
                          <span className="quick-overview-label-text">Users:</span>
                          <span className="quick-overview-value">
                            {framework.user_segments[0]}
                          </span>
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
              </div>
            )}

            {/* Middle Section - Conditional Layout Based on Tokenomics */}
            {framework && (
              hasTokenomics ? (
                /* Case A: Tokenomics exists - 2-column layout */
                <div className="build-results-middle-tokenomics">
                {/* Left: Tokenomics */}
                <div className="build-tokenomics-panel">
                  <Card className="tokenomics-card" padding="lg">
                    <div className="tokenomics-header">
                      {SectionIcons.tokenomics}
                      <h3 className="tokenomics-title">Tokenomics Overview</h3>
                    </div>
                    <p className="tokenomics-subtitle">
                      Supply split by allocation (100% = total token supply).
                    </p>
                    {tokenomics && tokenomics.allocations && tokenomics.allocations.length > 0 ? (
                      <TokenomicsSection
                        tokenSymbol={tokenomics.tokenSymbol || 'W3C'}
                        slices={tokenomics.allocations || []}
                        healthSummary={tokenomics.healthSummary || null}
                      />
                    ) : null}
                  </Card>
                </div>

                {/* Right: Framework Cards */}
                <div className="build-framework-cards-column">
                  <div className="framework-sections">
                    {renderSectionCard(
                      'Frontend Components',
                      SectionIcons.components,
                      framework.frontend_components,
                      true,
                      false
                    )}
                    {renderSectionCard(
                      'User Segments',
                      SectionIcons.users,
                      framework.user_segments,
                      true,
                      false
                    )}
                    {renderSectionCard(
                      'Value Proposition',
                      SectionIcons.value,
                      framework.value_proposition,
                      true,
                      false
                    )}
                    {renderSectionCard(
                      'Smart Contracts',
                      SectionIcons.contracts,
                      framework.smart_contracts,
                      true,
                      false
                    )}
                    {renderSectionCard(
                      'Backend Services',
                      SectionIcons.backend,
                      framework.backend_services,
                      true,
                      false
                    )}
                    {renderSectionCard(
                      'Web3 Integration Focus',
                      SectionIcons.web3,
                      framework.web3_integration,
                      true,
                      false
                    )}
                    {renderSectionCard(
                      'Suggested Next Steps',
                      SectionIcons.nextSteps,
                      framework.next_steps,
                      true,
                      false
                    )}
                  </div>

                  {/* Security Overview */}
                  {securityAgent && (
                    <Card className="security-card" padding="lg">
                      <h3 className="summary-title">Security Overview</h3>
                      <p className="summary-text">
                        Risk level:{' '}
                        <strong>
                          {(securityAgent.output.risk_level || 'unknown').toUpperCase()}
                        </strong>
                      </p>

                      {securityAgent.output.critical_issues &&
                        securityAgent.output.critical_issues.length > 0 && (
                          <div className="security-section">
                            <h4 className="section-card-title">Critical Issues</h4>
                            <ul className="section-list">
                              {securityAgent.output.critical_issues.map((item, idx) => (
                                <li key={idx} className="section-list-item">
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                      {securityAgent.output.warnings &&
                        securityAgent.output.warnings.length > 0 && (
                          <div className="security-section">
                            <h4 className="section-card-title">Warnings</h4>
                            <ul className="section-list">
                              {securityAgent.output.warnings.map((item, idx) => (
                                <li key={idx} className="section-list-item">
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                      {securityAgent.output.recommendations &&
                        securityAgent.output.recommendations.length > 0 && (
                          <div className="security-section">
                            <h4 className="section-card-title">Recommendations</h4>
                            <ul className="section-list">
                              {securityAgent.output.recommendations.map((item, idx) => (
                                <li key={idx} className="section-list-item">
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                    </Card>
                  )}

                  {/* Cost Overview */}
                  {costAgent && (
                    <Card className="cost-card" padding="lg">
                      <h3 className="summary-title">Cost Overview</h3>
                      <p className="summary-text">
                        Chain: <strong>{costAgent.output.chain || 'Unknown'}</strong>
                      </p>

                      {costAgent.output.assumptions &&
                        costAgent.output.assumptions.length > 0 && (
                          <div className="security-section">
                            <h4 className="section-card-title">Assumptions</h4>
                            <ul className="section-list">
                              {costAgent.output.assumptions.map((item, idx) => (
                                <li key={idx} className="section-list-item">
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                      <div className="cost-grid">
                        <div className="cost-block">
                          <h4 className="section-card-title">Contract Deploy (mainnet)</h4>
                          <p className="summary-text">
                            {(costAgent.output.contract_deploy_cost_estimate &&
                              costAgent.output.contract_deploy_cost_estimate.currency) ||
                              'USD'}{' '}
                            {costAgent.output.contract_deploy_cost_estimate &&
                            costAgent.output.contract_deploy_cost_estimate.mainnet != null
                              ? costAgent.output.contract_deploy_cost_estimate.mainnet
                              : 'N/A'}
                          </p>
                          <p className="summary-helper">
                            Testnet cost is basically{' '}
                            {costAgent.output.contract_deploy_cost_estimate &&
                            costAgent.output.contract_deploy_cost_estimate.testnet != null
                              ? costAgent.output.contract_deploy_cost_estimate.testnet
                              : 0}{' '}
                            (faucet / play money).
                          </p>
                        </div>

                        <div className="cost-block">
                          <h4 className="section-card-title">Monthly Infra Estimate</h4>
                          <p className="summary-text">
                            Low:{' '}
                            {(costAgent.output.monthly_infra_cost_estimate &&
                              costAgent.output.monthly_infra_cost_estimate.currency) ||
                              'USD'}{' '}
                            {costAgent.output.monthly_infra_cost_estimate &&
                            costAgent.output.monthly_infra_cost_estimate.low != null
                              ? costAgent.output.monthly_infra_cost_estimate.low
                              : '?'}
                          </p>
                          <p className="summary-text">
                            Medium:{' '}
                            {(costAgent.output.monthly_infra_cost_estimate &&
                              costAgent.output.monthly_infra_cost_estimate.currency) ||
                              'USD'}{' '}
                            {costAgent.output.monthly_infra_cost_estimate &&
                            costAgent.output.monthly_infra_cost_estimate.medium != null
                              ? costAgent.output.monthly_infra_cost_estimate.medium
                              : '?'}
                          </p>
                          <p className="summary-text">
                            High:{' '}
                            {(costAgent.output.monthly_infra_cost_estimate &&
                              costAgent.output.monthly_infra_cost_estimate.currency) ||
                              'USD'}{' '}
                            {costAgent.output.monthly_infra_cost_estimate &&
                            costAgent.output.monthly_infra_cost_estimate.high != null
                              ? costAgent.output.monthly_infra_cost_estimate.high
                              : '?'}
                          </p>
                        </div>
                      </div>

                      {costAgent.output.notes && (
                        <div className="security-section">
                          <h4 className="section-card-title">Notes</h4>
                          <p className="summary-text">{costAgent.output.notes}</p>
                        </div>
                      )}
                    </Card>
                  )}
                </div>
              </div>
              ) : (
                /* Case B: No tokenomics - Full width grid */
                <div className="build-framework-cards-full">
                <div className="framework-sections-grid">
                  {renderSectionCard(
                    'Frontend Components',
                    SectionIcons.components,
                    framework?.frontend_components,
                    true,
                    false
                  )}
                  {renderSectionCard(
                    'User Segments',
                    SectionIcons.users,
                    framework?.user_segments,
                    true,
                    false
                  )}
                  {renderSectionCard(
                    'Value Proposition',
                    SectionIcons.value,
                    framework?.value_proposition,
                    true,
                    false
                  )}
                  {renderSectionCard(
                    'Smart Contracts',
                    SectionIcons.contracts,
                    framework?.smart_contracts,
                    true,
                    false
                  )}
                  {renderSectionCard(
                    'Backend Services',
                    SectionIcons.backend,
                    framework?.backend_services,
                    true,
                    false
                  )}
                  {renderSectionCard(
                    'Web3 Integration Focus',
                    SectionIcons.web3,
                    framework?.web3_integration,
                    true,
                    false
                  )}
                  {renderSectionCard(
                    'Suggested Next Steps',
                    SectionIcons.nextSteps,
                    framework?.next_steps,
                    true,
                    false
                  )}
                </div>

                {/* Security Overview */}
                {securityAgent && (
                  <Card className="security-card" padding="lg">
                    <h3 className="summary-title">Security Overview</h3>
                    <p className="summary-text">
                      Risk level:{' '}
                      <strong>
                        {(securityAgent.output.risk_level || 'unknown').toUpperCase()}
                      </strong>
                    </p>

                    {securityAgent.output.critical_issues &&
                      securityAgent.output.critical_issues.length > 0 && (
                        <div className="security-section">
                          <h4 className="section-card-title">Critical Issues</h4>
                          <ul className="section-list">
                            {securityAgent.output.critical_issues.map((item, idx) => (
                              <li key={idx} className="section-list-item">
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                    {securityAgent.output.warnings &&
                      securityAgent.output.warnings.length > 0 && (
                        <div className="security-section">
                          <h4 className="section-card-title">Warnings</h4>
                          <ul className="section-list">
                            {securityAgent.output.warnings.map((item, idx) => (
                              <li key={idx} className="section-list-item">
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                    {securityAgent.output.recommendations &&
                      securityAgent.output.recommendations.length > 0 && (
                        <div className="security-section">
                          <h4 className="section-card-title">Recommendations</h4>
                          <ul className="section-list">
                            {securityAgent.output.recommendations.map((item, idx) => (
                              <li key={idx} className="section-list-item">
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                  </Card>
                )}

                {/* Cost Overview */}
                {costAgent && (
                  <Card className="cost-card" padding="lg">
                    <h3 className="summary-title">Cost Overview</h3>
                    <p className="summary-text">
                      Chain: <strong>{costAgent.output.chain || 'Unknown'}</strong>
                    </p>

                    {costAgent.output.assumptions &&
                      costAgent.output.assumptions.length > 0 && (
                        <div className="security-section">
                          <h4 className="section-card-title">Assumptions</h4>
                          <ul className="section-list">
                            {costAgent.output.assumptions.map((item, idx) => (
                              <li key={idx} className="section-list-item">
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                    <div className="cost-grid">
                      <div className="cost-block">
                        <h4 className="section-card-title">Contract Deploy (mainnet)</h4>
                        <p className="summary-text">
                          {(costAgent.output.contract_deploy_cost_estimate &&
                            costAgent.output.contract_deploy_cost_estimate.currency) ||
                            'USD'}{' '}
                          {costAgent.output.contract_deploy_cost_estimate &&
                          costAgent.output.contract_deploy_cost_estimate.mainnet != null
                            ? costAgent.output.contract_deploy_cost_estimate.mainnet
                            : 'N/A'}
                        </p>
                        <p className="summary-helper">
                          Testnet cost is basically{' '}
                          {costAgent.output.contract_deploy_cost_estimate &&
                          costAgent.output.contract_deploy_cost_estimate.testnet != null
                            ? costAgent.output.contract_deploy_cost_estimate.testnet
                            : 0}{' '}
                          (faucet / play money).
                        </p>
                      </div>

                      <div className="cost-block">
                        <h4 className="section-card-title">Monthly Infra Estimate</h4>
                        <p className="summary-text">
                          Low:{' '}
                          {(costAgent.output.monthly_infra_cost_estimate &&
                            costAgent.output.monthly_infra_cost_estimate.currency) ||
                            'USD'}{' '}
                          {costAgent.output.monthly_infra_cost_estimate &&
                          costAgent.output.monthly_infra_cost_estimate.low != null
                            ? costAgent.output.monthly_infra_cost_estimate.low
                            : '?'}
                        </p>
                        <p className="summary-text">
                          Medium:{' '}
                          {(costAgent.output.monthly_infra_cost_estimate &&
                            costAgent.output.monthly_infra_cost_estimate.currency) ||
                            'USD'}{' '}
                          {costAgent.output.monthly_infra_cost_estimate &&
                          costAgent.output.monthly_infra_cost_estimate.medium != null
                            ? costAgent.output.monthly_infra_cost_estimate.medium
                            : '?'}
                        </p>
                        <p className="summary-text">
                          High:{' '}
                          {(costAgent.output.monthly_infra_cost_estimate &&
                            costAgent.output.monthly_infra_cost_estimate.currency) ||
                            'USD'}{' '}
                          {costAgent.output.monthly_infra_cost_estimate &&
                          costAgent.output.monthly_infra_cost_estimate.high != null
                            ? costAgent.output.monthly_infra_cost_estimate.high
                            : '?'}
                        </p>
                      </div>
                    </div>

                    {costAgent.output.notes && (
                      <div className="security-section">
                        <h4 className="section-card-title">Notes</h4>
                        <p className="summary-text">{costAgent.output.notes}</p>
                      </div>
                    )}
                  </Card>
                )}
              </div>
              )
            )}

            {/* Bottom Section - Generate + Save Buttons */}
            {framework && (
              <div className="build-actions-section">
                <Card className="download-cta-card" padding="lg">
                  <p className="download-cta-text">
                    Ready to build? Download the starter frontend, backend, and contracts in one zip.
                  </p>
                  <div className="build-actions-row">
                    <Button
                      type="button"
                      onClick={() => {
                        // Auto-fill project name from idea (first 50 chars)
                        const defaultName = idea.trim().slice(0, 50) || 'My Web3 Project';
                        setProjectName(defaultName);
                        setShowSaveModal(true);
                      }}
                      disabled={saving}
                      variant="secondary"
                      size="lg"
                      className="save-project-button"
                    >
                      Save Project
                    </Button>
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
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Save Project Modal */}
      {showSaveModal && (
        <div className="modal-overlay" onClick={() => !saving && setShowSaveModal(false)}>
          <Card className="save-project-modal" padding="lg" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Save Project</h3>
            <p className="modal-description">
              Give your project a name so you can find it later in your Projects tab.
            </p>
            
            <div className="modal-form">
              <Input
                label="Project Name"
                type="text"
                value={projectName}
                onChange={(e) => {
                  setProjectName(e.target.value);
                  setSaveError('');
                }}
                placeholder="e.g., My NFT Marketplace"
                disabled={saving}
                autoFocus
              />
              
              {saveError && (
                <div className="error-message" style={{ marginTop: '0.5rem' }}>
                  {saveError}
                </div>
              )}
              
              <div className="modal-actions" style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => {
                    setShowSaveModal(false);
                    setProjectName('');
                    setSaveError('');
                  }}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleSaveProject}
                  disabled={saving || !projectName.trim()}
                  loading={saving}
                >
                  Save Project
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </section>
  );
};

export default BuildSection;
