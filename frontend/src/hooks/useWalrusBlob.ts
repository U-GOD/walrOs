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
      return;
    }

    if (cache.current[blobId]) {
      setContent(cache.current[blobId]);
      return;
    }

    async function loadBlob() {
      try {
        setLoading(true);
        const data = await fetchBlob(blobId!);
        if (mounted) {
          cache.current[blobId!] = data;
          setContent(data);
          setLoading(false);
        }
      } catch (err: any) {
        if (mounted) {
          setError(err);
          setLoading(false);
        }
      }
    }
    loadBlob();
    return () => { mounted = false; };
  }, [blobId]);

  return { content, loading, error };
}
