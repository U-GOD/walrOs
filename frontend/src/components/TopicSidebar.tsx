"use client";

interface Topic {
  id: string;
  label: string;
  address: string;
  nodeCount: number;
}

interface TopicSidebarProps {
  topics: Topic[];
  selectedTopicId: string | null;
  onTopicSelect: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

// Placeholder topics — will be replaced with real Sui event data in Step 2.6.5
const PLACEHOLDER_TOPICS: Topic[] = [
  { id: "1", label: "Sui Consensus Evolution", address: "0x2a9d...1234", nodeCount: 14 },
  { id: "2", label: "Walrus Storage Efficiency", address: "0x8b4f...9912", nodeCount: 8 },
  { id: "3", label: "Data Availability Sampling", address: "0xf10c...3341", nodeCount: 32 },
  { id: "4", label: "Knowledge Graph Ontology", address: "0xaa22...5678", nodeCount: 105 },
];

export default function TopicSidebar({
  topics = PLACEHOLDER_TOPICS,
  selectedTopicId,
  onTopicSelect,
  isOpen,
  onClose,
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
      <div className="p-sm flex flex-col gap-[2px] overflow-y-auto flex-1 py-md">
        {topics.map((topic) => {
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
                  className={`font-label-sm text-label-sm uppercase px-2 py-[2px] rounded font-label-md ${
                    isActive
                      ? "bg-surface-container-high text-on-surface-variant"
                      : "bg-surface-container text-on-surface-variant group-hover:bg-surface-container-high transition-cubic"
                  }`}
                >
                  {topic.nodeCount} Nodes
                </span>
              </div>
              <span className="font-label-md text-label-md text-outline font-normal font-mono">
                {topic.address}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom Navigation */}
      <div className="mt-auto border-t border-hairline p-md bg-surface-bright">
        <nav className="flex flex-col">
          {[
            { icon: "account_tree", label: "Knowledge Graph" },
            { icon: "data_object", label: "Research Blobs" },
            { icon: "format_list_bulleted", label: "Topic Indices", active: true },
            { icon: "query_stats", label: "System Status" },
          ].map(({ icon, label, active }) => (
            <a
              key={label}
              href="#"
              className={`
                flex items-center gap-md py-3 px-4 transition-cubic
                font-label-md text-label-md uppercase tracking-widest text-primary
                hover:bg-surface-container-high
                ${active ? "bg-surface-container-high border-l-[3px] border-primary" : ""}
              `}
            >
              <span className="material-symbols-outlined">{icon}</span>
              {label}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}
