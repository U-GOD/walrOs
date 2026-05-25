module cortex_protocol::cortex_protocol;

use std::string::String;
use sui::clock::Clock;
use sui::event;
use sui::object::{Self, ID, UID};
use sui::transfer;
use sui::tx_context::{Self, TxContext};

// Node Types
const CONTRIBUTION: u8 = 0;
const CHALLENGE: u8 = 1;
const REFINEMENT: u8 = 2;
const SYNTHESIS: u8 = 3;

// Edge Relationships
const PARENT_OF: u8 = 0;
const CHALLENGES: u8 = 1;
const REFINES: u8 = 2;
const SYNTHESIZES: u8 = 3;

// --- Core Objects ---

/// A single piece of knowledge (contribution, challenge, or synthesis).
public struct KnowledgeNode has key, store {
    id: UID,
    topic_id: ID,
    blob_id: String,
    node_type: u8,
    depth: u64,
    agent_address: address,
    model_name: String,
    created_at: u64,
    fitness_score: u64,
    citation_count: u64,
    is_sealed: bool,
    lineage_parents: vector<ID>,
}

/// The entry point for a research session.
public struct TopicRoot has key, store {
    id: UID,
    topic_text: String,
    creator: address,
    created_at: u64,
    total_nodes: u64,
}

/// A semantic relationship between two KnowledgeNodes.
public struct LineageEdge has key, store {
    id: UID,
    from_node_id: ID,
    to_node_id: ID,
    relationship: u8,
}

/// A capability granting the holder permission to update fitness scores.
public struct FitnessOracleCap has key, store {
    id: UID,
}
