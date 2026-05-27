"use client";

import { useState } from "react";
import Header from "@/components/Header";
import TopicSidebar from "@/components/TopicSidebar";
import GraphCanvas from "@/components/GraphCanvas";
import NodeDetailPanel from "@/components/NodeDetailPanel";

export default function Home() {
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>("1");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

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
          onMenuOpen={() => setSidebarOpen(true)}
          onDetailToggle={() => setDetailOpen((prev) => !prev)}
        />

        <NodeDetailPanel
          isOpen={detailOpen}
          onClose={() => setDetailOpen(false)}
        />
      </main>
    </>
  );
}
