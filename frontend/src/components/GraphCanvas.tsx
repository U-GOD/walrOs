"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { GraphData, GraphNode, GraphLink } from "../lib/graph-helpers";

interface GraphCanvasProps {
  graphData: GraphData;
  onMenuOpen: () => void;
  onDetailToggle: () => void;
  onNodeSelect: (node: GraphNode) => void;
}

export default function GraphCanvas({
  graphData,
  onMenuOpen,
  onDetailToggle,
  onNodeSelect,
}: GraphCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // We need to keep references to the d3 zoom behavior to programmatically zoom
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous graph

    // Setup zoom
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on("zoom", (event) => {
        g.attr("transform", event.transform);
      });
    
    svg.call(zoom);
    zoomRef.current = zoom;

    const g = svg.append("g");

    // Add arrow markers for directed edges
    const defs = svg.append("defs");
    const markerColors = {
      0: "#e5e5e5", // PARENT_OF
      1: "#dc2626", // CHALLENGES
      2: "#0d9488", // REFINES
      3: "#16a34a", // SYNTHESIZES
    };

    Object.entries(markerColors).forEach(([rel, color]) => {
      defs.append("marker")
        .attr("id", `arrow-${rel}`)
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 25) // Offset to not overlap with node circle
        .attr("refY", 0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("path")
        .attr("fill", color)
        .attr("d", "M0,-5L10,0L0,5");
    });

    // We must clone nodes and links because d3 modifies them
    const nodes = graphData.nodes.map((d) => ({ ...d }));
    const links = graphData.links.map((d) => ({ ...d }));

    const simulation = d3
      .forceSimulation<GraphNode>(nodes)
      .force(
        "link",
        d3.forceLink<GraphNode, GraphLink>(links)
          .id((d) => d.id)
          .distance(100)
      )
      .force("charge", d3.forceManyBody().strength(-400))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collide", d3.forceCollide().radius(40));

    // Draw Links
    const link = g
      .append("g")
      .attr("stroke-opacity", 1)
      .selectAll("line")
      .data(links)
      .join("line")
      .attr("stroke", (d) => markerColors[d.relationship as keyof typeof markerColors])
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", (d) => (d.relationship === 1 ? "5,5" : "none"))
      .attr("marker-end", (d) => `url(#arrow-${d.relationship})`);

    // Draw Nodes
    const node = g
      .append("g")
      .selectAll("circle")
      .data(nodes)
      .join("circle")
      .attr("r", (d) => (d.depth === 0 ? 20 : 16))
      .attr("fill", (d) => {
        if (d.depth === 0) return "#1e293b"; // Root
        if (d.nodeType === 0) return "#2563eb"; // Contribution
        if (d.nodeType === 1) return "#dc2626"; // Challenge
        if (d.nodeType === 2) return "#0d9488"; // Refinement
        if (d.nodeType === 3) return "#16a34a"; // Synthesis
        return "#999999";
      })
      .attr("stroke", "#ffffff")
      .attr("stroke-width", 2)
      .attr("cursor", "pointer")
      .attr("class", "transition-cubic hover:shadow-md")
      .on("click", (event, d) => {
        onNodeSelect(d);
        onDetailToggle();
      })
      .call(
        d3.drag<SVGCircleElement, GraphNode>()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended)
      );

    // Node tooltips
    node.append("title").text((d) => {
      let typeStr = "Contribution";
      if (d.depth === 0) typeStr = "Topic Root";
      else if (d.nodeType === 1) typeStr = "Challenge";
      else if (d.nodeType === 2) typeStr = "Refinement";
      else if (d.nodeType === 3) typeStr = "Synthesis";
      return `${typeStr}\nModel: ${d.modelName || "N/A"}\nAgent: ${d.agentAddress.substring(0,6)}...`;
    });

    simulation.on("tick", () => {
      link
        .attr("x1", (d) => (d.source as GraphNode).x!)
        .attr("y1", (d) => (d.source as GraphNode).y!)
        .attr("x2", (d) => (d.target as GraphNode).x!)
        .attr("y2", (d) => (d.target as GraphNode).y!);

      node.attr("cx", (d) => d.x!).attr("cy", (d) => d.y!);
    });

    // Drag functions
    function dragstarted(event: any, d: GraphNode) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: GraphNode) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: GraphNode) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

    // Initial center on load if nodes exist
    if (nodes.length > 0) {
      // SVG auto centers on (width/2, height/2) due to forceCenter
      svg.call(zoom.transform as any, d3.zoomIdentity.translate(0, 0).scale(1));
    }

    return () => {
      simulation.stop();
    };
  }, [graphData, onNodeSelect, onDetailToggle]);

  // Zoom control handlers
  const handleZoomIn = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current).transition().call(zoomRef.current.scaleBy, 1.2);
    }
  };

  const handleZoomOut = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current).transition().call(zoomRef.current.scaleBy, 0.8);
    }
  };

  const handleZoomReset = () => {
    if (svgRef.current && zoomRef.current) {
      d3.select(svgRef.current).transition().call(zoomRef.current.transform, d3.zoomIdentity);
    }
  };

  return (
    <section className="flex-1 bg-dot-grid relative overflow-hidden flex flex-col" ref={containerRef}>
      {/* Mobile Drawer Toggle */}
      <button
        className="md:hidden absolute top-md left-md z-30 bg-surface p-sm rounded-full border-hairline shadow-[0_1px_2px_0_rgba(0,0,0,0.02)] transition-cubic control-btn"
        onClick={onMenuOpen}
      >
        <span className="material-symbols-outlined text-[20px]">menu</span>
      </button>

      {/* Graph Container */}
      <div className="w-full h-full relative cursor-move" id="graphCanvas">
        <svg ref={svgRef} className="absolute inset-0 w-full h-full" />
      </div>

      {/* Floating Zoom Controls */}
      <div className="absolute bottom-xl left-1/2 -translate-x-1/2 bg-surface rounded-full border-hairline flex items-center p-1 shadow-[0_1px_2px_0_rgba(0,0,0,0.02)] z-20">
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
        className="xl:hidden absolute top-md right-md z-30 bg-surface px-3 py-2 rounded-full border-hairline shadow-[0_1px_2px_0_rgba(0,0,0,0.02)] font-label-md text-label-md text-primary flex items-center gap-xs transition-cubic control-btn"
        onClick={onDetailToggle}
      >
        <span className="material-symbols-outlined text-[16px]">info</span> Details
      </button>
    </section>
  );
}
