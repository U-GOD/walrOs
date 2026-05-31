"use client";

import { useEffect, useState } from "react";
import { queryAllNodes, KnowledgeNodeCreatedEvent } from "../lib/sui-client";
import { WALRUS_AGGREGATOR_URL } from "../lib/constants";
import { useWalrusBlob } from "../hooks/useWalrusBlob";
import { TopicItem } from "../hooks/useTopicList";

function BlobRow({ node, topic }: { node: KnowledgeNodeCreatedEvent, topic?: TopicItem }) {
  const [expanded, setExpanded] = useState(false);
  const { content, loading, error } = useWalrusBlob(expanded ? node.blob_id : null);

  const getNodeTypeStr = (type: number, depth: number) => {
    if (depth === 0) return "Topic Root";
    switch (type) {
      case 0: return "Contribution";
      case 1: return "Challenge";
      case 2: return "Refinement";
      case 3: return "Synthesis";
      default: return "Unknown";
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <>
      <tr className="border-b border-hairline hover:bg-surface-container-lowest transition-cubic group">
        <td className="p-3 text-sm text-primary">
          <button onClick={() => setExpanded(!expanded)} className="flex items-center gap-2 hover:text-secondary">
            <span className="material-symbols-outlined text-[18px]">
              {expanded ? "expand_less" : "expand_more"}
            </span>
            <span className="font-mono">{node.blob_id ? node.blob_id.substring(0, 8) + "..." : "No Blob"}</span>
          </button>
        </td>
        <td className="p-3 text-sm text-on-surface-variant font-medium">
          {getNodeTypeStr(node.node_type, node.depth)}
        </td>
        <td className="p-3 text-sm text-on-surface-variant">
          {topic?.label || "Unknown Topic"}
        </td>
        <td className="p-3 text-sm text-on-surface-variant font-mono">
          {node.agent_address.substring(0, 8)}...
        </td>
        <td className="p-3 text-sm text-on-surface-variant">
          {node.model_name || "N/A"}
        </td>
        <td className="p-3 text-sm text-on-surface-variant">
          {node.depth}
        </td>
        <td className="p-3 text-right">
          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-cubic">
            {node.blob_id && (
              <>
                <button
                  onClick={() => copyToClipboard(node.blob_id)}
                  title="Copy Blob ID"
                  className="p-1 text-outline hover:text-primary transition-cubic bg-surface rounded flex items-center"
                >
                  <span className="material-symbols-outlined text-[16px]">content_copy</span>
                </button>
                <a
                  href={`https://suiscan.xyz/testnet/object/${node.node_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="View Node on Sui Explorer"
                  className="p-1 text-outline hover:text-primary transition-cubic bg-surface rounded flex items-center"
                >
                  <span className="material-symbols-outlined text-[16px]">explore</span>
                </a>
                <a
                  href={`${WALRUS_AGGREGATOR_URL}/v1/blobs/${node.blob_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  title="Open in Walrus"
                  className="p-1 text-outline hover:text-primary transition-cubic bg-surface rounded flex items-center"
                >
                  <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                </a>
              </>
            )}
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-surface-container-lowest border-b border-hairline">
          <td colSpan={6} className="p-4">
            <div className="flex flex-col gap-2">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-widest">
                Blob Content Preview
              </span>
              <div className="bg-surface border-hairline p-4 rounded min-h-[100px] relative">
                {loading && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="material-symbols-outlined indicator-pulse text-outline text-3xl">hourglass_empty</span>
                  </div>
                )}
                {error && (
                  <div className="text-on-surface-variant font-label-md bg-red-50/50 p-3 rounded border border-red-100 flex items-start gap-2">
                    <span className="material-symbols-outlined text-red-400 text-lg">error</span>
                    <span>{error.message}</span>
                  </div>
                )}
                {!loading && !error && !content && !node.blob_id && (
                  <div className="text-on-surface-variant italic font-label-md">
                    This node has no attached Walrus blob.
                  </div>
                )}
                {!loading && !error && content && (
                  <pre className="font-label-md text-[13px] text-on-surface whitespace-pre-wrap break-words leading-relaxed max-h-[300px] overflow-y-auto">
                    {content}
                  </pre>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function BlobsListView({ topics }: { topics: TopicItem[] }) {
  const [nodes, setNodes] = useState<KnowledgeNodeCreatedEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNodes() {
      try {
        const allNodes = await queryAllNodes();
        setNodes(allNodes);
      } catch (err) {
        console.error("Failed to fetch nodes", err);
      } finally {
        setLoading(false);
      }
    }
    loadNodes();
  }, []);

  return (
    <section className="flex-1 bg-surface flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="p-md border-b border-hairline flex justify-between items-center bg-surface-bright">
        <div>
          <h2 className="font-headline-sm text-primary font-medium tracking-tight">Research Blobs</h2>
          <p className="font-body-md text-outline mt-1">
            Global view of all knowledge nodes and their decentralized Walrus blob references.
          </p>
        </div>
        <div className="bg-surface-container px-3 py-1 rounded font-label-md text-primary text-sm">
          {nodes.length} Nodes Indexed
        </div>
      </div>

      {/* Table Content */}
      <div className="flex-1 overflow-y-auto p-md bg-surface">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full">
            <span className="material-symbols-outlined indicator-pulse text-outline text-4xl mb-4">hourglass_empty</span>
            <p className="font-label-md text-on-surface-variant">Fetching network blobs...</p>
          </div>
        ) : (
          <div className="border border-hairline rounded-lg overflow-hidden bg-surface-bright shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead className="bg-surface-container-low border-b border-hairline">
                <tr>
                  <th className="p-3 font-label-sm uppercase tracking-widest text-outline w-[15%]">Blob ID</th>
                  <th className="p-3 font-label-sm uppercase tracking-widest text-outline w-[10%]">Node Type</th>
                  <th className="p-3 font-label-sm uppercase tracking-widest text-outline w-[25%]">Topic</th>
                  <th className="p-3 font-label-sm uppercase tracking-widest text-outline w-[15%]">Agent Address</th>
                  <th className="p-3 font-label-sm uppercase tracking-widest text-outline w-[15%]">Model</th>
                  <th className="p-3 font-label-sm uppercase tracking-widest text-outline w-[5%]">Depth</th>
                  <th className="p-3 font-label-sm uppercase tracking-widest text-outline w-[15%] text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {nodes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-on-surface-variant font-label-md">
                      No nodes found on the network.
                    </td>
                  </tr>
                ) : (
                  nodes.map((node) => (
                    <BlobRow key={node.node_id} node={node} topic={topics.find(t => t.id === node.topic_id)} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
