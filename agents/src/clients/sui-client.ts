import { SuiJsonRpcClient as SuiClient } from '@mysten/sui/jsonRpc';
import { Transaction } from '@mysten/sui/transactions';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { bcs } from '@mysten/sui/bcs';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { PACKAGE_ID, SUI_RPC_URL, CLOCK_ID, FITNESS_ORACLE_CAP_ID } from '../config/constants.js';

// Setup Sui Client
export const suiClient = new SuiClient({ url: SUI_RPC_URL, network: 'testnet' });

export function getKeypair(): Ed25519Keypair {
    const keystorePath = path.join(os.homedir(), '.sui', 'sui_config', 'sui.keystore');
    const keystore = JSON.parse(fs.readFileSync(keystorePath, 'utf8'));
    const raw = new Uint8Array(Buffer.from(keystore[0], 'base64'));
    if (raw[0] !== 0 || raw.length !== 33) {
        throw new Error("Only Ed25519 keypairs are supported in this demo.");
    }
    return Ed25519Keypair.fromSecretKey(raw.slice(1));
}

async function signAndExecute(tx: Transaction) {
    const keypair = getKeypair();
    return suiClient.signAndExecuteTransaction({
        signer: keypair,
        transaction: tx,
        options: {
            showEffects: true,
            showEvents: true
        }
    });
}

export async function createTopic(topicText: string) {
    const tx = new Transaction();
    tx.moveCall({
        target: `${PACKAGE_ID}::cortex_protocol::create_topic`,
        arguments: [
            tx.pure.string(topicText),
            tx.object(CLOCK_ID)
        ]
    });
    return signAndExecute(tx);
}

export async function contribute(topicId: string, blobId: string, modelName: string, parentIds: string[]) {
    const tx = new Transaction();
    tx.moveCall({
        target: `${PACKAGE_ID}::cortex_protocol::contribute`,
        arguments: [
            tx.object(topicId),
            tx.pure.string(blobId),
            tx.pure.string(modelName),
            tx.pure(bcs.vector(bcs.Address).serialize(parentIds)),
            tx.object(CLOCK_ID)
        ]
    });
    return signAndExecute(tx);
}

export async function challenge(topicId: string, blobId: string, modelName: string, disputedNodeId: string) {
    const tx = new Transaction();
    tx.moveCall({
        target: `${PACKAGE_ID}::cortex_protocol::challenge`,
        arguments: [
            tx.object(topicId),
            tx.pure.string(blobId),
            tx.pure.string(modelName),
            tx.pure.address(disputedNodeId),
            tx.object(CLOCK_ID)
        ]
    });
    return signAndExecute(tx);
}

export async function refine(topicId: string, blobId: string, modelName: string, parentIds: string[]) {
    const tx = new Transaction();
    tx.moveCall({
        target: `${PACKAGE_ID}::cortex_protocol::refine`,
        arguments: [
            tx.object(topicId),
            tx.pure.string(blobId),
            tx.pure.string(modelName),
            tx.pure(bcs.vector(bcs.Address).serialize(parentIds)),
            tx.object(CLOCK_ID)
        ]
    });
    return signAndExecute(tx);
}

export async function updateFitness(nodeId: string, newScore: number, citationCount: number) {
    const tx = new Transaction();
    tx.moveCall({
        target: `${PACKAGE_ID}::cortex_protocol::update_fitness`,
        arguments: [
            tx.object(FITNESS_ORACLE_CAP_ID),
            tx.object(nodeId),
            tx.pure.u64(newScore),
            tx.pure.u64(citationCount)
        ]
    });
    return signAndExecute(tx);
}

export async function queryTopicNodes(topicId: string) {
    const events = await suiClient.queryEvents({
        query: {
            MoveEventType: `${PACKAGE_ID}::cortex_protocol::KnowledgeNodeCreated`
        }
    });
    
    const parsedEvents = events.data.map(e => e.parsedJson as any);
    return parsedEvents.filter(e => e.topic_id === topicId);
}
