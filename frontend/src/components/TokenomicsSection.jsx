import React from 'react';

export const TokenomicsSection = ({
  title = 'Tokenomics Overview',
  tokenSymbol = 'W3C',
  slices = [],
  healthSummary,
}) => {
  if (!slices.length) return null;

  const colors = ['#6366F1', '#F472B6', '#22D3EE', '#F59E0B', '#34D399', '#A78BFA'];
  let runningOffset = 0;

  return (
    <div className="mt-6 rounded-2xl border border-slate-700 bg-slate-900/60 p-5 shadow-lg shadow-black/30">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-slate-400">Tokenomics</p>
          <h4 className="text-xl font-semibold text-slate-100">{title}</h4>
        </div>
        <div className="rounded-full border border-slate-600 bg-slate-800 px-3 py-1 text-xs font-semibold tracking-wide text-slate-200">
          {tokenSymbol}
        </div>
      </div>

      <div className="mb-4 mt-6">
        <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-800">
          {slices.map((slice, index) => {
            const color = colors[index % colors.length];
            const width = Math.max(0, Math.min(100, slice.percent));
            const segment = (
              <div
                key={`${slice.id}-segment`}
                className="absolute top-0 h-full"
                style={{
                  left: `${runningOffset}%`,
                  width: `${width}%`,
                  backgroundColor: color,
                }}
              />
            );
            runningOffset += width;
            return segment;
          })}
        </div>
        <p className="mt-2 text-[11px] text-slate-400">
          Supply split by allocation (100% = total token supply).
        </p>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {slices.map((slice, index) => {
          const color = colors[index % colors.length];
          return (
            <div
              key={slice.id}
              className="rounded-xl border border-slate-800/70 bg-slate-900/40 p-4 transition hover:border-slate-600/80"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-200">{slice.label}</span>
                <span className="text-2xl font-bold text-slate-100">{slice.percent}%</span>
              </div>
              <div className="mt-2 flex items-start gap-2 text-sm text-slate-400">
                <span
                  className="mt-1 inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <p>{slice.description}</p>
              </div>
            </div>
          );
        })}
      </div>

      {healthSummary && (
        <div className="mt-6 rounded-xl border border-slate-800/80 bg-slate-900/50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            AI Summary
          </p>
          <p className="mt-1 text-sm text-slate-300">{healthSummary}</p>
        </div>
      )}
    </div>
  );
};
