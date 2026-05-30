"use client";

import { useState } from "react";
import Header from "@/components/Header";
import TopicSidebar from "@/components/TopicSidebar";
import GraphCanvas from "@/components/GraphCanvas";
import NodeDetailPanel from "@/components/NodeDetailPanel";
import ActivityFeed from "@/components/ActivityFeed";
import { useTopicGraph } from "@/hooks/useTopicGraph";
import { useTopicList } from "@/hooks/useTopicList";
import { GraphNode } from "@/lib/graph-helpers";
import { useEffect } from "react";

export default function Home() {
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);

  const { topics, loading: topicsLoading } = useTopicList();
  const { graphData, loading: graphLoading } = useTopicGraph(selectedTopicId);

  // Auto-select the first topic when topics load, if none is selected
  useEffect(() => {
    if (topics.length > 0 && !selectedTopicId) {
      setSelectedTopicId(topics[0].id);
    }
  }, [topics, selectedTopicId]);

  // Compute total blobs/nodes across all active topics
  const totalBlobs = topics.reduce((acc, topic) => acc + topic.nodeCount, 0);

  return (
    <>
      <Header
        topicCount={topics.length}
        blobCount={totalBlobs}
        onSettingsClick={() => setSettingsOpen(true)}
      />

      {/* Main layout — full height minus header */}
      <main className="flex-1 flex mt-[56px] h-[calc(100vh-56px)] relative">
        <TopicSidebar
          topics={topics}
          loading={topicsLoading}
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

        <ActivityFeed />
      </main>
    </>
  );
}
