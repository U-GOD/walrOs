import { KnowledgeNodeCreatedEvent } from './sui-client';
import * as d3 from 'd3';

export interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  nodeType: number; // 0=Contribution, 1=Challenge, 2=Refinement, 3=Synthesis
  blobId: string;
  agentAddress: string;
  modelName: string;
  depth: number;
  label?: string;
}

export interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string | GraphNode;
  target: string | GraphNode;
  relationship: number; // 0=PARENT_OF, 1=CHALLENGES, 2=REFINES, 3=SYNTHESIZES
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

/**
 * Compute real depth for each node by walking the parent chain,
 * since the contract hardcodes depth=1 for all non-root nodes.
 */
function computeDepths(events: KnowledgeNodeCreatedEvent[]): Record<string, number> {
  const depthMap: Record<string, number> = {};
  const parentMap: Record<string, string[]> = {};

  for (const event of events) {
    parentMap[event.node_id] = event.parent_ids || [];
    if (event.depth === 0) {
      depthMap[event.node_id] = 0;
    }
  }

  function resolve(nodeId: string): number {
    if (depthMap[nodeId] !== undefined) return depthMap[nodeId];
    const parents = parentMap[nodeId] || [];
    if (parents.length === 0) {
      depthMap[nodeId] = 0;
      return 0;
    }
    let maxParentDepth = 0;
    for (const pid of parents) {
      if (parentMap[pid] !== undefined) {
        maxParentDepth = Math.max(maxParentDepth, resolve(pid));
      }
    }
    depthMap[nodeId] = maxParentDepth + 1;
    return depthMap[nodeId];
  }

  for (const event of events) {
    resolve(event.node_id);
  }
  return depthMap;
}

export function transformEventsToGraph(events: KnowledgeNodeCreatedEvent[], topicText?: string): GraphData {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const nodeMap = new Set<string>();
  const depthMap = computeDepths(events);

  for (const event of events) {
    if (!nodeMap.has(event.node_id)) {
      nodes.push({
        id: event.node_id,
        nodeType: event.node_type,
        blobId: event.blob_id,
        agentAddress: event.agent_address,
        modelName: event.model_name,
        depth: depthMap[event.node_id] ?? event.depth,
        label: (depthMap[event.node_id] ?? event.depth) === 0 ? topicText : undefined,
      });
      nodeMap.add(event.node_id);
    }

    let relationship = 0;
    if (event.node_type === 1) relationship = 1;
    if (event.node_type === 2) relationship = 2;
    if (event.node_type === 3) relationship = 3;

    for (const parentId of event.parent_ids) {
      links.push({
        source: parentId,
        target: event.node_id,
        relationship
      });
    }
  }

  return { nodes, links };
}
