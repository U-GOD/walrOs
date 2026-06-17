// api-client.ts
// Thin wrapper around our Express Agent Orchestration API

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function createTopic(text: string): Promise<{ topicId: string }> {
    const res = await fetch(`${API_BASE_URL}/topics`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic: text }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to create topic: ${res.statusText}`);
    }

    return res.json();
}

export async function startResearch(topicId: string, model: string = 'llama3.2:3b'): Promise<{ status: string }> {
    const res = await fetch(`${API_BASE_URL}/topics/${topicId}/research`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model }),
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to start research: ${res.statusText}`);
    }

    return res.json();
}

export type ResearchStatus = 'idle' | 'contributing' | 'challenging' | 'synthesizing' | 'completed' | 'failed';

export async function getResearchStatus(topicId: string): Promise<{ status: ResearchStatus; error?: string }> {
    const res = await fetch(`${API_BASE_URL}/topics/${topicId}/status`);
    
    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Failed to get status: ${res.statusText}`);
    }

    return res.json();
}
