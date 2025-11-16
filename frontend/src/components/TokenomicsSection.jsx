import React from 'react';
import './TokenomicsSection.css';
import TokenomicsChart from './ui/TokenomicsChart';

export const TokenomicsSection = ({ tokenomics }) => {
  // Defensive: if something goes weird, don't crash the whole page
  if (!tokenomics || !Array.isArray(tokenomics.allocations)) {
    return null;
  }

  const colors = [
    '#6366F1', // indigo
    '#F472B6', // pink
    '#22D3EE', // cyan
    '#F59E0B', // amber
    '#34D399', // emerald
    '#A78BFA', // violet
    '#FB7185', // rose
    '#4ADE80', // green
    '#FBBF24', // yellow
    '#60A5FA', // blue
    '#C084FC', // purple
    '#FB923C', // orange
    '#14B8A6', // teal
    '#EC4899', // fuchsia
    '#8B5CF6', // purple
  ];

  // Transform allocations to chart data
  const chartData = tokenomics.allocations.map((allocation, index) => ({
    label: allocation.label,
    value: Number(allocation.percent),
    color: colors[index % colors.length],
  }));

  return (
    <div className="tokenomics-section">
      <div className="tokenomics-header-row">
        <span className="tokenomics-symbol">
          {tokenomics.tokenSymbol}
        </span>
      </div>

      {/* Donut Chart with Legend */}
      <div className="tokenomics-chart-wrapper">
        <TokenomicsChart data={chartData} />
      </div>

      {/* Allocation Details (minimized, below chart) */}
      {tokenomics.healthSummary && (
        <div className="tokenomics-summary">
          <p className="tokenomics-summary-label">
            AI Summary
          </p>
          <p className="tokenomics-summary-text">
            {tokenomics.healthSummary}
          </p>
        </div>
      )}
    </div>
  );
};
