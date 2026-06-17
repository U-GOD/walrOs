import { useState, useEffect } from "react";
import { startResearch, getResearchStatus, ResearchStatus } from "@/lib/api-client";

interface ResearchControlPanelProps {
  topicId: string;
}

export default function ResearchControlPanel({ topicId }: ResearchControlPanelProps) {
  const [status, setStatus] = useState<ResearchStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchStatus = async () => {
      try {
        const res = await getResearchStatus(topicId);
        setStatus(res.status);
        if (res.error) setError(res.error);
      } catch (err) {
        console.error("Failed to fetch research status", err);
      }
    };

    fetchStatus();

    // Poll if it's currently running
    if (status && !["idle", "completed", "failed"].includes(status)) {
      intervalId = setInterval(fetchStatus, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [topicId, status]);

  const handleStart = async () => {
    setLoading(true);
    setError(null);
    try {
      await startResearch(topicId);
      setStatus("contributing"); // optimistically update
    } catch (err: any) {
      setError(err.message || "Failed to start research");
    } finally {
      setLoading(false);
    }
  };

  const isRunning = ["contributing", "challenging", "synthesizing"].includes(status);
  
  return (
    <div className="flex flex-col gap-3 mt-4 border border-outline-variant p-3 bg-surface">
      <div className="flex justify-between items-center">
        <h3 className="font-label-md text-xs tracking-widest uppercase text-on-surface-variant">
          Agent Swarm
        </h3>
        {status === "completed" && (
          <span className="font-label-md text-[10px] uppercase bg-[#00FF66]/20 text-[#00AA44] px-2 py-0.5 rounded-sm">
            Completed
          </span>
        )}
        {status === "failed" && (
          <span className="font-label-md text-[10px] uppercase bg-error/20 text-error px-2 py-0.5 rounded-sm">
            Failed
          </span>
        )}
      </div>

      <button
        onClick={handleStart}
        disabled={loading || isRunning}
        className="w-full bg-surface-container-high text-primary border border-outline-variant font-label-md uppercase tracking-wider py-2 text-xs hover:bg-surface-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2"
      >
        {isRunning ? (
          <>
            <span className="material-symbols-outlined animate-spin text-[16px]">autorenew</span>
            Research in Progress...
          </>
        ) : (
          <>
            <span className="material-symbols-outlined text-[16px]">play_arrow</span>
            Start Research
          </>
        )}
      </button>

      {/* Status Indicators */}
      {(isRunning || status === "completed" || status === "failed") && (
        <div className="flex flex-col gap-2 mt-2">
          <StatusRow 
            label="Contributor Agent" 
            isActive={status === "contributing"} 
            isDone={["challenging", "synthesizing", "completed"].includes(status)} 
          />
          <StatusRow 
            label="Challenger Agent" 
            isActive={status === "challenging"} 
            isDone={["synthesizing", "completed"].includes(status)} 
          />
          <StatusRow 
            label="Synthesizer Agent" 
            isActive={status === "synthesizing"} 
            isDone={status === "completed"} 
          />
        </div>
      )}

      {error && (
        <div className="text-error text-[10px] font-mono break-words mt-1 border-l-2 border-error pl-2">
          {error}
        </div>
      )}
    </div>
  );
}

function StatusRow({ label, isActive, isDone }: { label: string; isActive: boolean; isDone: boolean }) {
  return (
    <div className={`flex justify-between items-center text-xs font-mono p-1.5 ${isActive ? 'bg-primary/5 text-primary border border-primary/20' : 'text-on-surface-variant'}`}>
      <span>{label}</span>
      {isActive && <span className="material-symbols-outlined animate-spin text-[14px]">progress_activity</span>}
      {isDone && <span className="material-symbols-outlined text-[#00AA44] text-[14px]">check</span>}
      {!isActive && !isDone && <span className="material-symbols-outlined text-outline text-[14px]">horizontal_rule</span>}
    </div>
  );
}
