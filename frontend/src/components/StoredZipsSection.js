import React from 'react';
import './StoredZipsSection.css';
import SectionHeader from './ui/SectionHeader';
import Card from './ui/Card';
import Badge from './ui/Badge';
import Button from './ui/Button';

const StoredZipsSection = ({ projects = [], onDeleteProject = () => {} }) => {
  const handleViewProject = (project) => {
    const details = `Idea: ${project.idea}\nStage: ${project.stage}\nIndustry: ${project.industry || 'N/A'}\n\nSummary:\n${project.summary}\n\nFull Response:\n${JSON.stringify(project.framework, null, 2)}`;
    alert(details);
  };
  return (
    <section className="stored-zips-section">
      <div className="stored-zips-container">
        <SectionHeader
          title="Your Stored Projects"
          subtitle="View and manage your previously generated Web3 project blueprints and starter code."
        />
        {projects.length === 0 ? (
          <Card padding="xl" className="stored-zips-empty">
            <p>No stored projects yet. Generate your first project to see it here!</p>
          </Card>
        ) : (
          <div className="stored-zips-grid">
            {projects.map((project) => (
              <Card key={project.id} padding="lg" className="stored-project-card" hover>
                <div className="stored-project-header">
                  <h3 className="stored-project-title">{project.idea}</h3>
                  <Badge variant="accent">
                    {project.stage === 'existing' ? 'Existing' : 'New'}
                  </Badge>
                </div>
                <p className="stored-project-summary">{project.summary}</p>
                <div className="stored-project-meta">
                  {project.industry && (
                    <span className="stored-project-industry">
                      Industry: {project.industry}
                    </span>
                  )}
                  <span className="stored-project-date">
                    Generated {new Date(project.createdAt).toLocaleString()}
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
                    onClick={() => onDeleteProject(project.id)}
                  >
                    Delete
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default StoredZipsSection;
