import { createTopic } from './src/clients/sui-client.js';
import { runContributor } from './src/agents/contributor.js';
import { runChallenger } from './src/agents/challenger.js';
import { isOllamaRunning } from './src/clients/ollama-client.js';

async function run() {
    console.log("Checking if Ollama is running...");
    if (!(await isOllamaRunning())) {
        console.log("Ollama is not running. Please start Ollama.");
        return;
    }

    console.log("\nCreating a new topic on Sui...");
    const topicResult = await createTopic("Is SUI a structurally undervalued ecosystem asset?");
    
    const nodeCreatedEvent = topicResult.events?.find(
        (e: any) => e.type.includes("KnowledgeNodeCreated")
    );
    const topicId = (nodeCreatedEvent?.parsedJson as any).topic_id;
    console.log("Created Topic ID:", topicId);
    
    // Wait for RPC indexing
    await new Promise(r => setTimeout(r, 2000));

    console.log("\n--- Running Contributor Agent ---");
    await runContributor(topicId, "llama3.2:3b");
    
    // Wait for RPC indexing before challenger fetches
    await new Promise(r => setTimeout(r, 2000));

    console.log("\n--- Running Challenger Agent ---");
    await runChallenger(topicId, "llama3.2:3b");

    console.log("\nTest complete.");
}

run().catch(console.error);
