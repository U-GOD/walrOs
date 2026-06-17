import { useState, useEffect, useRef } from 'react';
import { fetchBlob } from '../lib/walrus-client';

export function useWalrusBlob(blobId: string | null) {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Simple in-memory cache to avoid redundant fetching
  const cache = useRef<Record<string, string>>({});

  useEffect(() => {
    let mounted = true;
    if (!blobId) {
      setContent(null);
      setError(null);
      return;
    }

    if (cache.current[blobId]) {
      setContent(cache.current[blobId]);
      setError(null);
      return;
    }

    async function loadBlob() {
      try {
        setLoading(true);
        setError(null);
        console.log(`[useWalrusBlob] Fetching blob: ${blobId}`);
        const data = await fetchBlob(blobId!);
        if (mounted) {
          console.log(`[useWalrusBlob] Success, got ${data.length} chars`);
          cache.current[blobId!] = data;
          setContent(data);
          setLoading(false);
        }
      } catch (err: any) {
        if (mounted) {
          console.warn(`[useWalrusBlob] Error fetching blob ${blobId}:`, err.message);
          setError(err);
          setContent(null);
          setLoading(false);
        }
      }
    }
    loadBlob();
    return () => { mounted = false; };
  }, [blobId]);

  return { content, loading, error };
}
