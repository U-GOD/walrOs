import { createTopic } from './src/clients/sui-client.js';
import { runContributor } from './src/agents/contributor.js';
import { isOllamaRunning } from './src/clients/ollama-client.js';

async function run() {
    console.log("Checking if Ollama is running...");
    const isRunning = await isOllamaRunning();
    if (!isRunning) {
        console.log("Ollama is not running. Please start Ollama before running this test.");
        return;
    }

    console.log("\nCreating a new topic on Sui...");
    const topicResult = await createTopic("Is SUI a structurally undervalued ecosystem asset?");
    
    // Find the KnowledgeNodeCreated event to get the topic_id
    const nodeCreatedEvent = topicResult.events?.find(
        (e: any) => e.type.includes("KnowledgeNodeCreated")
    );
    
    if (!nodeCreatedEvent) {
        console.error("Failed to find KnowledgeNodeCreated event in transaction", topicResult.digest);
        return;
    }

    const topicId = (nodeCreatedEvent.parsedJson as any).topic_id;
    console.log("Created Topic ID:", topicId);
    
    // Give RPC a second to index the new objects
    await new Promise(r => setTimeout(r, 2000));

    console.log("\nRunning Contributor Agent...");
    await runContributor(topicId, "llama3.2:3b");
    
    console.log("\nTest complete.");
}

run().catch(console.error);
