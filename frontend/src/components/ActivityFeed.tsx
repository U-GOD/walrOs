"use client";

import { useLiveEvents, FeedEvent } from "../hooks/useLiveEvents";

interface ActivityFeedProps {
  isOpen: boolean;
  onClose: () => void;
  onEventClick?: (event: FeedEvent) => void;
}

export default function ActivityFeed({ isOpen, onClose, onEventClick }: ActivityFeedProps) {
  const events = useLiveEvents();

  return (
    <aside
      className={`
        w-full md:w-96 flex-shrink-0 bg-surface-container-low border-hairline-l
        flex flex-col z-40 absolute inset-y-0 right-0
        transition-cubic shadow-[-4px_0_24px_rgba(0,0,0,0.05)]
        ${isOpen ? "translate-x-0" : "translate-x-full"}
      `}
    >
      {/* Header */}
      <div className="p-md border-hairline-b flex items-center justify-between bg-surface-bright">
        <div className="flex items-center gap-sm">
          <span className="material-symbols-outlined text-primary">notifications</span>
          <h2 className="font-headline-sm text-headline-sm text-primary font-headline-md">
            Activity Feed
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
      <div className="flex-1 overflow-y-auto p-sm flex flex-col gap-2 bg-surface">
        {events.length === 0 ? (
          <div className="p-4 text-center text-on-surface-variant font-label-md text-sm mt-10">
            No recent activity. Waiting for network events...
          </div>
        ) : (
          events.map((event) => (
            <div
              key={event.id}
              className="bg-surface-bright border border-hairline p-3 rounded-md transition-cubic hover:shadow-sm cursor-pointer hover:border-black/30"
              onClick={() => onEventClick && onEventClick(event)}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="font-label-md text-[11px] uppercase tracking-widest text-primary bg-surface-container px-1.5 py-0.5 rounded">
                  {event.type} Event
                </span>
                <span className="font-mono text-[10px] text-outline">
                  {new Date(event.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <h4 className="font-headline-sm text-[14px] text-on-surface font-medium leading-tight mb-1">
                {event.title}
              </h4>
              <p className="font-body-md text-[12px] text-on-surface-variant leading-snug">
                {event.message}
              </p>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
