import { useState, useEffect } from 'react';
import { suiClient, KnowledgeNodeCreatedEvent, TopicCreatedEvent } from '../lib/sui-client';
import { PACKAGE_ID } from '../lib/constants';
import { SuiEvent } from '@mysten/sui/client';

export type FeedEvent = {
  id: string;
  timestamp: number;
  type: 'Topic' | 'Node';
  title: string;
  message: string;
};

export function useLiveEvents() {
  const [events, setEvents] = useState<FeedEvent[]>([]);

  useEffect(() => {
    let unsubscribeNode: (() => void) | null = null;
    let unsubscribeTopic: (() => void) | null = null;

    async function subscribe() {
      try {
        // Subscribe to KnowledgeNodeCreated events
        const nodeSubId = await suiClient.subscribeEvent({
          filter: { MoveEventType: `${PACKAGE_ID}::cortex_protocol::KnowledgeNodeCreated` },
          onMessage: (suiEvent: SuiEvent) => {
            const parsed = suiEvent.parsedJson as unknown as KnowledgeNodeCreatedEvent;
            
            let actionType = "Contribution";
            if (parsed.node_type === 1) actionType = "Challenge";
            if (parsed.node_type === 2) actionType = "Refinement";
            if (parsed.node_type === 3) actionType = "Synthesis";

            const newEvent: FeedEvent = {
              id: suiEvent.id.txDigest + suiEvent.id.eventSeq,
              timestamp: Date.now(),
              type: 'Node',
              title: `New ${actionType} Node`,
              message: `Agent ${parsed.agent_address.substring(0,6)}... added a node at depth ${parsed.depth}`
            };
            
            setEvents(prev => [newEvent, ...prev].slice(0, 50)); // Keep last 50
          }
        });
        
        unsubscribeNode = () => {
           // suiClient.unsubscribeEvent might not be universally supported depending on the SDK version,
           // but normally it returns an unsubscribe ID. For now we will just log.
           console.log("Unsubscribing from node events", nodeSubId);
        };

        // Subscribe to TopicCreated events
        const topicSubId = await suiClient.subscribeEvent({
          filter: { MoveEventType: `${PACKAGE_ID}::cortex_protocol::TopicCreated` },
          onMessage: (suiEvent: SuiEvent) => {
            const parsed = suiEvent.parsedJson as unknown as TopicCreatedEvent;
            const newEvent: FeedEvent = {
              id: suiEvent.id.txDigest + suiEvent.id.eventSeq,
              timestamp: Date.now(),
              type: 'Topic',
              title: `New Topic Created`,
              message: `"${parsed.topic_text}" by ${parsed.creator.substring(0,6)}...`
            };
            
            setEvents(prev => [newEvent, ...prev].slice(0, 50));
          }
        });

        unsubscribeTopic = () => {
           console.log("Unsubscribing from topic events", topicSubId);
        };

      } catch (err) {
        console.error("Failed to subscribe to Sui events:", err);
      }
    }

    subscribe();

    return () => {
      if (unsubscribeNode) unsubscribeNode();
      if (unsubscribeTopic) unsubscribeTopic();
    };
  }, []);

  return events;
}
