"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Header";
import TopicSidebar, { ViewMode } from "@/components/TopicSidebar";
import KnowledgeTimeline from "@/components/KnowledgeTimeline";
import NodeDetailPanel from "@/components/NodeDetailPanel";
import ActivityFeed from "@/components/ActivityFeed";
import SettingsModal from "@/components/SettingsModal";
import BlobsListView from "@/components/BlobsListView";
import SystemStatusView from "@/components/SystemStatusView";
import { useTopicGraph } from "@/hooks/useTopicGraph";
import { useTopicList } from "@/hooks/useTopicList";
import { GraphNode } from "@/lib/graph-helpers";

export default function Home() {
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activityOpen, setActivityOpen] = useState(false);
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [pendingSelectNodeId, setPendingSelectNodeId] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<ViewMode>("graph");

  const { topics, loading: topicsLoading } = useTopicList();
  const selectedTopic = topics.find(t => t.id === selectedTopicId);
  const { graphData, loading: graphLoading } = useTopicGraph(selectedTopicId, selectedTopic?.label);

  // Auto-select the first topic when topics load
  useEffect(() => {
    if (topics.length > 0 && !selectedTopicId) {
      setSelectedTopicId(topics[0].id);
    }
  }, [topics, selectedTopicId]);

  // Handle cross-topic node selection from activity feed
  useEffect(() => {
    if (pendingSelectNodeId && graphData?.nodes) {
      const node = graphData.nodes.find(n => n.id === pendingSelectNodeId);
      if (node) {
        setSelectedNode(node);
        setDetailOpen(true);
        setPendingSelectNodeId(null);
      }
    }
  }, [pendingSelectNodeId, graphData]);

  const totalBlobs = topics.reduce((acc, topic) => acc + topic.nodeCount, 0);

  return (
    <div className="h-screen overflow-hidden flex flex-col">
      <Header
        topicCount={topics.length}
        blobCount={totalBlobs}
        onSettingsClick={() => setSettingsOpen(true)}
        onActivityClick={() => setActivityOpen(true)}
      />

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
            <KnowledgeTimeline
              graphData={graphData}
              selectedNodeId={selectedNode?.id}
              onMenuOpen={() => setSidebarOpen(true)}
              onNodeSelect={(node) => {
                setSelectedNode(node);
                setDetailOpen(true);
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
          <BlobsListView topics={topics} />
        )}

        {activeView === "status" && (
          <SystemStatusView />
        )}

        <ActivityFeed 
          isOpen={activityOpen} 
          onClose={() => setActivityOpen(false)} 
          onEventClick={(event) => {
            if (event.topicId) {
              setSelectedTopicId(event.topicId);
              setActiveView("graph");
            }
            if (event.nodeId) {
              setPendingSelectNodeId(event.nodeId);
            } else {
              setDetailOpen(false);
            }
            if (window.innerWidth < 768) {
              setActivityOpen(false);
            }
          }}
        />
      </main>

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
}
