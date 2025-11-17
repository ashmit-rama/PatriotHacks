import React, { useState, useEffect } from 'react';
import { TokenomicsPieChart, TokenomicsLegend } from './ui/TokenomicsPieChart';

export const TokenomicsSection = ({
  title = 'Tokenomics Overview',
  tokenSymbol = 'W3C',
  slices = [],
  healthSummary,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [chartSize, setChartSize] = useState(320);

  // Responsive chart size
  useEffect(() => {
    const updateChartSize = () => {
      setChartSize(window.innerWidth >= 1024 ? 320 : window.innerWidth >= 640 ? 280 : 240);
    };
    updateChartSize();
    window.addEventListener('resize', updateChartSize);
    return () => window.removeEventListener('resize', updateChartSize);
  }, []);

  // Early return if no valid slices data
  if (!slices || !Array.isArray(slices) || slices.length === 0) {
    return null;
  }

  // Web3-themed color palette matching the pie chart
  const colors = [
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

  // Transform slices data to match pie chart format with validation
  const chartData = slices
    .filter((slice) => slice && (slice.percent || slice.percentage || slice.value))
    .map((slice, index) => {
      // Handle different percentage field names: percent, percentage, value
      const percent = Number(slice.percent || slice.percentage || slice.value || 0);
      return {
        id: slice.id || `slice-${index}`,
        label: slice.label || `Allocation ${index + 1}`,
        value: percent,
        description: slice.description || '',
        color: colors[index % colors.length],
      };
    })
    .filter((item) => item.value > 0);

  // If no valid chart data after filtering, don't render
  if (!chartData.length) return null;

  const handleItemHover = (index) => {
    setHoveredIndex(index);
  };

  const handleItemLeave = () => {
    setHoveredIndex(null);
  };

  return (
    <div className="w-full">
      {/* Chart and Legend Container - Side by Side */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row items-center md:items-start justify-center gap-8 md:gap-10 lg:gap-12">
          {/* Donut Chart - Left side */}
          <div className="flex items-center justify-center flex-shrink-0">
            <TokenomicsPieChart
              data={chartData}
              size={chartSize}
              hoveredIndex={hoveredIndex}
              onSliceHover={setHoveredIndex}
              onSliceLeave={handleItemLeave}
            />
          </div>

          {/* Legend - Right side */}
          <div className="flex items-start justify-start w-full md:w-auto md:min-w-[280px]">
            <TokenomicsLegend
              data={chartData}
              hoveredIndex={hoveredIndex}
              onItemHover={handleItemHover}
              onItemLeave={handleItemLeave}
            />
          </div>
        </div>
      </div>

      {/* AI Summary Section */}
      {healthSummary && (
        <div className="mt-10 pt-8 border-t border-slate-700/60">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Summary
          </p>
          <p className="text-sm font-medium font-semibold leading-relaxed text-slate-200">{healthSummary}</p>
        </div>
      )}
    </div>
  );
};
