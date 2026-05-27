"use client";

// Placeholder graph nodes and edges — will be replaced with D3 force simulation in Step 2.6.3
interface GraphCanvasProps {
  onMenuOpen: () => void;
  onDetailToggle: () => void;
}

export default function GraphCanvas({ onMenuOpen, onDetailToggle }: GraphCanvasProps) {
  return (
    <section className="flex-1 bg-dot-grid relative overflow-hidden flex flex-col">
      {/* Mobile Drawer Toggle */}
      <button
        className="md:hidden absolute top-md left-md z-30 bg-surface p-sm rounded-full border-hairline shadow-[0_1px_2px_0_rgba(0,0,0,0.02)] transition-cubic control-btn"
        onClick={onMenuOpen}
      >
        <span className="material-symbols-outlined text-[20px]">menu</span>
      </button>

      {/* Graph Container — placeholder layout, replaced by D3 in Step 2.6.3 */}
      <div className="w-full h-full relative cursor-move" id="graphCanvas">
        {/* SVG Edges */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 0 }}
        >
          {/* PARENT_OF edges — solid neutral */}
          <line x1="50%" y1="50%" x2="40%" y2="40%" stroke="#e5e5e5" strokeWidth="2" />
          <line x1="50%" y1="50%" x2="60%" y2="35%" stroke="#e5e5e5" strokeWidth="2" />
          <line x1="50%" y1="50%" x2="65%" y2="60%" stroke="#e5e5e5" strokeWidth="2" />
          <line x1="40%" y1="40%" x2="30%" y2="30%" stroke="#e5e5e5" strokeWidth="2" />
          {/* CHALLENGES edge — dashed red */}
          <line
            x1="60%"
            y1="35%"
            x2="70%"
            y2="25%"
            stroke="#dc2626"
            strokeDasharray="5,5"
            strokeWidth="2"
          />
        </svg>

        {/* Nodes */}
        {/* Topic Root */}
        <div
          className="absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full node-root text-white flex items-center justify-center font-label-md z-10 cursor-pointer shadow-md node-pulse-enter"
          title="Topic Root: Consensus"
        >
          <span className="material-symbols-outlined text-[24px]">hub</span>
        </div>
        {/* Contribution nodes */}
        <div
          className="absolute top-[40%] left-[40%] -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full node-contribution z-10 cursor-pointer shadow-md node-pulse-enter"
          style={{ animationDelay: "0.1s" }}
          title="Contribution: Epochs"
        />
        <div
          className="absolute top-[35%] left-[60%] -translate-x-1/2 -translate-y-1/2 w-10 h-10 rounded-full node-contribution z-10 cursor-pointer shadow-md node-pulse-enter"
          style={{ animationDelay: "0.2s" }}
          title="Contribution: Validators"
        />
        <div
          className="absolute top-[60%] left-[65%] -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full node-contribution z-10 cursor-pointer shadow-md node-pulse-enter"
          style={{ animationDelay: "0.3s" }}
          title="Contribution: Security"
        />
        <div
          className="absolute top-[30%] left-[30%] -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full node-contribution z-10 cursor-pointer shadow-md node-pulse-enter"
          style={{ animationDelay: "0.4s" }}
          title="Contribution: Finality"
        />
        {/* Challenge node */}
        <div
          className="absolute top-[25%] left-[70%] -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full node-challenge text-white flex items-center justify-center z-10 cursor-pointer shadow-md node-pulse-enter"
          style={{ animationDelay: "0.5s" }}
          title="Challenge: Latency"
        >
          <span className="material-symbols-outlined text-[16px]">warning</span>
        </div>
      </div>

      {/* Floating Zoom Controls */}
      <div className="absolute bottom-xl left-1/2 -translate-x-1/2 bg-surface rounded-full border-hairline flex items-center p-1 shadow-[0_1px_2px_0_rgba(0,0,0,0.02)] z-20">
        <button
          className="w-10 h-10 rounded-full flex items-center justify-center text-outline hover:text-primary hover:bg-surface-container-low transition-cubic control-btn"
          title="Zoom Out"
        >
          <span className="material-symbols-outlined text-[20px]">remove</span>
        </button>
        <div className="w-px h-6 bg-surface-variant mx-1" />
        <button
          className="w-10 h-10 rounded-full flex items-center justify-center text-outline hover:text-primary hover:bg-surface-container-low transition-cubic control-btn"
          title="Reset View"
        >
          <span className="material-symbols-outlined text-[20px]">fit_screen</span>
        </button>
        <div className="w-px h-6 bg-surface-variant mx-1" />
        <button
          className="w-10 h-10 rounded-full flex items-center justify-center text-outline hover:text-primary hover:bg-surface-container-low transition-cubic control-btn"
          title="Zoom In"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
        </button>
      </div>

      {/* Mobile Detail Toggle */}
      <button
        className="xl:hidden absolute top-md right-md z-30 bg-surface px-3 py-2 rounded-full border-hairline shadow-[0_1px_2px_0_rgba(0,0,0,0.02)] font-label-md text-label-md text-primary flex items-center gap-xs transition-cubic control-btn"
        onClick={onDetailToggle}
      >
        <span className="material-symbols-outlined text-[16px]">info</span> Details
      </button>
    </section>
  );
}
