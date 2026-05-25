import { createTopic } from './src/clients/sui-client.js';

async function run() {
    console.log("Calling createTopic...");
    try {
        const res = await createTopic("Agent test topic");
        console.log("Success! Tx Digest:", res.digest);
    } catch (e) {
        console.error("Failed:", e);
    }
}
run();
