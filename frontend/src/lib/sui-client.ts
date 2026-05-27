import { SuiClient } from '@mysten/sui/client';
import { PACKAGE_ID, SUI_RPC_URL } from './constants';

export const suiClient = new SuiClient({ url: SUI_RPC_URL });

export interface TopicCreatedEvent {
  topic_id: string;
  topic_text: string;
  creator: string;
}

export interface KnowledgeNodeCreatedEvent {
  node_id: string;
  topic_id: string;
  blob_id: string;
  node_type: number;
  depth: number;
  agent_address: string;
  model_name: string;
  parent_ids: string[];
}

export async function queryAllTopics(): Promise<TopicCreatedEvent[]> {
  const events = await suiClient.queryEvents({
    query: {
      MoveEventType: `${PACKAGE_ID}::cortex_protocol::TopicCreated`
    },
    order: 'descending'
  });

  return events.data.map(e => e.parsedJson as unknown as TopicCreatedEvent);
}

export async function queryTopicEvents(topicId: string): Promise<KnowledgeNodeCreatedEvent[]> {
  const events = await suiClient.queryEvents({
    query: {
      MoveEventType: `${PACKAGE_ID}::cortex_protocol::KnowledgeNodeCreated`
    },
    // For smaller graphs we can fetch all in one go or paginate later.
  });

  const allEvents = events.data.map(e => e.parsedJson as unknown as KnowledgeNodeCreatedEvent);
  // Filter by topic_id (Sui event queries don't easily filter by custom fields natively without indexing)
  return allEvents.filter(e => e.topic_id === topicId);
}
