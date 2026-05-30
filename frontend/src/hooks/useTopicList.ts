import { useState, useEffect } from 'react';
import { queryAllTopics, queryAllNodes, TopicCreatedEvent } from '../lib/sui-client';

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
        // Fetch topics and all nodes in parallel (both are cached)
        const [allTopics, allNodes] = await Promise.all([
          queryAllTopics(),
          queryAllNodes(),
        ]);

        // Count nodes per topic from the already-fetched allNodes
        const nodeCountByTopic = new Map<string, number>();
        for (const node of allNodes) {
          nodeCountByTopic.set(node.topic_id, (nodeCountByTopic.get(node.topic_id) ?? 0) + 1);
        }

        const topicsWithCounts = allTopics.map(t => ({
          id: t.topic_id,
          label: t.topic_text,
          address: t.creator,
          nodeCount: nodeCountByTopic.get(t.topic_id) ?? 0,
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
