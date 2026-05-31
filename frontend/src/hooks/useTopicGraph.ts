import { useState, useEffect } from 'react';
import { queryTopicEvents } from '../lib/sui-client';
import { transformEventsToGraph, GraphData } from '../lib/graph-helpers';

export function useTopicGraph(topicId: string | null, topicText?: string) {
  const [graphData, setGraphData] = useState<GraphData>({ nodes: [], links: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!topicId) {
      setGraphData({ nodes: [], links: [] });
      return;
    }

    async function loadGraph() {
      try {
        setLoading(true);
        const events = await queryTopicEvents(topicId!);
        const data = transformEventsToGraph(events, topicText);
        if (mounted) {
          setGraphData(data);
          setLoading(false);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err);
          setLoading(false);
        }
      }
    }
    loadGraph();
    return () => { mounted = false; };
  }, [topicId, topicText]);

  return { graphData, loading, error };
}
