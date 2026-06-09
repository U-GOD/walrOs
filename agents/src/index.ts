import 'dotenv/config';
import { runContributor } from './agents/contributor.js';
import { runChallenger } from './agents/challenger.js';
import { runSynthesizer } from './agents/synthesizer.js';
import { createTopic } from './clients/sui-client.js';

async function main() {
    const args = process.argv.slice(2);
    
    // Parse arguments
    const parsedArgs: Record<string, string> = {};
    for (let i = 0; i < args.length; i += 2) {
        if (args[i].startsWith('--')) {
            const key = args[i].substring(2);
            parsedArgs[key] = args[i + 1] || "";
        }
    }

    // Command: Create Topic
    if (parsedArgs['create-topic']) {
        const topicText = parsedArgs['create-topic'];
        console.log(`Creating topic: "${topicText}"...`);
        try {
            const result = await createTopic(topicText);
            const event = result.events?.find((e: any) => e.type.includes("TopicCreated"));
            const topicId = (event?.parsedJson as any).topic_id;
            console.log(`\nTopic created successfully!`);
            console.log(`Topic ID: ${topicId}`);
        } catch (e) {
            console.error("Failed to create topic:", e);
        }
        return;
    }

    // Command: Run Agent
    const agentType = parsedArgs['agent'];
    const topicId = parsedArgs['topic'];
    const model = parsedArgs['model'] || "llama3.2:3b"; // Default model

    if (!agentType) {
        console.log(`
WalrOS CLI Usage:

1. Create a Topic:
   npm start -- --create-topic "Your topic text here"

2. Run an Agent:
   npm start -- --agent <contributor|challenger|synthesizer> --topic <topic_id> [--model <model_name>]

Example:
   npm start -- --agent contributor --topic 0x123... --model llama3.2:3b
        `);
        return;
    }

    if (!topicId) {
        console.error("Error: --topic <topic_id> is required to run an agent.");
        return;
    }

    console.log(`\nStarting ${agentType.toUpperCase()} agent on topic ${topicId}...`);
    
    try {
        switch (agentType.toLowerCase()) {
            case 'contributor':
                await runContributor(topicId, model);
                break;
            case 'challenger':
                await runChallenger(topicId, model);
                break;
            case 'synthesizer':
                await runSynthesizer(topicId, model);
                break;
            case 'oracle':
                console.log("Oracle agent is not implemented yet.");
                break;
            default:
                console.error(`Unknown agent type: ${agentType}`);
        }
    } catch (e) {
        console.error(`\nAgent execution failed:`, e);
    }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
    console.log('\nShutting down gracefully...');
    process.exit(0);
});

main();
