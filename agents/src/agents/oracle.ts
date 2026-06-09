import { queryTopicNodes, updateFitness } from "../clients/sui-client.js";

// Keep track of the last processed citation count to avoid redundant transactions
const knownCitationCounts: Record<string, number> = {};

export async function runOracle(topicId: string, intervalMs: number = 30000) {
    console.log(`Starting Oracle Agent for topic ${topicId}...`);
    console.log(`Polling interval: ${intervalMs / 1000} seconds. Press Ctrl+C to stop.`);

    while (true) {
        try {
            await computeAndApplyFitness(topicId);
        } catch (e) {
            console.error("Oracle iteration failed:", e);
        }
        await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
}

async function computeAndApplyFitness(topicId: string) {
    const nodes = await queryTopicNodes(topicId);
    
    if (nodes.length === 0) {
        return;
    }

    // Map of node_id to number of times it's cited as a parent
    const currentCitationCounts: Record<string, number> = {};
    
    for (const node of nodes) {
        currentCitationCounts[node.node_id] = 0; // Initialize
    }

    // Count citations
    for (const node of nodes) {
        if (node.parent_ids && Array.isArray(node.parent_ids)) {
            for (const parentId of node.parent_ids) {
                if (currentCitationCounts[parentId] !== undefined) {
                    currentCitationCounts[parentId]++;
                } else {
                    currentCitationCounts[parentId] = 1;
                }
            }
        }
    }

    const BASE_FITNESS = 100;
    const CITATION_WEIGHT = 20;

    for (const [nodeId, citations] of Object.entries(currentCitationCounts)) {
        if (knownCitationCounts[nodeId] !== citations) {
            console.log(`Node ${nodeId} citations updated to ${citations}. Updating fitness on-chain...`);
            const newScore = BASE_FITNESS + (citations * CITATION_WEIGHT);
            
            try {
                const result = await updateFitness(nodeId, newScore, citations);
                console.log(`Fitness updated for node ${nodeId} (Score: ${newScore}). TX Digest: ${result.digest}`);
                knownCitationCounts[nodeId] = citations;
            } catch (e) {
                console.error(`Failed to update fitness for node ${nodeId}:`, e);
            }
        }
    }
}
