import { StateGraph, START, END, Annotation } from "@langchain/langgraph";
import { queryTopicNodes, refine } from "../clients/sui-client.js";
import { storeBlob, retrieveBlob } from "../clients/walrus-client.js";
import { generate } from "../clients/ollama-client.js";
import { recallKnowledge } from "../clients/memwal-client.js";

const SynthesizerState = Annotation.Root({
    topicId: Annotation<string>(),
    modelName: Annotation<string>(),
    contributionId: Annotation<string>(),
    contributionContent: Annotation<string>(),
    challengeId: Annotation<string>(),
    challengeContent: Annotation<string>(),
    artifact: Annotation<string>(),
    blobId: Annotation<string>(),
    txDigest: Annotation<string>()
});

async function loadTopic(state: typeof SynthesizerState.State) {
    console.log("Loading topic to find unresolved challenges...");
    const nodes = await queryTopicNodes(state.topicId);
    
    // Find a challenge node (type 1)
    const challenges = nodes.filter((n: any) => Number(n.node_type) === 1 && n.blob_id);
    
    if (challenges.length === 0) {
        throw new Error("No challenges found to synthesize.");
    }

    // Pick the most recent challenge
    const targetChallenge = challenges[challenges.length - 1];
    
    // The challenge references the disputed contribution in its parent_ids
    const parentIds = targetChallenge.parent_ids || [];
    const disputedContributionId = parentIds.length > 0 ? parentIds[0] : null;

    if (!disputedContributionId) {
        throw new Error(`Challenge node ${targetChallenge.node_id} has no parent pointer.`);
    }

    const targetContribution = nodes.find((n: any) => n.node_id === disputedContributionId);

    if (!targetContribution || !targetContribution.blob_id) {
        throw new Error("Disputed contribution blob could not be resolved.");
    }

    let contributionContent = "";
    let challengeContent = "";

    try {
        contributionContent = await retrieveBlob(targetContribution.blob_id);
        challengeContent = await retrieveBlob(targetChallenge.blob_id);

        let recalledMemories: any[] = [];
        try {
            recalledMemories = await recallKnowledge("context for synthesis " + state.topicId, 3, state.topicId);
        } catch (e) {
            console.error("MemWal recall failed:", e);
        }
        if (recalledMemories && recalledMemories.length > 0) {
            challengeContent += `\n\n--- MemWal Recalled Context ---\n`;
            for (const memory of recalledMemories) {
                challengeContent += `- ${memory.text}\n`;
            }
        }
    } catch (e) {
        console.error("Failed to retrieve blobs or MemWal context for synthesis", e);
        throw e;
    }

    return {
        contributionId: targetContribution.node_id,
        contributionContent,
        challengeId: targetChallenge.node_id,
        challengeContent
    };
}

async function synthesize(state: typeof SynthesizerState.State) {
    console.log("Synthesizing viewpoints...");
    const systemPrompt = `You are an expert synthesizer. Your task is to resolve a debate by producing a balanced, refined synthesis that incorporates the strongest points of both the original contribution and its challenge.

Original Contribution:
${state.contributionContent}

Challenge/Counter-Argument:
${state.challengeContent}

Produce a concise, definitive synthesis in markdown format (1-2 paragraphs). Avoid declaring a winner; instead, combine the insights into a stronger, nuanced conclusion.`;

    const artifact = await generate(state.modelName, systemPrompt, "Generate synthesis.");
    return { artifact };
}

async function storeBlobNode(state: typeof SynthesizerState.State) {
    console.log("Storing synthesis on Walrus...");
    const blobId = await storeBlob(state.artifact);
    try {
        console.log("Also remembering artifact in MemWal...");
        const memwalResult = await rememberArtifact(state.artifact, state.topicId);
        console.log("MemWal remembered with blob_id:", memwalResult.blob_id);
    } catch (e) {
        console.error("MemWal remember failed:", e);
    }
    return { blobId };
}

async function registerOnChain(state: typeof SynthesizerState.State) {
    console.log("Registering synthesis on Sui...");
    const result = await refine(
        state.topicId, 
        state.blobId, 
        state.modelName, 
        [state.contributionId, state.challengeId]
    );
    return { txDigest: result.digest };
}

const graph = new StateGraph(SynthesizerState)
    .addNode("loadTopic", loadTopic)
    .addNode("synthesize", synthesize)
    .addNode("storeBlobNode", storeBlobNode)
    .addNode("registerOnChain", registerOnChain)
    .addEdge(START, "loadTopic")
    .addEdge("loadTopic", "synthesize")
    .addEdge("synthesize", "storeBlobNode")
    .addEdge("storeBlobNode", "registerOnChain")
    .addEdge("registerOnChain", END);

const app = graph.compile();

export async function runSynthesizer(topicId: string, modelName: string) {
    console.log(`Starting Synthesizer Agent [Model: ${modelName}, Topic: ${topicId}]`);
    const initialState = {
        topicId,
        modelName,
        contributionId: "",
        contributionContent: "",
        challengeId: "",
        challengeContent: "",
        artifact: "",
        blobId: "",
        txDigest: ""
    };
    
    const finalState = await app.invoke(initialState);
    console.log(`Synthesizer Agent finished. TX Digest: ${finalState.txDigest}`);
    return finalState;
}
