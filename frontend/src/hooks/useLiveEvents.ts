import { useState, useEffect, useRef } from 'react';
import { queryAllTopics, queryTopicEvents, TopicCreatedEvent, KnowledgeNodeCreatedEvent } from '../lib/sui-client';

export type FeedEvent = {
  id: string;
  timestamp: number;
  type: 'Topic' | 'Node';
  title: string;
  message: string;
};

export function useLiveEvents() {
  const [events, setEvents] = useState<FeedEvent[]>([]);
  const seenIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    let mounted = true;

    async function pollEvents() {
      try {
        const newFeedEvents: FeedEvent[] = [];

        // Poll Topics
        const topics = await queryAllTopics();
        for (const topic of topics) {
          const topicEventId = `topic-${topic.topic_id}`;
          if (!seenIds.current.has(topicEventId)) {
            seenIds.current.add(topicEventId);
            newFeedEvents.push({
              id: topicEventId,
              timestamp: Date.now(),
              type: 'Topic',
              title: `New Topic Created`,
              message: `"${topic.topic_text}" by ${topic.creator.substring(0, 6)}...`
            });
          }

          // Poll Nodes for this topic
          const nodes = await queryTopicEvents(topic.topic_id);
          for (const node of nodes) {
            const nodeEventId = `node-${node.node_id}`;
            if (!seenIds.current.has(nodeEventId)) {
              seenIds.current.add(nodeEventId);

              let actionType = "Contribution";
              if (node.node_type === 1) actionType = "Challenge";
              if (node.node_type === 2) actionType = "Refinement";
              if (node.node_type === 3) actionType = "Synthesis";

              newFeedEvents.push({
                id: nodeEventId,
                timestamp: Date.now(),
                type: 'Node',
                title: `New ${actionType} Node`,
                message: `Agent ${node.agent_address.substring(0, 6)}... added a node at depth ${node.depth}`
              });
            }
          }
        }

        if (mounted && newFeedEvents.length > 0) {
          // Sort by timestamp just in case, though they are practically simultaneous here
          setEvents(prev => [...newFeedEvents, ...prev].slice(0, 50));
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }

    // Initial poll
    pollEvents();

    // Poll every 5 seconds
    const interval = setInterval(pollEvents, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  return events;
}
