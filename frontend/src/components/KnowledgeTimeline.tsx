"use client";

import { useMemo, useRef, useEffect } from "react";
import { GraphData, GraphNode } from "../lib/graph-helpers";

interface KnowledgeTimelineProps {
  graphData: GraphData;
  selectedNodeId?: string;
  onMenuOpen: () => void;
  onNodeSelect: (node: GraphNode) => void;
}

const NODE_TYPE_LABELS: Record<number, string> = {
  0: "CONTRIBUTION",
  1: "CHALLENGE",
  2: "REFINEMENT",
  3: "SYNTHESIS",
};

/** Shape indicator matching the mockup */
function NodeTypeIcon({ nodeType, depth, size = 10 }: { nodeType: number; depth: number; size?: number }) {
  if (depth === 0) {
    return (
      <svg width={size} height={size} viewBox="0 0 10 10">
        <circle cx="5" cy="5" r="4.5" fill="#000" stroke="#000" strokeWidth="1" />
      </svg>
    );
  }
  switch (nodeType) {
    case 0: // Contribution = filled circle
      return (
        <svg width={size} height={size} viewBox="0 0 10 10">
          <circle cx="5" cy="5" r="4" fill="#000" />
        </svg>
      );
    case 1: // Challenge = hollow circle
      return (
        <svg width={size} height={size} viewBox="0 0 10 10">
          <circle cx="5" cy="5" r="3.5" fill="none" stroke="#000" strokeWidth="1.5" />
        </svg>
      );
    case 2: // Refinement = diamond
      return (
        <svg width={size} height={size} viewBox="0 0 10 10">
          <polygon points="5,0.5 9.5,5 5,9.5 0.5,5" fill="#000" />
        </svg>
      );
    case 3: // Synthesis = square
      return (
        <svg width={size} height={size} viewBox="0 0 10 10">
          <rect x="1" y="1" width="8" height="8" fill="#000" />
        </svg>
      );
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 10 10">
          <circle cx="5" cy="5" r="4" fill="#999" />
        </svg>
      );
  }
}

/** Sort nodes into timeline order: root first, then by depth, then type */
function sortNodesForTimeline(nodes: GraphNode[]): GraphNode[] {
  return [...nodes].sort((a, b) => {
    if (a.depth === 0) return -1;
    if (b.depth === 0) return 1;
    if (a.depth !== b.depth) return a.depth - b.depth;
    return a.nodeType - b.nodeType;
  });
}

