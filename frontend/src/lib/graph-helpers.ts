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

export function transformEventsToGraph(events: KnowledgeNodeCreatedEvent[], topicText?: string): GraphData {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const nodeMap = new Set<string>();

  for (const event of events) {
    if (!nodeMap.has(event.node_id)) {
      nodes.push({
        id: event.node_id,
        nodeType: event.node_type,
        blobId: event.blob_id,
        agentAddress: event.agent_address,
        modelName: event.model_name,
        depth: event.depth,
        label: event.depth === 0 ? topicText : undefined,
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
