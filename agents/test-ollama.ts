import { isOllamaRunning, listModels, generate } from './src/clients/ollama-client.js';

async function run() {
    console.log("Checking if Ollama is running...");
    const isRunning = await isOllamaRunning();
    console.log("Ollama running:", isRunning);

    if (!isRunning) {
        console.log("Ollama is not running. Please start Ollama before running this test.");
        return;
    }

    console.log("\nListing available models...");
    const models = await listModels();
    console.log("Models:", models);

    const modelToUse = "llama3.2:3b";
    if (!models.includes(modelToUse)) {
        console.log(`\nModel ${modelToUse} is not available. Please pull it with 'ollama pull ${modelToUse}'.`);
        return;
    }

    console.log(`\nTesting generation with ${modelToUse}...`);
    const systemPrompt = "You are a researcher. Answer concisely in one or two sentences.";
    const userPrompt = "What is DeFi?";
    
    console.log(`System Prompt: "${systemPrompt}"`);
    console.log(`User Prompt: "${userPrompt}"`);
    
    const response = await generate(modelToUse, systemPrompt, userPrompt);
    console.log(`\nResponse:\n${response}`);
}

run().catch(console.error);
