"use client";

import { useLiveEvents } from "../hooks/useLiveEvents";

export default function ActivityFeed() {
  const events = useLiveEvents();

  if (events.length === 0) return null;

  return (
    <div className="absolute bottom-6 right-6 w-80 flex flex-col gap-2 z-30 pointer-events-none">
      {events.slice(0, 3).map((event) => (
        <div
          key={event.id}
          className="bg-surface/95 backdrop-blur-md border border-hairline p-3 shadow-lg rounded-md animate-fade-in pointer-events-auto transition-cubic hover:-translate-y-1"
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
      ))}
    </div>
  );
}
