import React, { useState } from 'react';

/**
 * TokenomicsPieChart - A responsive SVG-based donut chart for token allocations
 * @param {Array} data - Array of {label, value (percentage), id, color}
 * @param {Number} size - Chart size in pixels (default: 320)
 * @param {Number} hoveredIndex - Controlled hover index from parent
 * @param {Function} onSliceHover - Callback when slice is hovered
 * @param {Function} onSliceLeave - Callback when hover leaves
 */
export const TokenomicsPieChart = ({
  data = [],
  size = 320,
  hoveredIndex: controlledHoveredIndex,
  onSliceHover,
  onSliceLeave,
}) => {
  const [internalHoveredIndex, setInternalHoveredIndex] = useState(null);

  const hoveredIndex =
    controlledHoveredIndex !== undefined ? controlledHoveredIndex : internalHoveredIndex;

  // Web3-themed color palette
  const defaultColors = [
    '#6366F1', // indigo
    '#8B5CF6', // purple
    '#A78BFA', // violet
    '#C084FC', // purple-light
    '#22D3EE', // cyan
    '#06B6D4', // cyan-dark
    '#34D399', // emerald
    '#10B981', // emerald-dark
    '#F59E0B', // amber
    '#F97316', // orange
    '#EC4899', // pink
    '#F472B6', // pink-light
    '#14B8A6', // teal
    '#60A5FA', // blue
  ];

  const center = size / 2;
  const outerRadius = size * 0.4;
  const innerRadius = size * 0.25;

  // Convert polar to cartesian coordinates
  const polarToCartesian = (centerX, centerY, radius, angleInDegrees) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  // Generate SVG path for a donut slice
  const getDonutSlicePath = (startAngle, endAngle) => {
    const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
    const outerStart = polarToCartesian(center, center, outerRadius, endAngle);
    const outerEnd = polarToCartesian(center, center, outerRadius, startAngle);
    const innerStart = polarToCartesian(center, center, innerRadius, endAngle);
    const innerEnd = polarToCartesian(center, center, innerRadius, startAngle);

    return [
      'M',
      outerStart.x,
      outerStart.y,
      'A',
      outerRadius,
      outerRadius,
      0,
      largeArcFlag,
      0,
      outerEnd.x,
      outerEnd.y,
      'L',
      innerEnd.x,
      innerEnd.y,
      'A',
      innerRadius,
      innerRadius,
      0,
      largeArcFlag,
      1,
      innerStart.x,
      innerStart.y,
      'Z',
    ].join(' ');
  };

  // Calculate angles for each slice
  let currentAngle = 0;
  const slices = data.map((item, index) => {
    const angle = (item.value / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;

    currentAngle += angle;

    return {
      ...item,
      color: item.color || defaultColors[index % defaultColors.length],
      startAngle,
      endAngle,
      path: getDonutSlicePath(startAngle, endAngle),
    };
  });

  const handleSliceHover = (index) => {
    if (onSliceHover) {
      onSliceHover(index);
    } else {
      setInternalHoveredIndex(index);
    }
  };

  const handleSliceLeave = () => {
    if (onSliceLeave) {
      onSliceLeave();
    } else {
      setInternalHoveredIndex(null);
    }
  };

  if (!data.length) return null;

  return (
    <div 
      className="relative flex-shrink-0 mx-auto" 
      style={{ width: `${size}px`, height: `${size}px` }}
      onMouseLeave={handleSliceLeave}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="block"
      >
        {slices.map((slice, index) => {
          const isHovered = hoveredIndex === index;
          return (
            <path
              key={`slice-${slice.id || index}`}
              d={slice.path}
              fill={slice.color}
              stroke={isHovered ? slice.color : '#0F172A'}
              strokeWidth={isHovered ? '3' : '2'}
              opacity={isHovered ? 1 : hoveredIndex !== null && hoveredIndex !== index ? 0.5 : 1}
              className="transition-all duration-200 cursor-pointer"
              style={{
                filter: isHovered
                  ? `drop-shadow(0 4px 12px ${slice.color}CC)`
                  : 'none',
              }}
              onMouseEnter={() => handleSliceHover(index)}
            />
          );
        })}
      </svg>
    </div>
  );
};

/**
 * TokenomicsLegend - Legend component for pie chart
 * @param {Array} data - Same data array as pie chart
 * @param {Number} hoveredIndex - Currently hovered item index
 * @param {Function} onItemHover - Callback when item is hovered
 * @param {Function} onItemLeave - Callback when hover leaves
 */
export const TokenomicsLegend = ({
  data = [],
  hoveredIndex,
  onItemHover,
  onItemLeave,
}) => {
  const defaultColors = [
    '#6366F1',
    '#8B5CF6',
    '#A78BFA',
    '#C084FC',
    '#22D3EE',
    '#06B6D4',
    '#34D399',
    '#10B981',
    '#F59E0B',
    '#F97316',
    '#EC4899',
    '#F472B6',
    '#14B8A6',
    '#60A5FA',
  ];

  if (!data.length) return null;

  return (
    <div className="flex flex-col gap-3 w-full">
      {data.map((item, index) => {
        const color = item.color || defaultColors[index % defaultColors.length];
        const isHovered = hoveredIndex === index;

        return (
          <div
            key={`legend-${item.id || index}`}
            className={`
              flex items-center gap-3 py-2.5 px-3 rounded-lg transition-all duration-200 cursor-pointer
              ${isHovered ? 'bg-slate-800/40' : 'hover:bg-slate-800/20'}
            `}
            style={{
              opacity: isHovered ? 1 : hoveredIndex !== null && hoveredIndex !== index ? 0.6 : 1,
              border: `2px solid ${isHovered ? color : `${color}60`}`,
            }}
            onMouseEnter={() => onItemHover?.(index)}
            onMouseLeave={onItemLeave}
          >
            {/* Color indicator */}
            <div
              className="w-3.5 h-3.5 rounded-full flex-shrink-0 transition-transform duration-200"
              style={{
                backgroundColor: color,
                transform: isHovered ? 'scale(1.15)' : 'scale(1)',
              }}
            />
            
            {/* Label and percentage with increased spacing */}
            <div className="flex items-center justify-between flex-1 min-w-0 gap-4">
              <span
                className={`
                  text-sm font-medium truncate flex-1 min-w-0
                  ${isHovered ? 'text-slate-100' : 'text-slate-200'}
                `}
              >
                {item.label}
              </span>
              <span
                className={`
                  text-sm font-semibold tabular-nums flex-shrink-0 text-right
                  ${isHovered ? 'text-slate-100' : 'text-slate-300'}
                `}
              >
                {item.value}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