export default function KnowledgeTimeline({
  graphData,
  selectedNodeId,
  onMenuOpen,
  onNodeSelect,
}: KnowledgeTimelineProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const sortedNodes = useMemo(() => sortNodesForTimeline(graphData.nodes), [graphData.nodes]);

  // Auto-scroll to selected node
  useEffect(() => {
    if (selectedNodeId && scrollRef.current) {
      const el = scrollRef.current.querySelector(`[data-node-id="${selectedNodeId}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [selectedNodeId]);

  if (sortedNodes.length === 0) {
    return (
      <section className="flex-1 relative overflow-hidden flex flex-col items-center justify-center bg-white">
        <button
          className="md:hidden absolute top-4 left-4 z-30 bg-white p-2 rounded-full border border-black/10 shadow-sm"
          onClick={onMenuOpen}
        >
          <span className="material-symbols-outlined text-[20px]">menu</span>
        </button>
        <div className="text-center">
          <p className="text-black/40 text-sm font-mono uppercase tracking-widest">No nodes found</p>
          <p className="text-black/25 text-xs mt-2">Select a topic with knowledge nodes</p>
        </div>
      </section>
    );
  }

  return (
    <section className="flex-1 relative overflow-hidden flex flex-col bg-[#fafafa]">
      {/* Mobile menu toggle */}
      <button
        className="md:hidden absolute top-4 left-4 z-30 bg-white p-2 rounded-full border border-black/10 shadow-sm"
        onClick={onMenuOpen}
      >
        <span className="material-symbols-outlined text-[20px]">menu</span>
      </button>

      {/* Scrollable timeline area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 md:px-8 py-8">
        <div className="relative max-w-[720px] mx-auto">
          {/* Vertical trunk line */}
          <div
            className="absolute left-1/2 -translate-x-px top-0 bottom-0 w-[2px] bg-black/15"
            style={{ zIndex: 0 }}
          />

          {sortedNodes.map((node, index) => {
            const isRoot = node.depth === 0;
            const isSelected = node.id === selectedNodeId;
            const side = isRoot ? "center" : index % 2 === 0 ? "left" : "right";

            if (isRoot) {
              return (
                <div
                  key={node.id}
                  data-node-id={node.id}
                  className="relative z-10 mb-10"
                >
                  {/* Root card - centered, black background */}
                  <div
                    className={`
                      mx-auto max-w-[480px] bg-black text-white p-6 border border-black cursor-pointer
                      transition-all duration-200
                      ${isSelected ? "ring-2 ring-black ring-offset-2" : "hover:shadow-lg"}
                    `}
                    onClick={() => onNodeSelect(node)}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <NodeTypeIcon nodeType={node.nodeType} depth={node.depth} size={12} />
                      <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/60">
                        Topic Root
                      </span>
                    </div>
                    <h3 className="text-lg font-bold leading-snug">
                      {node.label || "Untitled Topic"}
                    </h3>
                    <div className="flex items-center justify-between mt-4">
                      <span className="font-mono text-[11px] text-white/40">
                        {node.agentAddress.substring(0, 12)}...
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-white/30 border border-white/20 px-2 py-0.5">
                        genesis_blob
                      </span>
                    </div>
                  </div>

                  {/* Connector dot at trunk */}
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-[-20px]">
                    <div className="w-3 h-3 rounded-full bg-black border-2 border-[#fafafa]" />
                  </div>
                </div>
              );
            }

            // Non-root node cards
            const typeLabel = NODE_TYPE_LABELS[node.nodeType] || "UNKNOWN";
            const isChallenge = node.nodeType === 1;

            return (
              <div
                key={node.id}
                data-node-id={node.id}
                className={`relative z-10 flex items-start mb-8 ${
                  side === "left" ? "justify-start" : "justify-end"
                }`}
              >
                {/* Connector from trunk to card */}
                <div
                  className={`absolute top-6 ${
                    side === "left" ? "left-1/2 right-auto" : "right-1/2 left-auto"
                  }`}
                  style={{
                    width: "calc(50% - 160px)",
                    [side === "left" ? "right" : "left"]: "auto",
                  }}
                >
                  <div
                    className={`h-[2px] w-full ${
                      isChallenge ? "border-t-2 border-dashed border-black/30" : "bg-black/15"
                    }`}
                  />
                </div>

                {/* Trunk dot */}
                <div className="absolute left-1/2 -translate-x-1/2 top-[18px] z-20">
                  <NodeTypeIcon nodeType={node.nodeType} depth={node.depth} size={12} />
                </div>

                {/* Card */}
                <div
                  className={`
                    w-[calc(50%-40px)] bg-white border cursor-pointer
                    transition-all duration-200
                    ${isSelected
                      ? "border-black shadow-[4px_4px_0_rgba(0,0,0,1)]"
                      : `border-black/15 hover:border-black/40 hover:shadow-sm ${
                          isChallenge ? "border-dashed" : ""
                        }`
                    }
                  `}
                  onClick={() => onNodeSelect(node)}
                >
                  <div className="p-4">
                    {/* Type badge + agent address */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <NodeTypeIcon nodeType={node.nodeType} depth={node.depth} size={10} />
                        <span
                          className={`text-[10px] font-mono uppercase tracking-[0.15em] font-bold ${
                            isChallenge ? "text-black/60" : "text-black"
                          }`}
                        >
                          {typeLabel}
                        </span>
                        {isSelected && (
                          <span className="text-[9px] font-mono uppercase tracking-wider bg-black text-white px-1.5 py-0.5">
                            Selected
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-[10px] text-black/30">
                        {node.agentAddress.substring(0, 8)}...
                      </span>
                    </div>

                    {/* Blob ID preview as summary */}
                    <p className="text-sm text-black/70 leading-relaxed italic line-clamp-2 mb-3">
                      {node.blobId
                        ? `Research artifact stored on Walrus`
                        : "No blob attached"}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-black/25">
                        {node.modelName || "unknown"}
                      </span>
                      <span className="text-[11px] text-black/50 underline underline-offset-2 decoration-black/20">
                        Read full research &rarr;
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* End of timeline marker */}
          <div className="relative z-10 flex justify-center pt-4">
            <div className="w-[2px] h-8 bg-black/15" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
              <div className="w-2 h-2 rounded-full bg-black/20" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
