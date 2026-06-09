"use client";

import { useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";
import { GraphData, GraphNode, GraphLink } from "../lib/graph-helpers";
import GraphLegend from "./GraphLegend";

interface GraphCanvasProps {
  graphData: GraphData;
  focusedNodeId?: string;
  onMenuOpen: () => void;
  onDetailToggle: () => void;
  onNodeSelect: (node: GraphNode) => void;
}

const NODE_COLORS: Record<string, string> = {
  root: "#1e293b",
  contribution: "#2563eb",
  challenge: "#dc2626",
  refinement: "#0d9488",
  synthesis: "#16a34a",
  fallback: "#999999",
};

const EDGE_COLORS: Record<number, string> = {
  0: "#94a3b8",
  1: "#dc2626",
  2: "#0d9488",
  3: "#16a34a",
};

function getNodeColor(d: GraphNode): string {
  if (d.depth === 0) return NODE_COLORS.root;
  if (d.nodeType === 0) return NODE_COLORS.contribution;
  if (d.nodeType === 1) return NODE_COLORS.challenge;
  if (d.nodeType === 2) return NODE_COLORS.refinement;
  if (d.nodeType === 3) return NODE_COLORS.synthesis;
  return NODE_COLORS.fallback;
}

function getNodeRadius(d: GraphNode): number {
  if (d.depth === 0) return 32;
  if (d.nodeType === 3) return 20;
  return 16;
}

function getNodeTypeLabel(d: GraphNode): string {
  if (d.depth === 0) return d.label ? (d.label.length > 24 ? d.label.substring(0, 24) + "..." : d.label) : "Topic Root";
  if (d.nodeType === 0) return "Contribution";
  if (d.nodeType === 1) return "Challenge";
  if (d.nodeType === 2) return "Refinement";
  if (d.nodeType === 3) return "Synthesis";
  return "Unknown";
}

function getEdgeLabel(rel: number): string {
  if (rel === 1) return "challenges";
  if (rel === 2) return "refines";
  if (rel === 3) return "synthesizes";
  return "";
}

/**
 * Build a curved path between two nodes using a quadratic bezier.
 * Offsets the curve perpendicular to the line to avoid edge overlap.
 */
function buildCurvedPath(
  sx: number, sy: number,
  tx: number, ty: number,
  targetRadius: number,
  curvature: number = 0
): string {
  const dx = tx - sx;
  const dy = ty - sy;
  const dist = Math.sqrt(dx * dx + dy * dy) || 1;

  // Shorten the line to stop at the target node edge
  const endX = tx - (dx / dist) * targetRadius;
  const endY = ty - (dy / dist) * targetRadius;

  if (curvature === 0) {
    return `M${sx},${sy} L${endX},${endY}`;
  }

  // Perpendicular offset for the control point
  const mx = (sx + endX) / 2;
  const my = (sy + endY) / 2;
  const nx = -(endY - sy) / dist;
  const ny = (endX - sx) / dist;
  const cx = mx + nx * curvature;
  const cy = my + ny * curvature;

  return `M${sx},${sy} Q${cx},${cy} ${endX},${endY}`;
}

export default function GraphCanvas({
  graphData,
  focusedNodeId,
  onMenuOpen,
  onDetailToggle,
  onNodeSelect,
}: GraphCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  const onNodeSelectRef = useRef(onNodeSelect);
  const onDetailToggleRef = useRef(onDetailToggle);
  onNodeSelectRef.current = onNodeSelect;
  onDetailToggleRef.current = onDetailToggle;

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });

    svg.call(zoom);
    zoomRef.current = zoom;

    const g = svg.append("g");

    // Arrow markers
    const defs = svg.append("defs");
    Object.entries(EDGE_COLORS).forEach(([rel, color]) => {
      defs.append("marker")
        .attr("id", `arrow-${rel}`)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 10)
        .attr("refY", 0)
        .attr("markerWidth", 7)
        .attr("markerHeight", 7)
        .attr("orient", "auto")
        .append("path")
        .attr("fill", color)
        .attr("d", "M0,-4L10,0L0,4");
    });

    // Drop shadow for nodes
    const filter = defs.append("filter")
      .attr("id", "node-shadow")
      .attr("x", "-50%").attr("y", "-50%")
      .attr("width", "200%").attr("height", "200%");
    filter.append("feDropShadow")
      .attr("dx", 0).attr("dy", 2)
      .attr("stdDeviation", 4)
      .attr("flood-color", "#000")
      .attr("flood-opacity", 0.12);

    const nodes = graphData.nodes.map((d) => ({ ...d }));
    const links = graphData.links.map((d) => ({ ...d }));

    if (nodes.length === 0) return;

    // Detect duplicate edges between same source-target pair to apply curvature
    const edgePairCount: Record<string, number> = {};
    const edgePairIndex: number[] = [];
    for (const link of links) {
      const s = typeof link.source === "string" ? link.source : link.source.id;
      const t = typeof link.target === "string" ? link.target : link.target.id;
      const key = [s, t].sort().join("-");
      edgePairCount[key] = (edgePairCount[key] || 0) + 1;
    }
    const edgePairSeen: Record<string, number> = {};
    for (const link of links) {
      const s = typeof link.source === "string" ? link.source : link.source.id;
      const t = typeof link.target === "string" ? link.target : link.target.id;
      const key = [s, t].sort().join("-");
      edgePairSeen[key] = (edgePairSeen[key] || 0) + 1;
      const total = edgePairCount[key];
      if (total <= 1) {
        edgePairIndex.push(0);
      } else {
        const idx = edgePairSeen[key];
        edgePairIndex.push((idx % 2 === 0 ? 1 : -1) * Math.ceil(idx / 2) * 40);
      }
    }

    // Pin root at center
    const rootNode = nodes.find(n => n.depth === 0);
    if (rootNode) {
      rootNode.x = width / 2;
      rootNode.y = height / 2;
      rootNode.fx = width / 2;
      rootNode.fy = height / 2;
    }

    // Find max depth for radial scaling
    const maxDepth = Math.max(...nodes.map(n => n.depth), 1);
    const radialStep = Math.min(200, Math.min(width, height) / (maxDepth + 2));

    const simulation = d3
      .forceSimulation<GraphNode>(nodes)
      .force(
        "link",
        d3.forceLink<GraphNode, GraphLink>(links)
          .id((d) => d.id)
          .distance((d) => {
            const src = d.source as GraphNode;
            const tgt = d.target as GraphNode;
            return 120 + Math.abs(src.depth - tgt.depth) * 60;
          })
          .strength(0.5)
      )
      .force("charge", d3.forceManyBody().strength(-1200))
      .force("center", d3.forceCenter(width / 2, height / 2).strength(0.03))
      .force("collide", d3.forceCollide<GraphNode>().radius((d) => getNodeRadius(d) + 40).strength(0.8))
      .force("radial", d3.forceRadial<GraphNode>((d) => d.depth * radialStep, width / 2, height / 2).strength(0.6));

    // Draw edges as paths (for curves)
    const linkGroup = g.append("g").attr("class", "links");
    const linkPath = linkGroup
      .selectAll("path")
      .data(links)
      .join("path")
      .attr("fill", "none")
      .attr("stroke", (d) => EDGE_COLORS[d.relationship as keyof typeof EDGE_COLORS] || "#94a3b8")
      .attr("stroke-width", (d) => d.relationship === 0 ? 1.5 : 2)
      .attr("stroke-dasharray", (d) => (d.relationship === 1 ? "6,4" : "none"))
      .attr("stroke-opacity", 0.55)
      .attr("marker-end", (d) => `url(#arrow-${d.relationship})`);

    // Edge labels
    const edgeLabelGroup = g.append("g").attr("class", "edge-labels");
    const edgeLabel = edgeLabelGroup
      .selectAll("text")
      .data(links.filter(d => d.relationship !== 0))
      .join("text")
      .attr("fill", (d) => EDGE_COLORS[d.relationship as keyof typeof EDGE_COLORS] || "#94a3b8")
      .attr("font-size", "8px")
      .attr("font-family", "'Inter', sans-serif")
      .attr("font-weight", "500")
      .attr("text-anchor", "middle")
      .attr("dy", -6)
      .attr("opacity", 0.6)
      .attr("pointer-events", "none")
      .text((d) => getEdgeLabel(d.relationship));

    // Draw nodes
    const nodeGroup = g.append("g").attr("class", "nodes");
    const node = nodeGroup
      .selectAll<SVGGElement, GraphNode>("g")
      .data(nodes)
      .join("g")
      .attr("class", "node-group")
      .style("cursor", "pointer")
      .on("click", (event, d) => {
        onNodeSelectRef.current(d);
        onDetailToggleRef.current();
      })
      .call(
        d3.drag<SVGGElement, GraphNode>()
          .on("start", (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          .on("drag", (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
          })
          .on("end", (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            if (d.depth !== 0) {
              d.fx = null;
              d.fy = null;
            }
          }) as any
      );

    // Outer glow ring
    node.append("circle")
      .attr("r", (d) => getNodeRadius(d) + 6)
      .attr("fill", "none")
      .attr("stroke", (d) => getNodeColor(d))
      .attr("stroke-width", 0)
      .attr("stroke-opacity", 0.25)
      .attr("class", "hover-ring");

    // Main circle with shadow
    node.append("circle")
      .attr("r", getNodeRadius)
      .attr("fill", getNodeColor)
      .attr("stroke", (d) => d.id === focusedNodeId ? "#fbbf24" : "rgba(255,255,255,0.9)")
      .attr("stroke-width", (d) => d.id === focusedNodeId ? 3 : 2)
      .style("filter", "url(#node-shadow)");

    // Icon inside root node
    node.filter(d => d.depth === 0)
      .append("text")
      .attr("text-anchor", "middle")
      .attr("dominant-baseline", "central")
      .attr("fill", "#ffffff")
      .attr("font-size", "18px")
      .attr("font-weight", "700")
      .attr("pointer-events", "none")
      .text("T");

    // Label below node
    node.append("text")
      .attr("dy", (d) => getNodeRadius(d) + 16)
      .attr("text-anchor", "middle")
      .attr("fill", "#334155")
      .attr("font-size", "11px")
      .attr("font-weight", "600")
      .attr("font-family", "'Inter', sans-serif")
      .attr("pointer-events", "none")
      .text(getNodeTypeLabel);

    // Model name sub-label
    node.append("text")
      .attr("dy", (d) => getNodeRadius(d) + 28)
      .attr("text-anchor", "middle")
      .attr("fill", "#94a3b8")
      .attr("font-size", "9px")
      .attr("font-family", "'Inter', sans-serif")
      .attr("pointer-events", "none")
      .text((d) => d.depth === 0 ? "" : d.modelName || "");

    // Hover interactions
    node
      .on("mouseenter", function (event, d) {
        d3.select(this).select(".hover-ring")
          .transition().duration(200)
          .attr("stroke-width", 3);
        d3.select(this).select("circle:nth-child(2)")
          .transition().duration(200)
          .attr("r", getNodeRadius(d) + 3);
      })
      .on("mouseleave", function (event, d) {
        d3.select(this).select(".hover-ring")
          .transition().duration(200)
          .attr("stroke-width", 0);
        d3.select(this).select("circle:nth-child(2)")
          .transition().duration(200)
          .attr("r", getNodeRadius(d));
      });

    // Tooltip
    node.append("title").text((d) => {
      const typeStr = getNodeTypeLabel(d);
      return `${typeStr}\nModel: ${d.modelName || "N/A"}\nAgent: ${d.agentAddress.substring(0, 10)}...\nDepth: ${d.depth}`;
    });

    // Tick handler
    simulation.on("tick", () => {
      linkPath.attr("d", (d, i) => {
        const src = d.source as GraphNode;
        const tgt = d.target as GraphNode;
        const curve = edgePairIndex[links.indexOf(d)] || 0;
        return buildCurvedPath(src.x!, src.y!, tgt.x!, tgt.y!, getNodeRadius(tgt), curve);
      });

      edgeLabel
        .attr("x", (d) => ((d.source as GraphNode).x! + (d.target as GraphNode).x!) / 2)
        .attr("y", (d) => ((d.source as GraphNode).y! + (d.target as GraphNode).y!) / 2)
        .attr("transform", function (d) {
          const sx = (d.source as GraphNode).x!;
          const sy = (d.source as GraphNode).y!;
          const tx = (d.target as GraphNode).x!;
          const ty = (d.target as GraphNode).y!;
          const cx = (sx + tx) / 2;
          const cy = (sy + ty) / 2;
          let angle = Math.atan2(ty - sy, tx - sx) * 180 / Math.PI;
          if (angle > 90 || angle < -90) angle += 180;
          return `rotate(${angle}, ${cx}, ${cy})`;
        });

      node.attr("transform", (d) => `translate(${d.x},${d.y})`);
    });

    // Auto-fit after simulation settles
    simulation.on("end", () => {
      if (rootNode) {
        rootNode.fx = null;
        rootNode.fy = null;
      }

      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      nodes.forEach(n => {
        if (n.x !== undefined && n.y !== undefined) {
          minX = Math.min(minX, n.x - 80);
          maxX = Math.max(maxX, n.x + 80);
          minY = Math.min(minY, n.y - 80);
          maxY = Math.max(maxY, n.y + 80);
        }
      });

      const graphWidth = maxX - minX;
      const graphHeight = maxY - minY;
      const scale = Math.min(width / graphWidth, height / graphHeight, 1.5) * 0.82;
      const tx = (width - graphWidth * scale) / 2 - minX * scale;
      const ty = (height - graphHeight * scale) / 2 - minY * scale;

      svg.transition().duration(800).call(
        zoom.transform,
        d3.zoomIdentity.translate(tx, ty).scale(scale)
      );
    });

    return () => {
      simulation.stop();
    };
  }, [graphData, focusedNodeId]);

  // Focus on a specific node
  useEffect(() => {
    if (!focusedNodeId || !svgRef.current || !zoomRef.current || !containerRef.current) return;

    const svg = d3.select(svgRef.current);
    let targetNode: GraphNode | undefined;

    svg.selectAll<SVGGElement, GraphNode>(".node-group").each(function (d) {
      if (d.id === focusedNodeId) {
        targetNode = d;
      }
    });

    if (targetNode && targetNode.x !== undefined && targetNode.y !== undefined) {
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;

      svg.transition().duration(750).call(
        zoomRef.current.transform,
        d3.zoomIdentity.translate(width / 2 - targetNode.x * 1.5, height / 2 - targetNode.y * 1.5).scale(1.5)
      );
    }
  }, [focusedNodeId]);

  const handleZoomIn = useCallback(() => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current).transition().call(zoomRef.current.scaleBy, 1.3);
    }
  }, []);

  const handleZoomOut = useCallback(() => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current).transition().call(zoomRef.current.scaleBy, 0.7);
    }
  }, []);

  const handleZoomReset = useCallback(() => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current).transition().call(zoomRef.current.transform, d3.zoomIdentity);
    }
  }, []);

  return (
    <section className="flex-1 bg-dot-grid relative overflow-hidden flex flex-col" ref={containerRef}>
      {/* Mobile Drawer Toggle */}
      <button
        className="md:hidden absolute top-md left-md z-30 bg-surface p-sm rounded-full border-hairline shadow-sm transition-cubic control-btn"
        onClick={onMenuOpen}
      >
        <span className="material-symbols-outlined text-[20px]">menu</span>
      </button>

      {/* Graph SVG */}
      <div className="w-full h-full relative cursor-move" id="graphCanvas">
        <svg ref={svgRef} className="absolute inset-0 w-full h-full" />
      </div>

      {/* Zoom Controls */}
      <div className="absolute bottom-xl left-1/2 -translate-x-1/2 bg-surface rounded-full border-hairline flex items-center p-1 shadow-sm z-20">
        <button
          className="w-10 h-10 rounded-full flex items-center justify-center text-outline hover:text-primary hover:bg-surface-container-low transition-cubic control-btn"
          title="Zoom Out"
          onClick={handleZoomOut}
        >
          <span className="material-symbols-outlined text-[20px]">remove</span>
        </button>
        <div className="w-px h-6 bg-surface-variant mx-1" />
        <button
          className="w-10 h-10 rounded-full flex items-center justify-center text-outline hover:text-primary hover:bg-surface-container-low transition-cubic control-btn"
          title="Reset View"
          onClick={handleZoomReset}
        >
          <span className="material-symbols-outlined text-[20px]">fit_screen</span>
        </button>
        <div className="w-px h-6 bg-surface-variant mx-1" />
        <button
          className="w-10 h-10 rounded-full flex items-center justify-center text-outline hover:text-primary hover:bg-surface-container-low transition-cubic control-btn"
          title="Zoom In"
          onClick={handleZoomIn}
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
        </button>
      </div>

      {/* Mobile Detail Toggle */}
      <button
        className="xl:hidden absolute top-md right-md z-30 bg-surface px-3 py-2 rounded-full border-hairline shadow-sm font-label-md text-label-md text-primary flex items-center gap-xs transition-cubic control-btn"
        onClick={onDetailToggle}
      >
        <span className="material-symbols-outlined text-[16px]">info</span> Details
      </button>

      <GraphLegend />
    </section>
  );
}
