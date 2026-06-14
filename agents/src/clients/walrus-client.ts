const WALRUS_PUBLISHER = "https://publisher.walrus-testnet.walrus.space";
const WALRUS_AGGREGATOR = "https://aggregator.walrus-testnet.walrus.space";

/**
 * Stores a JSON string blob on Walrus and returns the Blob ID
 */
export async function storeBlob(content: string, epochs: number = 5): Promise<string> {
    const response = await fetch(`${WALRUS_PUBLISHER}/v1/blobs?epochs=${epochs}`, {
        method: 'PUT',
        body: content,
    });
    
    if (!response.ok) {
        throw new Error(`Walrus store failed: ${response.statusText}`);
    }
    
    const data = await response.json() as any;
    
    // Walrus returns either alreadyCertified or newlyCreated
    if (data.alreadyCertified) {
        return data.alreadyCertified.blobId;
    } else if (data.newlyCreated) {
        return data.newlyCreated.blobObject.blobId;
    }
    throw new Error("Unexpected Walrus response format");
}

/**
 * Retrieves a blob from Walrus given a Blob ID
 */
export async function retrieveBlob(blobId: string): Promise<string> {
    const response = await fetch(`${WALRUS_AGGREGATOR}/v1/blobs/${blobId}`);
    if (!response.ok) {
        throw new Error(`Walrus retrieve failed: ${response.statusText}`);
    }
    return response.text();
}
