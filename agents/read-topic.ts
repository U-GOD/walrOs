import { queryTopicNodes } from './src/clients/sui-client.js';
import { retrieveBlob } from './src/clients/walrus-client.js';

async function run() {
    const topicId = process.argv[2];
    if (!topicId) {
        console.error("Please provide a topic ID. Usage: npx tsx read-topic.ts <topic_id>");
        return;
    }

    console.log(`Fetching knowledge graph for Topic: ${topicId}\n`);
    const nodes = await queryTopicNodes(topicId);
    
    if (nodes.length === 0) {
        console.log("No knowledge nodes found for this topic.");
        return;
    }

    // Sort nodes by creation order (depth or simply array order since Sui events are mostly chronological)
    for (const node of nodes) {
        let typeName = "UNKNOWN";
        if (node.node_type == 0) typeName = "CONTRIBUTION";
        if (node.node_type == 1) typeName = "CHALLENGE";
        if (node.node_type == 2) typeName = "REFINEMENT";
        if (node.node_type == 3) typeName = "SYNTHESIS";

        console.log(`========================================================`);
        console.log(`Node ID:   ${node.node_id}`);
        console.log(`Type:      ${typeName}`);
        console.log(`Agent:     ${node.agent_address}`);
        console.log(`Model:     ${node.model_name}`);
        console.log(`Blob ID:   ${node.blob_id}`);
        console.log(`Parent(s): ${node.parent_ids?.join(', ') || 'None'}`);
        console.log(`--------------------------------------------------------`);
        
        if (node.blob_id) {
            try {
                const content = await retrieveBlob(node.blob_id);
                console.log(`${content}`);
            } catch (e) {
                console.log(`[Failed to load blob content]`);
            }
        } else {
            console.log(`[No Blob Attached]`);
        }
        console.log(`========================================================\n`);
    }
}

run().catch(console.error);
