import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { createTopic } from './clients/sui-client.js';
import { runContributor } from './agents/contributor.js';
import { runChallenger } from './agents/challenger.js';
import { runSynthesizer } from './agents/synthesizer.js';

const app = express();
app.use(cors());
app.use(express.json());

const researchStatus: Record<string, {
    status: 'idle' | 'contributing' | 'challenging' | 'synthesizing' | 'completed' | 'failed';
    error?: string;
}> = {};

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.post('/api/topics', async (req, res) => {
    const { topic } = req.body;
    if (!topic) {
        return res.status(400).json({ error: 'Topic text is required' });
    }
    
    try {
        console.log(`[API] Creating topic: "${topic}"...`);
        const result = await createTopic(topic);
        const event = result.events?.find((e: any) => e.type.includes("TopicCreated"));
        
        if (!event) {
            throw new Error("TopicCreated event not found in transaction result");
        }
        
        const topicId = (event.parsedJson as any).topic_id;
        console.log(`[API] Topic created successfully: ${topicId}`);
        res.json({ topicId });
    } catch (error: any) {
        console.error(`[API] Failed to create topic:`, error);
        res.status(500).json({ error: error.message || 'Failed to create topic' });
    }
});

app.post('/api/topics/:topicId/research', async (req, res) => {
    const { topicId } = req.params;
    const { model = 'llama3.2:3b' } = req.body;
    
    if (researchStatus[topicId] && !['idle', 'completed', 'failed'].includes(researchStatus[topicId].status)) {
        return res.status(400).json({ error: 'Research is already running for this topic' });
    }
    
    researchStatus[topicId] = { status: 'contributing' };
    
    (async () => {
        try {
            console.log(`[API] Starting research for topic: ${topicId}`);
            
            researchStatus[topicId] = { status: 'contributing' };
            await runContributor(topicId, model);
            
            researchStatus[topicId] = { status: 'challenging' };
            await runChallenger(topicId, model);
            
            researchStatus[topicId] = { status: 'synthesizing' };
            await runSynthesizer(topicId, model);
            
            researchStatus[topicId] = { status: 'completed' };
            console.log(`[API] Research completed for topic: ${topicId}`);
        } catch (error: any) {
            console.error(`[API] Research failed for topic: ${topicId}`, error);
            researchStatus[topicId] = { status: 'failed', error: error.message || 'Unknown error' };
        }
    })();
    
    res.json({ status: 'started' });
});

app.get('/api/topics/:topicId/status', (req, res) => {
    const { topicId } = req.params;
    const status = researchStatus[topicId] || { status: 'idle' };
    res.json(status);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`WalrOS Agent API server running on port ${PORT}`);
});
