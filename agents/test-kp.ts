import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

function getKeypair(): Ed25519Keypair {
    const keystorePath = path.join(os.homedir(), '.sui', 'sui_config', 'sui.keystore');
    const keystore = JSON.parse(fs.readFileSync(keystorePath, 'utf8'));
    const raw = new Uint8Array(Buffer.from(keystore[0], 'base64'));
    // First byte is the signature scheme flag (0 for Ed25519), next 32 bytes are the secret key
    if (raw[0] !== 0 || raw.length !== 33) {
        throw new Error("Only Ed25519 keypairs are supported in this demo.");
    }
    return Ed25519Keypair.fromSecretKey(raw.slice(1));
}

const kp = getKeypair();
console.log("Address:", kp.toSuiAddress());
