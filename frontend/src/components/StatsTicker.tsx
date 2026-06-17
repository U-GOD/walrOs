"use client";

import { useEffect, useState } from "react";
import { useTopicList } from "@/hooks/useTopicList";
import { suiClient } from "@/lib/sui-client";

export default function StatsTicker() {
  const { topics, loading } = useTopicList();
  const [epoch, setEpoch] = useState<string>("...");

  useEffect(() => {
    async function fetchEpoch() {
      try {
        const state = await suiClient.getLatestSuiSystemState();
        setEpoch(state.epoch);
      } catch (e) {
        console.error("Failed to fetch Sui epoch", e);
      }
    }
    fetchEpoch();
  }, []);

  const topicCount = loading ? "..." : topics.length.toString();
  const blobCount = loading ? "..." : topics.reduce((acc, t) => acc + t.nodeCount, 0).toString();
  const agentCount = "4"; // Contributor, Challenger, Synthesizer, Oracle

  const StatItem = ({ label, value }: { label: string; value: string }) => (
    <span className="mr-12 shrink-0">
      {label}: <span className="text-[#00FF66] font-bold">{value}</span>
    </span>
  );

  return (
    <div className="ticker-wrap bg-surface py-3 my-4 border-y border-outline-variant overflow-hidden">
      <div className="ticker font-label-md text-sm text-on-surface uppercase tracking-widest flex items-center whitespace-nowrap animate-marquee">
        <StatItem label="ACTIVE TOPICS" value={topicCount} />
        <StatItem label="TOTAL BLOBS" value={blobCount} />
        <StatItem label="AGENT WALLETS" value={agentCount} />
        <StatItem label="NETWORK EPOCH" value={epoch} />

        {/* Duplicate for infinite scroll illusion */}
        <StatItem label="ACTIVE TOPICS" value={topicCount} />
        <StatItem label="TOTAL BLOBS" value={blobCount} />
        <StatItem label="AGENT WALLETS" value={agentCount} />
        <StatItem label="NETWORK EPOCH" value={epoch} />
        
        {/* Triple for very wide screens */}
        <StatItem label="ACTIVE TOPICS" value={topicCount} />
        <StatItem label="TOTAL BLOBS" value={blobCount} />
        <StatItem label="AGENT WALLETS" value={agentCount} />
        <StatItem label="NETWORK EPOCH" value={epoch} />
      </div>
    </div>
  );
}
