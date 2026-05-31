"use client";

import { useState } from "react";

export default function GraphLegend() {
  const [minimized, setMinimized] = useState(true);

  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        className="absolute bottom-20 left-md z-30 bg-surface-bright border border-hairline p-2 rounded-full shadow-lg text-primary hover:bg-surface-container transition-cubic control-btn"
        title="Show Legend"
      >
        <span className="material-symbols-outlined text-[20px]">legend_toggle</span>
      </button>
    );
  }

  return (
    <div className="absolute bottom-20 left-md z-30 bg-surface-bright border border-hairline rounded-xl shadow-lg p-sm w-48 transition-cubic flex flex-col gap-sm">
      <div className="flex items-center justify-between px-1 mb-1">
        <span className="font-label-sm uppercase tracking-widest text-outline">Legend</span>
        <button
          onClick={() => setMinimized(true)}
          className="text-outline hover:text-primary transition-cubic control-btn"
        >
          <span className="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 px-1 py-0.5">
          <div className="w-3 h-3 rounded-full bg-slate-800 border border-white" />
          <span className="font-label-md text-xs text-on-surface-variant">Topic Root</span>
        </div>
        <div className="flex items-center gap-2 px-1 py-0.5">
          <div className="w-3 h-3 rounded-full bg-blue-600 border border-white" />
          <span className="font-label-md text-xs text-on-surface-variant">Contribution</span>
        </div>
        <div className="flex items-center gap-2 px-1 py-0.5">
          <div className="w-3 h-3 rounded-full bg-red-600 border border-white" />
          <span className="font-label-md text-xs text-on-surface-variant">Challenge</span>
        </div>
        <div className="flex items-center gap-2 px-1 py-0.5">
          <div className="w-3 h-3 rounded-full bg-teal-600 border border-white" />
          <span className="font-label-md text-xs text-on-surface-variant">Refinement</span>
        </div>
        <div className="flex items-center gap-2 px-1 py-0.5">
          <div className="w-3 h-3 rounded-full bg-green-600 border border-white" />
          <span className="font-label-md text-xs text-on-surface-variant">Synthesis</span>
        </div>
      </div>

      <div className="w-full h-px bg-hairline my-1" />

      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 px-1 py-0.5">
          <div className="w-4 border-b-2 border-dashed border-red-600" />
          <span className="font-label-md text-xs text-on-surface-variant">Challenges</span>
        </div>
        <div className="flex items-center gap-2 px-1 py-0.5">
          <div className="w-4 border-b-2 border-teal-600" />
          <span className="font-label-md text-xs text-on-surface-variant">Refines</span>
        </div>
        <div className="flex items-center gap-2 px-1 py-0.5">
          <div className="w-4 border-b-2 border-green-600" />
          <span className="font-label-md text-xs text-on-surface-variant">Synthesizes</span>
        </div>
        <div className="flex items-center gap-2 px-1 py-0.5">
          <div className="w-4 border-b-2 border-gray-300" />
          <span className="font-label-md text-xs text-on-surface-variant">Parent/Child</span>
        </div>
      </div>
    </div>
  );
}
