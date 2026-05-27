import { useState, useEffect } from 'react';
import { queryAllTopics, TopicCreatedEvent, queryTopicEvents } from '../lib/sui-client';

export interface TopicItem {
  id: string;
  label: string;
  address: string;
  nodeCount: number;
}

export function useTopicList() {
  const [topics, setTopics] = useState<TopicItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadTopics() {
      try {
        setLoading(true);
        const allTopics = await queryAllTopics();
        
        // Since queryAllTopics only gives us TopicCreated, we don't have exact nodeCount unless we query the TopicRoot object
        // Or we can just mock nodeCount for now, or fetch all events. Let's mock it for the sidebar until 2.6.6.
        const mappedTopics = allTopics.map(t => ({
          id: t.topic_id,
          label: t.topic_text,
          address: t.creator,
          nodeCount: 0 // We could enhance this later
        }));

        // Let's populate the node count for each topic by querying its nodes
        const topicsWithCounts = await Promise.all(mappedTopics.map(async (t) => {
          const events = await queryTopicEvents(t.id);
          return { ...t, nodeCount: events.length };
        }));

        if (mounted) {
          setTopics(topicsWithCounts);
          setLoading(false);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err);
          setLoading(false);
        }
      }
    }
    loadTopics();
    return () => { mounted = false; };
  }, []);

  return { topics, loading, error };
}
