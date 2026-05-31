import { WALRUS_AGGREGATOR_URL } from './constants';

/**
 * Retrieves a blob from Walrus given a Blob ID
 */
export async function fetchBlob(blobId: string): Promise<string> {
  if (!blobId) return '';
  const response = await fetch(`${WALRUS_AGGREGATOR_URL}/v1/blobs/${blobId}`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error("Blob not found (it may have expired on the testnet).");
    }
    throw new Error(`Walrus retrieve failed: ${response.statusText}`);
  }
  return response.text();
}
