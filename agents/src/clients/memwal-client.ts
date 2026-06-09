import { MemWal } from '@mysten-incubation/memwal';

let memwalClient: MemWal | null = null;

export function getMemWalClient(): MemWal {
    if (!memwalClient) {
        const privateKey = process.env.MEMWAL_PRIVATE_KEY || process.env.MEMWAL_DELEGATE_KEY;
        const accountId = process.env.MEMWAL_ACCOUNT_ID;

        if (!privateKey) {
            throw new Error("Missing MEMWAL_PRIVATE_KEY or MEMWAL_DELEGATE_KEY in .env");
        }
        
        if (!accountId) {
            throw new Error("Missing MEMWAL_ACCOUNT_ID in .env");
        }

        memwalClient = MemWal.create({
            key: privateKey,
            accountId: accountId,
        });
    }
    return memwalClient;
}

/**
 * Remember an artifact using MemWal. Wait for the background job to complete.
 * @param content The text content to remember
 * @param namespace Optional namespace to isolate memories
 * @returns The resulting memory with blob_id
 */
export async function rememberArtifact(content: string, namespace?: string) {
    const client = getMemWalClient();
    console.log(`[MemWal] Remembering artifact (namespace: ${namespace || 'default'})...`);
    // wait for background embedding + Walrus upload to complete
    const result = await client.rememberAndWait(content, namespace);
    return result;
}

/**
 * Recall knowledge matching a query using MemWal.
 * @param query Search query text
 * @param limit Max results to return
 * @param namespace Optional namespace to restrict search
 * @returns Array of decrypted memory results
 */
export async function recallKnowledge(query: string, limit: number = 5, namespace?: string) {
    const client = getMemWalClient();
    console.log(`[MemWal] Recalling knowledge for query: "${query}"...`);
    const result = await client.recall(query, limit, namespace);
    return result.results;
}
