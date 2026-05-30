"use client";

import { useState, useEffect } from "react";
import { SUI_RPC_URL, WALRUS_AGGREGATOR_URL, PACKAGE_ID } from "../lib/constants";

export default function SystemStatusView() {
  const [suiLatency, setSuiLatency] = useState<number | null>(null);
  const [walrusLatency, setWalrusLatency] = useState<number | null>(null);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  useEffect(() => {
    let mounted = true;

    async function checkHealth() {
      const checkSui = async () => {
        try {
          const start = performance.now();
          // Simple JSON-RPC ping to check connection
          await fetch(SUI_RPC_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "sui_getChainIdentifier", params: [] })
          });
          if (mounted) setSuiLatency(Math.round(performance.now() - start));
        } catch (e) {
          if (mounted) setSuiLatency(-1);
        }
      };

      const checkWalrus = async () => {
        try {
          const start = performance.now();
          // Simple fetch to see if aggregator is reachable
          await fetch(`${WALRUS_AGGREGATOR_URL}/v1/blobs/dummy`, { method: 'HEAD' });
          if (mounted) setWalrusLatency(Math.round(performance.now() - start));
        } catch (e) {
          // A 404 is still a successful network connection, but if it truly fails it throws
          if (mounted) setWalrusLatency(Math.round(performance.now() - start));
        }
      };

      await Promise.all([checkSui(), checkWalrus()]);
      if (mounted) setLastChecked(new Date());
    }

    checkHealth();
    const interval = setInterval(checkHealth, 10000); // Check every 10s

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <section className="flex-1 bg-surface flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="p-md border-b border-hairline flex justify-between items-center bg-surface-bright">
        <div>
          <h2 className="font-headline-sm text-primary font-medium tracking-tight">System Status</h2>
          <p className="font-body-md text-outline mt-1">
            Real-time monitoring of decentralized infrastructure and protocol health.
          </p>
        </div>
        <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-sm">
          <span className="material-symbols-outlined text-[18px]">update</span>
          Last checked: {lastChecked.toLocaleTimeString()}
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="flex-1 overflow-y-auto p-md bg-surface flex flex-col gap-md">
        
        {/* Connection Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          {/* Sui Network */}
          <div className="bg-surface-container-lowest border border-hairline rounded-xl p-xl flex flex-col items-center text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-md ${suiLatency && suiLatency !== -1 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              <span className="material-symbols-outlined text-3xl">
                {suiLatency && suiLatency !== -1 ? 'cloud_done' : 'cloud_off'}
              </span>
            </div>
            <h3 className="font-headline-sm text-primary mb-1">Sui Testnet RPC</h3>
            <p className="font-mono text-sm text-outline mb-4">{SUI_RPC_URL}</p>
            <div className="flex items-center gap-2 font-label-md">
              <span className="text-on-surface-variant uppercase tracking-widest text-[11px]">Latency:</span>
              {suiLatency === null ? (
                <span className="text-outline">Checking...</span>
              ) : suiLatency === -1 ? (
                <span className="text-red-600 font-bold">Offline</span>
              ) : (
                <span className="text-green-600 font-bold">{suiLatency}ms</span>
              )}
            </div>
          </div>

          {/* Walrus Aggregator */}
          <div className="bg-surface-container-lowest border border-hairline rounded-xl p-xl flex flex-col items-center text-center">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-md ${walrusLatency && walrusLatency !== -1 ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
              <span className="material-symbols-outlined text-3xl">
                {walrusLatency && walrusLatency !== -1 ? 'storage' : 'dns'}
              </span>
            </div>
            <h3 className="font-headline-sm text-primary mb-1">Walrus Aggregator</h3>
            <p className="font-mono text-sm text-outline mb-4">{WALRUS_AGGREGATOR_URL}</p>
            <div className="flex items-center gap-2 font-label-md">
              <span className="text-on-surface-variant uppercase tracking-widest text-[11px]">Latency:</span>
              {walrusLatency === null ? (
                <span className="text-outline">Checking...</span>
              ) : walrusLatency === -1 ? (
                <span className="text-red-600 font-bold">Unreachable</span>
              ) : (
                <span className="text-blue-600 font-bold">{walrusLatency}ms</span>
              )}
            </div>
          </div>
        </div>

        {/* Protocol Info */}
        <div className="bg-surface-bright border border-hairline rounded-xl p-md mt-md">
          <h3 className="font-label-md uppercase tracking-widest text-outline mb-md">Protocol Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            <div className="flex flex-col gap-1">
              <span className="font-label-sm text-on-surface-variant uppercase">Cortex Package ID</span>
              <span className="font-mono text-[12px] text-primary truncate" title={PACKAGE_ID}>{PACKAGE_ID}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-label-sm text-on-surface-variant uppercase">Frontend Version</span>
              <span className="font-mono text-[12px] text-primary">v0.1.0-alpha</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-label-sm text-on-surface-variant uppercase">Environment</span>
              <span className="font-mono text-[12px] text-primary">Production (Static Export)</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}
