import { SuiJsonRpcClient } from '@mysten/sui/jsonRpc';
import { PACKAGE_ID, SUI_RPC_URL } from './constants';

// Use a single shared client instance
export const suiClient = new SuiJsonRpcClient({ url: SUI_RPC_URL, network: 'testnet' });

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

// ---------------------------------------------------------------------------
// Cache + exponential backoff to stay under RPC rate limits.
//
// ALL data is fetched in a SINGLE batch (topics + nodes together) so the
// entire page only ever makes 2 RPC calls per refresh cycle, regardless
// of how many hooks consume the data.
// ---------------------------------------------------------------------------

interface CachedData {
  topics: TopicCreatedEvent[];
  nodes: KnowledgeNodeCreatedEvent[];
  timestamp: number;
}

let cached: CachedData | null = null;
let inflight: Promise<CachedData> | null = null;
let backoffMs = 0;           // current backoff delay (0 = no backoff)
let backoffUntil = 0;        // timestamp until which we should not retry
const CACHE_TTL = 30_000;    // 30 seconds
const MAX_BACKOFF = 120_000; // 2 minutes max backoff

async function fetchAll(): Promise<CachedData> {
  const now = Date.now();

  // Return cache if still fresh
  if (cached && now - cached.timestamp < CACHE_TTL) {
    return cached;
  }

  // If we're in a backoff window, return stale cache or empty
  if (now < backoffUntil) {
    if (cached) return cached;
    return { topics: [], nodes: [], timestamp: 0 };
  }

  // Deduplicate concurrent requests
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      // Fetch both event types in parallel — only 2 RPC calls total
      const [topicResult, nodeResult] = await Promise.all([
        suiClient.queryEvents({
          query: { MoveEventType: `${PACKAGE_ID}::cortex_protocol::TopicCreated` },
          order: 'descending',
        }),
        suiClient.queryEvents({
          query: { MoveEventType: `${PACKAGE_ID}::cortex_protocol::KnowledgeNodeCreated` },
          order: 'descending',
        }),
      ]);

      const result: CachedData = {
        topics: topicResult.data.map(e => e.parsedJson as unknown as TopicCreatedEvent),
        nodes: nodeResult.data.map(e => e.parsedJson as unknown as KnowledgeNodeCreatedEvent),
        timestamp: Date.now(),
      };

      cached = result;
      backoffMs = 0; // reset backoff on success
      return result;
    } catch (err: any) {
      // Exponential backoff on 429 or network errors
      const is429 = err?.message?.includes('429') || err?.message?.includes('rate');
      if (is429) {
        backoffMs = backoffMs === 0 ? 5_000 : Math.min(backoffMs * 2, MAX_BACKOFF);
        backoffUntil = Date.now() + backoffMs;
        console.warn(`Rate limited — backing off for ${backoffMs / 1000}s`);
      }

      // Return stale cache if available
      if (cached) return cached;
      throw err;
    } finally {
      inflight = null;
    }
  })();

  return inflight;
}

// ---------------------------------------------------------------------------
// Public API — same interface as before
// ---------------------------------------------------------------------------

export async function queryAllTopics(): Promise<TopicCreatedEvent[]> {
  const data = await fetchAll();
  return data.topics;
}

export async function queryAllNodes(): Promise<KnowledgeNodeCreatedEvent[]> {
  const data = await fetchAll();
  return data.nodes;
}

export async function queryTopicEvents(topicId: string): Promise<KnowledgeNodeCreatedEvent[]> {
  const nodes = await queryAllNodes();
  return nodes.filter(e => e.topic_id === topicId);
}
