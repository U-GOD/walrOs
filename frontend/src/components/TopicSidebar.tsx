"use client";

import { TopicItem } from "../hooks/useTopicList";

export type ViewMode = 'graph' | 'blobs' | 'topics' | 'status';

interface TopicSidebarProps {
  topics: TopicItem[];
  loading?: boolean;
  selectedTopicId: string | null;
  onTopicSelect: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
  activeView: ViewMode;
  onViewChange: (view: ViewMode) => void;
}

export default function TopicSidebar({
  topics = [],
  loading = false,
  selectedTopicId,
  onTopicSelect,
  isOpen,
  onClose,
  activeView,
  onViewChange,
}: TopicSidebarProps) {
  return (
    <aside
      id="leftDrawer"
      className={`
        w-full md:w-80 flex-shrink-0 bg-surface-container-low border-hairline-r
        flex flex-col z-40 absolute inset-y-0 left-0
        md:relative md:translate-x-0 transition-cubic
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}
    >
      {/* Sidebar Header */}
      <div className="p-md border-hairline-b flex items-center justify-between">
        <h2 className="font-label-md text-label-md uppercase tracking-widest text-primary">
          Topic Indices
        </h2>
        <button
          className="md:hidden p-xs rounded-full hover:bg-surface-container transition-cubic"
          onClick={onClose}
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>
      </div>

      {/* Topic List */}
      <div className="p-sm flex flex-col gap-[2px] overflow-y-auto flex-1 py-md relative">
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="material-symbols-outlined indicator-pulse text-outline text-3xl">hourglass_empty</span>
          </div>
        ) : topics.length === 0 ? (
          <div className="p-4 text-center text-on-surface-variant font-label-md text-sm mt-10">
            No active topics found. Start an agent to create one!
          </div>
        ) : (
          topics.map((topic) => {
            const isActive = topic.id === selectedTopicId;
            return (
              <button
                key={topic.id}
                onClick={() => onTopicSelect(topic.id)}
                className={`
                  flex flex-col items-start gap-[2px] py-3 px-4 text-left w-full
                  border-l-[3px] transition-cubic group
                  ${
                    isActive
                      ? "bg-[#f5f5f5] border-primary text-primary"
                      : "border-transparent text-on-surface-variant hover:bg-surface-container"
                  }
                `}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`font-headline-sm text-[16px] line-clamp-1 ${
                      isActive ? "text-primary" : "group-hover:text-primary transition-cubic"
                    }`}
                  >
                    {topic.label}
                  </span>
                  <span
                    className={`font-label-sm text-label-sm uppercase px-2 py-[2px] rounded font-label-md flex-shrink-0 ml-2 ${
                      isActive
                        ? "bg-surface-container-high text-on-surface-variant"
                        : "bg-surface-container text-on-surface-variant group-hover:bg-surface-container-high transition-cubic"
                    }`}
                  >
                    {topic.nodeCount} Node{topic.nodeCount !== 1 && "s"}
                  </span>
                </div>
                <span className="font-label-md text-label-md text-outline font-normal font-mono text-[12px] mt-1">
                  Topic ID: {topic.id.substring(0, 10)}...
                </span>
                <span className="font-label-md text-label-md text-outline font-normal font-mono text-[11px] mt-0.5">
                  Creator: {topic.address.substring(0, 8)}...
                </span>
              </button>
            );
          })
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="mt-auto border-t border-hairline p-md bg-surface-bright">
        <nav className="flex flex-col">
          {[
            { id: 'graph', icon: "account_tree", label: "Knowledge Graph" },
            { id: 'blobs', icon: "data_object", label: "Research Blobs" },
            { id: 'topics', icon: "format_list_bulleted", label: "Topic Indices" },
            { id: 'status', icon: "query_stats", label: "System Status" },
          ].map(({ id, icon, label }) => {
            const isActive = activeView === id;
            return (
              <button
                key={id}
                onClick={() => onViewChange(id as ViewMode)}
                className={`
                  flex items-center gap-md py-3 px-4 transition-cubic text-left w-full
                  font-label-md text-label-md uppercase tracking-widest text-primary
                  hover:bg-surface-container-high
                  ${isActive ? "bg-surface-container-high border-l-[3px] border-primary" : "border-l-[3px] border-transparent"}
                `}
              >
                <span className="material-symbols-outlined">{icon}</span>
                {label}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
