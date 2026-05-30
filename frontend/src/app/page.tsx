"use client";

import { useState } from "react";
import Header from "@/components/Header";
import TopicSidebar, { ViewMode } from "@/components/TopicSidebar";
import GraphCanvas from "@/components/GraphCanvas";
import NodeDetailPanel from "@/components/NodeDetailPanel";
import ActivityFeed from "@/components/ActivityFeed";
import SettingsModal from "@/components/SettingsModal";
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
  const [activeView, setActiveView] = useState<ViewMode>("graph");

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
            setActiveView("graph");
            setSidebarOpen(false);
          }}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeView={activeView}
          onViewChange={(view) => {
            setActiveView(view);
            setSidebarOpen(false);
          }}
        />

        {activeView === "graph" && (
          <>
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
          </>
        )}

        {activeView === "blobs" && (
          <section className="flex-1 bg-surface flex items-center justify-center">
            <h2 className="text-on-surface-variant font-label-md">Research Blobs View (Coming Soon)</h2>
          </section>
        )}

        {activeView === "topics" && (
          <section className="flex-1 bg-surface flex items-center justify-center">
            <h2 className="text-on-surface-variant font-label-md">Topics List View (Coming Soon)</h2>
          </section>
        )}

        {activeView === "status" && (
          <section className="flex-1 bg-surface flex items-center justify-center">
            <h2 className="text-on-surface-variant font-label-md">System Status View (Coming Soon)</h2>
          </section>
        )}

        <ActivityFeed />
      </main>

      <SettingsModal 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
      />
    </>
  );
}
