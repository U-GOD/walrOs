import { storeBlob, retrieveBlob } from './src/clients/walrus-client.js';

async function run() {
    console.log("Storing blob to Walrus HTTP Publisher...");
    const blobId = await storeBlob("Knowledge node test payload v2");
    console.log("Blob ID:", blobId);

    console.log("Retrieving blob from Walrus HTTP Aggregator (waiting 2s for cert)...");
    await new Promise(r => setTimeout(r, 2000));
    const text = await retrieveBlob(blobId);
    console.log("Recovered text:", text);
}
run().catch(console.error);
