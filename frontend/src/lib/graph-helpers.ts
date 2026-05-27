import { KnowledgeNodeCreatedEvent } from './sui-client';
import * as d3 from 'd3';

export interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  nodeType: number; // 0=Contribution, 1=Challenge, 2=Refinement, 3=Synthesis
  blobId: string;
  agentAddress: string;
  modelName: string;
  depth: number;
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

export function transformEventsToGraph(events: KnowledgeNodeCreatedEvent[]): GraphData {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const nodeMap = new Set<string>();

  // Add the virtual topic root node if not present in the events (since it's a TopicRoot object, not a KnowledgeNode)
  // Wait, the Move contract emits a KnowledgeNodeCreated for the root node as well (with empty blob and parent_ids)
  
  for (const event of events) {
    if (!nodeMap.has(event.node_id)) {
      nodes.push({
        id: event.node_id,
        nodeType: event.node_type,
        blobId: event.blob_id,
        agentAddress: event.agent_address,
        modelName: event.model_name,
        depth: event.depth,
      });
      nodeMap.add(event.node_id);
    }
    
    // Create links based on node_type
    let relationship = 0; // PARENT_OF
    if (event.node_type === 1) relationship = 1; // CHALLENGES
    if (event.node_type === 2) relationship = 2; // REFINES
    if (event.node_type === 3) relationship = 3; // SYNTHESIZES

    for (const parentId of event.parent_ids) {
      links.push({
        source: parentId,
        target: event.node_id, // edges point from parent to child or disputed to challenger? Let's say parent -> child.
        relationship
      });
    }
  }

  return { nodes, links };
}
