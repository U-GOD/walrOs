import { StateGraph, START, END, Annotation } from "@langchain/langgraph";
import { queryTopicNodes, challenge } from "../clients/sui-client.js";
import { storeBlob, retrieveBlob } from "../clients/walrus-client.js";
import { generate } from "../clients/ollama-client.js";

const ChallengerState = Annotation.Root({
    topicId: Annotation<string>(),
    modelName: Annotation<string>(),
    targetNodeContent: Annotation<string>(),
    disputedNodeId: Annotation<string>(),
    weakClaimAnalysis: Annotation<string>(),
    artifact: Annotation<string>(),
    blobId: Annotation<string>(),
    txDigest: Annotation<string>()
});

async function loadTopic(state: typeof ChallengerState.State) {
    console.log("Loading topic contributions...");
    const nodes = await queryTopicNodes(state.topicId);
    
    // Filter for contribution nodes (type 0) with a valid blob_id
    const contributions = nodes.filter((n: any) => 
        Number(n.node_type) === 0 && n.blob_id && n.blob_id !== ""
    );

    if (contributions.length === 0) {
        throw new Error("No contributions available to challenge.");
    }

    // Select the most recent contribution
    const targetNode = contributions[contributions.length - 1];
    let content = "";

    try {
        content = await retrieveBlob(targetNode.blob_id);
    } catch (e) {
        console.error(`Failed to retrieve blob for node ${targetNode.node_id}`, e);
        throw e;
    }

    return {
        disputedNodeId: targetNode.node_id,
        targetNodeContent: content
    };
}

async function identifyWeakClaim(state: typeof ChallengerState.State) {
    console.log("Identifying weak claim...");
    const systemPrompt = `You are a critical reviewer. Analyze the following knowledge contribution and identify its weakest claim, logical flaw, or unsupported assumption.
    
Contribution:
${state.targetNodeContent}

Provide a concise analysis focusing only on the flaw.`;

    const analysis = await generate(state.modelName, systemPrompt, "Analyze the contribution.");
    
    return { weakClaimAnalysis: analysis };
}

async function generateChallenge(state: typeof ChallengerState.State) {
    console.log("Generating challenge artifact...");
    const systemPrompt = `You are an expert debater. Based on the following flaw analysis, generate a concise, well-reasoned counter-argument (1-2 paragraphs) in markdown format.

Original Contribution:
${state.targetNodeContent}

Flaw Analysis:
${state.weakClaimAnalysis}

Provide your counter-argument directly.`;

    const artifact = await generate(state.modelName, systemPrompt, "Generate counter-argument.");
    
    return { artifact };
}

async function storeBlobNode(state: typeof ChallengerState.State) {
    console.log("Storing challenge on Walrus...");
    const blobId = await storeBlob(state.artifact);
    return { blobId };
}

async function registerOnChain(state: typeof ChallengerState.State) {
    console.log("Registering challenge on Sui...");
    const result = await challenge(
        state.topicId, 
        state.blobId, 
        state.modelName, 
        state.disputedNodeId
    );
    return { txDigest: result.digest };
}

const graph = new StateGraph(ChallengerState)
    .addNode("loadTopic", loadTopic)
    .addNode("identifyWeakClaim", identifyWeakClaim)
    .addNode("generateChallenge", generateChallenge)
    .addNode("storeBlobNode", storeBlobNode)
    .addNode("registerOnChain", registerOnChain)
    .addEdge(START, "loadTopic")
    .addEdge("loadTopic", "identifyWeakClaim")
    .addEdge("identifyWeakClaim", "generateChallenge")
    .addEdge("generateChallenge", "storeBlobNode")
    .addEdge("storeBlobNode", "registerOnChain")
    .addEdge("registerOnChain", END);

const app = graph.compile();

export async function runChallenger(topicId: string, modelName: string) {
    console.log(`Starting Challenger Agent [Model: ${modelName}, Topic: ${topicId}]`);
    const initialState = {
        topicId,
        modelName,
        targetNodeContent: "",
        disputedNodeId: "",
        weakClaimAnalysis: "",
        artifact: "",
        blobId: "",
        txDigest: ""
    };
    
    const finalState = await app.invoke(initialState);
    console.log(`Challenger Agent finished. TX Digest: ${finalState.txDigest}`);
    return finalState;
}
