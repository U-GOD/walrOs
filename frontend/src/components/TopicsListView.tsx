"use client";

import { TopicItem } from "../hooks/useTopicList";

interface TopicsListViewProps {
  topics: TopicItem[];
  onTopicSelect: (id: string) => void;
}

export default function TopicsListView({ topics, onTopicSelect }: TopicsListViewProps) {
  const copyToClipboard = (text: string, event: React.MouseEvent) => {
    event.stopPropagation();
    navigator.clipboard.writeText(text);
  };

  return (
    <section className="flex-1 bg-surface flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="p-md border-b border-hairline flex justify-between items-center bg-surface-bright">
        <div>
          <h2 className="font-headline-sm text-primary font-medium tracking-tight">Topic Indices</h2>
          <p className="font-body-md text-outline mt-1">
            Browse all decentralized knowledge topics currently tracked by WalrOS.
          </p>
        </div>
        <div className="bg-surface-container px-3 py-1 rounded font-label-md text-primary text-sm">
          {topics.length} Topics Active
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto p-md bg-surface">
        {topics.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <span className="material-symbols-outlined text-outline text-5xl mb-4">menu_book</span>
            <p className="font-headline-sm text-primary">No Topics Found</p>
            <p className="font-label-md text-on-surface-variant mt-2 max-w-md">
              The network is currently empty. Start the WalrOS agents to create new topics and populate the knowledge graph.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
            {topics.map((topic) => (
              <div
                key={topic.id}
                onClick={() => onTopicSelect(topic.id)}
                className="bg-surface-container-lowest border border-hairline rounded-xl p-md flex flex-col cursor-pointer transition-cubic hover:-translate-y-1 hover:shadow-lg hover:border-outline-variant group"
              >
                <div className="flex justify-between items-start mb-sm">
                  <span className="font-label-sm uppercase tracking-widest text-primary bg-surface-container px-2 py-1 rounded">
                    Topic Root
                  </span>
                  <div className="flex items-center gap-1 text-on-surface-variant bg-surface-bright border border-hairline px-2 py-1 rounded-full font-label-md text-xs">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    {topic.nodeCount} Node{topic.nodeCount !== 1 ? 's' : ''}
                  </div>
                </div>

                <h3 className="font-headline-sm text-[16px] text-primary font-medium mb-md line-clamp-3 group-hover:text-blue-600 transition-colors">
                  {topic.label}
                </h3>

                <div className="mt-auto pt-md border-t border-hairline flex flex-col gap-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-outline uppercase">Topic ID</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-[11px] text-on-surface-variant">{topic.id.substring(0, 10)}...</span>
                      <button 
                        onClick={(e) => copyToClipboard(topic.id, e)}
                        className="text-outline hover:text-primary transition-cubic"
                      >
                        <span className="material-symbols-outlined text-[14px]">content_copy</span>
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-outline uppercase">Creator</span>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-[11px] text-on-surface-variant">{topic.address.substring(0, 10)}...</span>
                      <button 
                        onClick={(e) => copyToClipboard(topic.address, e)}
                        className="text-outline hover:text-primary transition-cubic"
                      >
                        <span className="material-symbols-outlined text-[14px]">content_copy</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
