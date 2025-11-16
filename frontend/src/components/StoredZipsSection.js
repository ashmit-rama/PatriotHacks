import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './StoredZipsSection.css';
import SectionHeader from './ui/SectionHeader';
import Card from './ui/Card';
import Badge from './ui/Badge';
import Button from './ui/Button';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

const getProjectStorageKey = (session) => {
  const userId =
    session?.user?.id ||
    session?.data?.user?.id ||
    session?.user?.user?.id ||
    session?.user_id ||
    null;
  return userId ? `kairo.projects.seen.${userId}` : null;
};

const readSeenProjects = (key) => {
  if (!key) return new Set();
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return new Set();
    const ids = JSON.parse(raw);
    return Array.isArray(ids) ? new Set(ids) : new Set();
  } catch (error) {
    console.warn('Failed to read seen projects', error);
    return new Set();
  }
};

const writeSeenProjects = (key, ids) => {
  if (!key) return;
  try {
    localStorage.setItem(key, JSON.stringify(Array.from(ids)));
  } catch (error) {
    console.warn('Failed to persist seen projects', error);
  }
};

const StoredZipsSection = ({ onProjectDeleted, session }) => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newBadgeIds, setNewBadgeIds] = useState(() => new Set());
  
  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      // Check if user is logged in
      if (!session?.access_token) {
        setError('Please log in to view your projects');
        setProjects([]);
        setNewBadgeIds(new Set());
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const storageKey = getProjectStorageKey(session);
        const seenSet = readSeenProjects(storageKey);
        const res = await fetch(`${API_BASE}/api/projects`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
          },
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.detail || 'Failed to fetch projects');
        }
        const data = await res.json();
        setProjects(data);

        const newIds = [];
        data.forEach((project) => {
          if (!seenSet.has(project.id)) {
            newIds.push(project.id);
          }
        });
        setNewBadgeIds(new Set(newIds));

        if (data.length) {
          const updatedSeen = new Set(seenSet);
          data.forEach((project) => updatedSeen.add(project.id));
          writeSeenProjects(storageKey, updatedSeen);
        }
      } catch (err) {
        console.error('Failed to fetch projects:', err);
        setError(err.message || 'Failed to load projects');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, [session]);
  
  const handleViewProject = (project) => {
    // Navigate to build page with projectId
    navigate(`/build/${project.id}`);
  };
  
  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }
    
    if (!session?.access_token) {
      alert('Please log in to delete projects');
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE}/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });
      
      if (!res.ok) {
        throw new Error('Failed to delete project');
      }
      
      // Remove from local state
      setProjects(prev => prev.filter(p => p.id !== projectId));
      
      // Call callback if provided
      if (onProjectDeleted) {
        onProjectDeleted(projectId);
      }
    } catch (err) {
      console.error('Failed to delete project:', err);
      alert(err.message || 'Failed to delete project');
    }
  };
  return (
    <section className="stored-zips-section">
      <div className="stored-zips-container">
        <SectionHeader
          title="Your Stored Projects"
          subtitle="View and manage your previously generated Web3 project blueprints and starter code."
        />
        {loading ? (
          <Card padding="xl" className="stored-zips-empty">
            <p>Loading projects...</p>
          </Card>
        ) : error ? (
          <Card padding="xl" className="stored-zips-empty">
            <p style={{ color: 'var(--error, #ef4444)' }}>Error: {error}</p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => window.location.reload()}
              style={{ marginTop: '1rem' }}
            >
              Retry
            </Button>
          </Card>
        ) : projects.length === 0 ? (
          <Card padding="xl" className="stored-zips-empty">
            <p>No stored projects yet. Generate your first project to see it here!</p>
          </Card>
        ) : (
          <div className="stored-zips-grid">
            {projects.map((project) => {
              const isNew = newBadgeIds.has(project.id);
              return (
              <Card key={project.id} padding="lg" className="stored-project-card" hover>
                <div className="stored-project-header">
                  <h3 className="stored-project-title">{project.name || project.idea}</h3>
                  <div className="stored-project-tags">
                    {isNew && <span className="stored-project-new-tag">New</span>}
                    {project.stage === 'existing' && (
                      <Badge variant="accent">Existing</Badge>
                    )}
                  </div>
                </div>
                <p className="stored-project-idea" style={{ fontWeight: 500, marginBottom: '0.5rem' }}>
                  {project.idea}
                </p>
                {project.summary && (
                  <p className="stored-project-summary">{project.summary}</p>
                )}
                <div className="stored-project-meta">
                  {project.industry && (
                    <span className="stored-project-industry">
                      Industry: {project.industry}
                    </span>
                  )}
                  <span className="stored-project-date">
                    {(() => {
                      const createdAt = project.created_at || project.createdAt;
                      if (!createdAt) return 'Generated (date unavailable)';
                      const parsed = new Date(createdAt);
                      return parsed.toString() === 'Invalid Date'
                        ? 'Generated (date unavailable)'
                        : `Generated ${parsed.toLocaleString()}`;
                    })()}
                  </span>
                </div>
                <div className="stored-project-actions">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewProject(project)}
                  >
                    View details
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteProject(project.id)}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default StoredZipsSection;
