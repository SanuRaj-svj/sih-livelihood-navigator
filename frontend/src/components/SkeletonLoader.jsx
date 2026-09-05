import React from 'react';

export const CardSkeleton = () => (
  <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
    <div className="flex justify-between items-center">
      <div className="h-6 w-1/3 bg-slate-800 rounded shimmer"></div>
      <div className="h-6 w-16 bg-slate-800 rounded-full shimmer"></div>
    </div>
    <div className="h-4 w-2/3 bg-slate-800 rounded shimmer"></div>
    <div className="h-4 w-1/2 bg-slate-800 rounded shimmer"></div>
    <div className="pt-4 flex justify-between items-center">
      <div className="h-10 w-28 bg-slate-800 rounded-xl shimmer"></div>
      <div className="h-10 w-24 bg-slate-800 rounded-xl shimmer"></div>
    </div>
  </div>
);

export const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="glass-card rounded-2xl p-6 border border-slate-800 space-y-3">
          <div className="h-4 w-24 bg-slate-800 rounded shimmer"></div>
          <div className="h-8 w-16 bg-slate-800 rounded shimmer"></div>
        </div>
      ))}
    </div>
    <div className="glass-card rounded-2xl p-6 border border-slate-800 space-y-4">
      <div className="h-6 w-48 bg-slate-800 rounded shimmer"></div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-10 bg-slate-800 rounded-lg shimmer"></div>
        ))}
      </div>
    </div>
  </div>
);
