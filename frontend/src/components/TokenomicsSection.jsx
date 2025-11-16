// src/components/TokenomicsSection.jsx
import React from 'react';

const TokenomicsSection = ({ tokenomics }) => {
  if (!tokenomics) return null;

  // Normalize names from backend (snake_case) & future camelCase
  const tokenSymbol =
    tokenomics.tokenSymbol || tokenomics.token_symbol || 'TOKEN';

  const allocations = Array.isArray(tokenomics.allocations)
    ? tokenomics.allocations
    : [];

  const healthSummary =
    tokenomics.healthSummary || tokenomics.health_summary || '';

  if (!allocations.length) {
    // Nothing to visualize yet
    return null;
  }

  const colors = [
    '#6366F1',
    '#F472B6',
    '#22D3EE',
    '#F59E0B',
    '#34D399',
    '#A78BFA',
  ];

  let runningOffset = 0;

  return (
    <div className="mt-6 rounded-xl border border-slate-700 bg-slate-900/60 p-4">
      <div className="flex items-center justify-between gap-3">
        <h4 className="text-lg font-semibold text-slate-100">
          Tokenomics Overview
        </h4>
        <span className="rounded-full border border-slate-600 bg-slate-800 px-3 py-1 text-xs font-semibold tracking-wide text-slate-200">
          {tokenSymbol}
        </span>
      </div>

      {/* Bar chart */}
      <div className="mb-4">
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-800">
          {allocations.map((allocation, index) => {
            const color = colors[index % colors.length];
            const segment = (
              <div
                key={`${allocation.id || index}-bar`}
                className="absolute top-0 h-full"
                style={{
                  left: `${runningOffset}%`,
                  width: `${allocation.percent || 0}%`,
                  backgroundColor: color,
                }}
              />
            );
            runningOffset += allocation.percent || 0;
            return segment;
          })}
        </div>
        <p className="mt-1 text-[11px] text-slate-400">
          Supply split by allocation (100% = total token supply).
        </p>
      </div>

      {/* reset offset for second map */}
      {(() => {
        runningOffset = 0;
        return null;
      })()}

      {/* Allocation cards */}
      <div className="mt-4 flex flex-col gap-3">
        {allocations.map((allocation, index) => {
          const color = colors[index % colors.length];
          return (
            <div
              key={allocation.id || `${allocation.label}-${index}`}
              className="rounded-lg border border-slate-800/60 bg-slate-900/40 p-3"
            >
              <div className="flex items-center justify-between text-slate-100">
                <span className="flex items-center font-semibold">
                  <span
                    className="mr-2 inline-block h-2 w-2 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  {allocation.label}
                </span>
                <span className="font-semibold">
                  {allocation.percent ?? 0}%
                </span>
              </div>
              {allocation.description && (
                <p className="mt-1 text-sm text-slate-400">
                  {allocation.description}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* AI summary */}
      {healthSummary && (
        <div className="mt-4 border-t border-slate-800/60 pt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            AI Summary
          </p>
          <p className="mt-1 text-xs text-slate-400">{healthSummary}</p>
        </div>
      )}
    </div>
  );
};

export default TokenomicsSection;
