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
  0: "#cbd5e1",
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
  if (d.depth === 0) return 28;
  if (d.nodeType === 3) return 18;
  return 14;
}

function getNodeTypeLabel(d: GraphNode): string {
  if (d.depth === 0) return d.label ? (d.label.length > 28 ? d.label.substring(0, 28) + "..." : d.label) : "Topic Root";
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

    // Arrow markers scaled per relationship
    const defs = svg.append("defs");
    Object.entries(EDGE_COLORS).forEach(([rel, color]) => {
      defs.append("marker")
        .attr("id", `arrow-${rel}`)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 10)
        .attr("refY", 0)
        .attr("markerWidth", 8)
        .attr("markerHeight", 8)
        .attr("orient", "auto")
        .append("path")
        .attr("fill", color)
        .attr("d", "M0,-4L10,0L0,4");
    });

    const nodes = graphData.nodes.map((d) => ({ ...d }));
    const links = graphData.links.map((d) => ({ ...d }));

    if (nodes.length === 0) return;

    // Pre-position: place root at center, others radially by depth
    const rootNode = nodes.find(n => n.depth === 0);
    if (rootNode) {
      rootNode.x = width / 2;
      rootNode.y = height / 2;
      rootNode.fx = width / 2;
      rootNode.fy = height / 2;
    }

    const simulation = d3
      .forceSimulation<GraphNode>(nodes)
      .force(
        "link",
        d3.forceLink<GraphNode, GraphLink>(links)
          .id((d) => d.id)
          .distance(180)
          .strength(0.8)
      )
      .force("charge", d3.forceManyBody().strength(-800))
      .force("center", d3.forceCenter(width / 2, height / 2).strength(0.05))
      .force("collide", d3.forceCollide<GraphNode>().radius((d) => getNodeRadius(d) + 50))
      .force("radial", d3.forceRadial<GraphNode>((d) => d.depth * 160, width / 2, height / 2).strength(0.3));

    // Draw edges
    const linkGroup = g.append("g").attr("class", "links");

    const linkLine = linkGroup
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", (d) => EDGE_COLORS[d.relationship as keyof typeof EDGE_COLORS] || "#cbd5e1")
      .attr("stroke-width", (d) => d.relationship === 0 ? 1.5 : 2)
      .attr("stroke-dasharray", (d) => (d.relationship === 1 ? "6,4" : "none"))
      .attr("stroke-opacity", 0.7)
      .attr("marker-end", (d) => `url(#arrow-${d.relationship})`);

    const edgeLabelGroup = g.append("g").attr("class", "edge-labels");
    const edgeLabel = edgeLabelGroup
      .selectAll("text")
      .data(links.filter(d => d.relationship !== 0))
      .join("text")
      .attr("fill", (d) => EDGE_COLORS[d.relationship as keyof typeof EDGE_COLORS] || "#94a3b8")
      .attr("font-size", "9px")
      .attr("font-family", "'Inter', sans-serif")
      .attr("text-anchor", "middle")
      .attr("dy", -8)
      .attr("opacity", 0.8)
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

    // Outer glow ring on hover
    node.append("circle")
      .attr("r", (d) => getNodeRadius(d) + 6)
      .attr("fill", "none")
      .attr("stroke", (d) => getNodeColor(d))
      .attr("stroke-width", 0)
      .attr("stroke-opacity", 0.2)
      .attr("class", "hover-ring");

    // Main circle
    node.append("circle")
      .attr("r", getNodeRadius)
      .attr("fill", getNodeColor)
      .attr("stroke", (d) => d.id === focusedNodeId ? "#fbbf24" : "#ffffff")
      .attr("stroke-width", (d) => d.id === focusedNodeId ? 3 : 1.5);

    // Label below node
    node.append("text")
      .attr("dy", (d) => getNodeRadius(d) + 14)
      .attr("text-anchor", "middle")
      .attr("fill", "#334155")
      .attr("font-size", "11px")
      .attr("font-weight", "600")
      .attr("font-family", "'Inter', sans-serif")
      .text(getNodeTypeLabel);

    // Model name below label
    node.append("text")
      .attr("dy", (d) => getNodeRadius(d) + 26)
      .attr("text-anchor", "middle")
      .attr("fill", "#94a3b8")
      .attr("font-size", "9px")
      .attr("font-family", "'Inter', sans-serif")
      .text((d) => d.depth === 0 ? "" : d.modelName || "");

    // Hover interactions
    node
      .on("mouseenter", function () {
        d3.select(this).select(".hover-ring").attr("stroke-width", 3);
      })
      .on("mouseleave", function () {
        d3.select(this).select(".hover-ring").attr("stroke-width", 0);
      });

    // Native tooltip
    node.append("title").text((d) => {
      const typeStr = getNodeTypeLabel(d);
      return `${typeStr}\nModel: ${d.modelName || "N/A"}\nAgent: ${d.agentAddress.substring(0, 10)}...\nDepth: ${d.depth}`;
    });

    // Tick
    simulation.on("tick", () => {
      linkLine
        .attr("x1", (d) => (d.source as GraphNode).x!)
        .attr("y1", (d) => (d.source as GraphNode).y!)
        .attr("x2", (d) => {
          const src = d.source as GraphNode;
          const tgt = d.target as GraphNode;
          const dx = tgt.x! - src.x!;
          const dy = tgt.y! - src.y!;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const r = getNodeRadius(tgt);
          return tgt.x! - (dx / dist) * r;
        })
        .attr("y2", (d) => {
          const src = d.source as GraphNode;
          const tgt = d.target as GraphNode;
          const dx = tgt.x! - src.x!;
          const dy = tgt.y! - src.y!;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const r = getNodeRadius(tgt);
          return tgt.y! - (dy / dist) * r;
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

    // After simulation settles, release root pin and fit graph to viewport
    simulation.on("end", () => {
      if (rootNode) {
        rootNode.fx = null;
        rootNode.fy = null;
      }

      // Auto-fit: compute bounding box of all nodes
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      nodes.forEach(n => {
        if (n.x !== undefined && n.y !== undefined) {
          minX = Math.min(minX, n.x - 60);
          maxX = Math.max(maxX, n.x + 60);
          minY = Math.min(minY, n.y - 60);
          maxY = Math.max(maxY, n.y + 60);
        }
      });

      const graphWidth = maxX - minX;
      const graphHeight = maxY - minY;
      const scale = Math.min(width / graphWidth, height / graphHeight, 1.5) * 0.85;
      const tx = (width - graphWidth * scale) / 2 - minX * scale;
      const ty = (height - graphHeight * scale) / 2 - minY * scale;

      svg.transition().duration(600).call(
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
