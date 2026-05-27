"use client";

import { useState } from "react";
import Header from "@/components/Header";
import TopicSidebar from "@/components/TopicSidebar";
import GraphCanvas from "@/components/GraphCanvas";
import NodeDetailPanel from "@/components/NodeDetailPanel";
import { useTopicGraph } from "@/hooks/useTopicGraph";
import { GraphNode } from "@/lib/graph-helpers";

export default function Home() {
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>("1");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const { graphData, loading: graphLoading } = useTopicGraph(selectedTopicId);

  return (
    <>
      <Header />

      {/* Main layout — full height minus header */}
      <main className="flex-1 flex mt-[56px] h-[calc(100vh-56px)] relative">
        <TopicSidebar
          topics={[]}
          selectedTopicId={selectedTopicId}
          onTopicSelect={(id) => {
            setSelectedTopicId(id);
            setSidebarOpen(false);
          }}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <GraphCanvas
          graphData={graphData}
          onMenuOpen={() => setSidebarOpen(true)}
          onDetailToggle={() => setDetailOpen((prev) => !prev)}
          onNodeSelect={(node) => {
            setSelectedNode(node);
            if (window.innerWidth < 1280) setDetailOpen(true);
          }}
        />

        <NodeDetailPanel
          node={selectedNode}
          isOpen={detailOpen}
          onClose={() => setDetailOpen(false)}
        />
      </main>
    </>
  );
}
