import { StateGraph, START, END, Annotation } from "@langchain/langgraph";
import { queryTopicNodes, contribute } from "../clients/sui-client.js";
import { storeBlob, retrieveBlob } from "../clients/walrus-client.js";
import { generate } from "../clients/ollama-client.js";

const ContributorState = Annotation.Root({
    topicId: Annotation<string>(),
    modelName: Annotation<string>(),
    existingKnowledge: Annotation<string>(),
    parentIds: Annotation<string[]>(),
    artifact: Annotation<string>(),
    blobId: Annotation<string>(),
    txDigest: Annotation<string>()
});

async function loadTopic(state: typeof ContributorState.State) {
    console.log("Loading topic and existing knowledge...");
    const nodes = await queryTopicNodes(state.topicId);
    
    let knowledgeBase = "";
    let parentIds: string[] = [];
    
    if (nodes.length > 0) {
        // Collect previous knowledge
        for (const node of nodes) {
            try {
                // Skip nodes with empty blob_id (like the root node usually)
                if (node.blob_id && node.blob_id !== "") {
                    const content = await retrieveBlob(node.blob_id);
                    knowledgeBase += `\n\n--- Node ${node.node_id} (Type: ${node.node_type}) ---\n${content}`;
                }
            } catch(e) {
                console.error(`Failed to fetch blob for node ${node.node_id}:`, e);
            }
        }
        
        // Find the root node (depth == 0) to attach this contribution to.
        // If not found for some reason, just attach to the first node.
        const rootNode = nodes.find((n: any) => Number(n.depth) === 0) || nodes[0];
        parentIds = [rootNode.node_id];
    } else {
        knowledgeBase = "No prior knowledge found on this topic. You are the first contributor.";
        console.warn("No nodes found for this topic. Is the topicId correct?");
    }
    
    return {
        existingKnowledge: knowledgeBase,
        parentIds
    };
}

async function research(state: typeof ContributorState.State) {
    console.log("Researching topic...");
    const systemPrompt = `You are an AI research contributor. Your task is to contribute a valuable analysis to a shared knowledge graph.
Topic ID: ${state.topicId}

Existing Knowledge Context:
${state.existingKnowledge}

Produce a well-reasoned, concise markdown artifact (1-2 paragraphs) with your original analysis or data points. Do not repeat the existing knowledge verbatim, build upon it.`;
    
    const userPrompt = "Please generate your contribution.";
    const artifact = await generate(state.modelName, systemPrompt, userPrompt);
    
    return { artifact };
}

async function storeBlobNode(state: typeof ContributorState.State) {
    console.log("Storing artifact on Walrus...");
    const blobId = await storeBlob(state.artifact);
    console.log("Blob stored:", blobId);
    return { blobId };
}

async function registerOnChain(state: typeof ContributorState.State) {
    console.log("Registering contribution on Sui...");
    const result = await contribute(state.topicId, state.blobId, state.modelName, state.parentIds);
    const txDigest = result.digest;
    console.log("Registered! TX Digest:", txDigest);
    return { txDigest };
}

const graph = new StateGraph(ContributorState)
    .addNode("loadTopic", loadTopic)
    .addNode("research", research)
    .addNode("storeBlobNode", storeBlobNode)
    .addNode("registerOnChain", registerOnChain)
    .addEdge(START, "loadTopic")
    .addEdge("loadTopic", "research")
    .addEdge("research", "storeBlobNode")
    .addEdge("storeBlobNode", "registerOnChain")
    .addEdge("registerOnChain", END);

const app = graph.compile();

export async function runContributor(topicId: string, modelName: string) {
    console.log(`Starting Contributor Agent with model ${modelName} on topic ${topicId}`);
    const initialState = {
        topicId,
        modelName,
        existingKnowledge: "",
        parentIds: [],
        artifact: "",
        blobId: "",
        txDigest: ""
    };
    
    const finalState = await app.invoke(initialState);
    console.log("Contributor Agent finished successfully.");
    return finalState;
}
