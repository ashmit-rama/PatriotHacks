import React from 'react';
import './TokenomicsSection.css';
import TokenomicsChart from './ui/TokenomicsChart';

export const TokenomicsSection = ({ tokenomics }) => {
  const colors = [
    '#6366F1',
    '#F472B6',
    '#22D3EE',
    '#F59E0B',
    '#34D399',
    '#A78BFA',
  ];

  // Transform allocations to chart data
  const chartData = tokenomics.allocations.map((allocation, index) => ({
    label: allocation.label,
    value: allocation.percent,
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
