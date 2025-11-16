import React from 'react';
import './TokenomicsChart.css';

const TokenomicsChart = ({ data = [] }) => {
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

  // SVG donut chart constants
  const size = 200;
  const center = size / 2;
  const radius = 70;
  const innerRadius = 50;

  // Calculate SVG arc paths
  const getArcPath = (startAngle, endAngle, outerRadius, innerRadius) => {
    const start = polarToCartesian(center, center, outerRadius, endAngle);
    const end = polarToCartesian(center, center, outerRadius, startAngle);
    const innerStart = polarToCartesian(center, center, innerRadius, endAngle);
    const innerEnd = polarToCartesian(center, center, innerRadius, startAngle);
    
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    
    return [
      'M', start.x, start.y,
      'A', outerRadius, outerRadius, 0, largeArcFlag, 0, end.x, end.y,
      'L', innerEnd.x, innerEnd.y,
      'A', innerRadius, innerRadius, 0, largeArcFlag, 1, innerStart.x, innerStart.y,
      'Z'
    ].join(' ');
  };

  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  // Build arcs from data
  let currentAngle = 0;
  const arcs = data.map((item, index) => {
    const angle = (item.value / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle += angle;

    return {
      ...item,
      color: item.color || colors[index % colors.length],
      path: getArcPath(startAngle, endAngle, radius, innerRadius),
      startAngle,
      endAngle,
    };
  });

  return (
    <div className="tokenomics-chart-wrapper">
      <div className="tokenomics-chart-svg-container">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {arcs.map((arc, index) => (
            <path
              key={`arc-${index}`}
              d={arc.path}
              fill={arc.color}
              className="tokenomics-chart-arc"
            />
          ))}
        </svg>
      </div>
      <div className="tokenomics-chart-legend">
        {data.map((item, index) => {
          const color = item.color || colors[index % colors.length];
          return (
            <div key={`legend-${index}`} className="tokenomics-chart-legend-item">
              <div className="tokenomics-chart-legend-dot" style={{ backgroundColor: color }} />
              <div className="tokenomics-chart-legend-content">
                <span className="tokenomics-chart-legend-label">{item.label}</span>
                <span className="tokenomics-chart-legend-value">{item.value}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TokenomicsChart;

