"use client";

import { PACKAGE_ID, SUI_RPC_URL, WALRUS_AGGREGATOR_URL } from "../lib/constants";
import { useState } from "react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [pollingInterval, setPollingInterval] = useState(5);

  if (!isOpen) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm animate-fade-in">
      <div className="bg-surface border border-hairline shadow-2xl rounded-xl w-full max-w-[480px] overflow-hidden">
        {/* Header */}
        <div className="p-md border-hairline-b flex items-center justify-between bg-surface-bright">
          <div className="flex items-center gap-sm">
            <span className="material-symbols-outlined text-primary">settings</span>
            <h2 className="font-headline-sm text-headline-sm text-primary font-headline-md">
              Settings
            </h2>
          </div>
          <button
            className="p-xs rounded-full hover:bg-surface-container transition-cubic"
            onClick={onClose}
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-md flex flex-col gap-xl max-h-[80vh] overflow-y-auto">
          
          {/* Network Configuration */}
          <section>
            <h3 className="font-label-sm text-label-sm uppercase tracking-widest text-outline mb-md font-label-md">
              Network Configuration
            </h3>
            <div className="flex flex-col gap-sm">
              <div className="flex flex-col gap-[2px]">
                <span className="font-label-sm text-label-sm text-on-surface-variant font-label-md">Sui RPC Node</span>
                <div className="flex items-center justify-between bg-surface-container-lowest border-hairline p-2 rounded">
                  <span className="font-mono text-[12px] text-primary truncate mr-2">{SUI_RPC_URL}</span>
                  <button className="text-outline hover:text-primary transition-cubic" onClick={() => copyToClipboard(SUI_RPC_URL)}>
                    <span className="material-symbols-outlined text-[16px]">content_copy</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-[2px]">
                <span className="font-label-sm text-label-sm text-on-surface-variant font-label-md">Walrus Aggregator</span>
                <div className="flex items-center justify-between bg-surface-container-lowest border-hairline p-2 rounded">
                  <span className="font-mono text-[12px] text-primary truncate mr-2">{WALRUS_AGGREGATOR_URL}</span>
                  <button className="text-outline hover:text-primary transition-cubic" onClick={() => copyToClipboard(WALRUS_AGGREGATOR_URL)}>
                    <span className="material-symbols-outlined text-[16px]">content_copy</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-[2px]">
                <span className="font-label-sm text-label-sm text-on-surface-variant font-label-md">Cortex Package ID</span>
                <div className="flex items-center justify-between bg-surface-container-lowest border-hairline p-2 rounded">
                  <span className="font-mono text-[12px] text-primary truncate mr-2">{PACKAGE_ID}</span>
                  <button className="text-outline hover:text-primary transition-cubic" onClick={() => copyToClipboard(PACKAGE_ID)}>
                    <span className="material-symbols-outlined text-[16px]">content_copy</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Sync Preferences */}
          <section>
            <h3 className="font-label-sm text-label-sm uppercase tracking-widest text-outline mb-md font-label-md">
              Sync Preferences
            </h3>
            <div className="flex flex-col gap-xs">
              <span className="font-label-sm text-label-sm text-on-surface-variant font-label-md">
                Data Polling Interval (Seconds)
              </span>
              <div className="flex items-center gap-sm">
                {[3, 5, 10, 15].map((val) => (
                  <button
                    key={val}
                    onClick={() => setPollingInterval(val)}
                    className={`
                      flex-1 py-2 font-label-md text-label-md rounded border transition-cubic
                      ${pollingInterval === val ? 'bg-primary text-on-primary border-primary' : 'bg-transparent border-hairline text-primary hover:bg-surface-container-low'}
                    `}
                  >
                    {val}s
                  </button>
                ))}
              </div>
              <p className="font-body-md text-[11px] text-outline mt-1 leading-snug">
                Determines how often the UI fetches new events from the Sui network. Note: Very low intervals might rate-limit public RPCs.
              </p>
            </div>
          </section>

          {/* About */}
          <section>
            <h3 className="font-label-sm text-label-sm uppercase tracking-widest text-outline mb-sm font-label-md">
              About WalrOS
            </h3>
            <div className="bg-surface-container-lowest border-hairline p-md rounded flex flex-col gap-sm">
              <div className="flex justify-between items-center">
                <span className="font-label-md text-label-md text-primary">Version</span>
                <span className="font-mono text-[12px] text-outline">v0.1.0-alpha</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-label-md text-label-md text-primary">License</span>
                <span className="font-mono text-[12px] text-outline">MIT</span>
              </div>
            </div>
          </section>

        </div>

        {/* Footer */}
        <div className="p-md border-t border-hairline bg-surface-bright flex justify-end">
          <button
            onClick={onClose}
            className="bg-primary text-on-primary font-label-md text-label-md uppercase tracking-widest px-6 py-2 hover:bg-[#222222] transition-cubic"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
