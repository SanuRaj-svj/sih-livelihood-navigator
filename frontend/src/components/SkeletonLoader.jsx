import React from 'react';

/*
  BACKGROUND & TEXT COLOR CONTRACT DECLARATION (SKELETON):
  - Surface Background: var(--color-surface) [#FFFFFF light / #1E1E2E dark]
  - Border Color: var(--color-border) [#E8E2D9 light / #2E2E42 dark]
  - Shimmer Block: var(--color-border)
*/

export const CardSkeleton = () => (
  <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)] space-y-4 shadow-xs">
    <div className="flex justify-between items-center">
      <div className="h-6 w-1/3 bg-[var(--color-border)] rounded shimmer"></div>
      <div className="h-6 w-16 bg-[var(--color-border)] rounded-full shimmer"></div>
    </div>
    <div className="h-4 w-2/3 bg-[var(--color-border)] rounded shimmer"></div>
    <div className="h-4 w-1/2 bg-[var(--color-border)] rounded shimmer"></div>
    <div className="pt-4 flex justify-between items-center">
      <div className="h-10 w-28 bg-[var(--color-border)] rounded-xl shimmer"></div>
      <div className="h-10 w-24 bg-[var(--color-border)] rounded-xl shimmer"></div>
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)] space-y-3 shadow-xs">
          <div className="h-4 w-24 bg-[var(--color-border)] rounded shimmer"></div>
          <div className="h-8 w-16 bg-[var(--color-border)] rounded shimmer"></div>
        </div>
      ))}
    </div>
    <div className="bg-[var(--color-surface)] rounded-2xl p-6 border border-[var(--color-border)] space-y-4 shadow-xs">
      <div className="h-6 w-48 bg-[var(--color-border)] rounded shimmer"></div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 bg-[var(--color-border)] rounded-lg shimmer"></div>
        ))}
      </div>
    </div>
  </div>
);
