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

// --- Events ---

public struct TopicCreated has copy, drop {
    topic_id: ID,
    topic_text: String,
    creator: address,
}

public struct KnowledgeNodeCreated has copy, drop {
    node_id: ID,
    topic_id: ID,
    blob_id: String,
    node_type: u8,
    depth: u64,
    agent_address: address,
    model_name: String,
    parent_ids: vector<ID>,
}

public struct ChallengeCreated has copy, drop {
    challenger_node_id: ID,
    disputed_node_id: ID,
    topic_id: ID,
    agent_address: address,
}

public struct FitnessUpdated has copy, drop {
    node_id: ID,
    old_score: u64,
    new_score: u64,
    citation_count: u64,
}

// --- Initialization ---

/// Module initializer called exactly once upon publishing.
fun init(ctx: &mut TxContext) {
    // Create the fitness oracle capability and transfer it to the publisher
    let oracle_cap = FitnessOracleCap {
        id: object::new(ctx),
    };
    
    transfer::public_transfer(oracle_cap, tx_context::sender(ctx));
}

// --- Core Entry Functions ---

/// Creates a new TopicRoot (shared object) and a root KnowledgeNode (transferred to creator).
public entry fun create_topic(topic_text: String, clock: &Clock, ctx: &mut TxContext) {
    let topic_id_uid = object::new(ctx);
    let topic_id = object::uid_to_inner(&topic_id_uid);
    let creator = tx_context::sender(ctx);
    let current_time = clock.timestamp_ms();

    let root_node_uid = object::new(ctx);
    let root_node_id = object::uid_to_inner(&root_node_uid);

    let topic = TopicRoot {
        id: topic_id_uid,
        topic_text,
        creator,
        created_at: current_time,
        total_nodes: 1, // Includes the root node
    };

    let root_node = KnowledgeNode {
        id: root_node_uid,
        topic_id,
        blob_id: std::string::utf8(b""), // Empty for root node
        node_type: CONTRIBUTION,
        depth: 0,
        agent_address: creator,
        model_name: std::string::utf8(b""), // Empty for root node
        created_at: current_time,
        fitness_score: 100, // Base fitness score
        citation_count: 0,
        is_sealed: false,
        lineage_parents: vector[], // Empty lineage for root node
    };

    // Emit events
    event::emit(TopicCreated {
        topic_id,
        topic_text,
        creator,
    });

    event::emit(KnowledgeNodeCreated {
        node_id: root_node_id,
        topic_id,
        blob_id: root_node.blob_id,
        node_type: root_node.node_type,
        depth: root_node.depth,
        agent_address: root_node.agent_address,
        model_name: root_node.model_name,
        parent_ids: root_node.lineage_parents,
    });

    // Share the topic root
    transfer::share_object(topic);
    // Transfer the root node to the creator
    transfer::public_transfer(root_node, creator);
}

/// Adds a new knowledge contribution to an existing topic.
public entry fun contribute(
    topic: &mut TopicRoot,
    blob_id: String,
    model_name: String,
    parent_ids: vector<ID>,
    clock: &Clock,
    ctx: &mut TxContext
) {
    let sender = tx_context::sender(ctx);
    let current_time = clock.timestamp_ms();

    let node_uid = object::new(ctx);
    let node_id = object::uid_to_inner(&node_uid);

    // Create the KnowledgeNode
    let node = KnowledgeNode {
        id: node_uid,
        topic_id: object::id(topic),
        blob_id,
        node_type: CONTRIBUTION,
        depth: 1, // Simplified: true depth is calculated off-chain by frontend
        agent_address: sender,
        model_name,
        created_at: current_time,
        fitness_score: 100, // Base fitness score
        citation_count: 0,
        is_sealed: false,
        lineage_parents: parent_ids,
    };

    // Create LineageEdges for each parent
    let mut i = 0;
    let len = std::vector::length(&parent_ids);
    while (i < len) {
        let parent_id = *std::vector::borrow(&parent_ids, i);
        let edge = LineageEdge {
            id: object::new(ctx),
            from_node_id: parent_id,
            to_node_id: node_id,
            relationship: PARENT_OF,
        };
        transfer::public_transfer(edge, sender);
        i = i + 1;
    };

    // Update topic
    topic.total_nodes = topic.total_nodes + 1;

    // Emit event
    event::emit(KnowledgeNodeCreated {
        node_id,
        topic_id: node.topic_id,
        blob_id: node.blob_id,
        node_type: node.node_type,
        depth: node.depth,
        agent_address: node.agent_address,
        model_name: node.model_name,
        parent_ids: node.lineage_parents,
    });

    // Transfer node to sender
    transfer::public_transfer(node, sender);
}

/// Adds a challenge node disputing an existing knowledge node.
public entry fun challenge(
    topic: &mut TopicRoot,
    blob_id: String,
    model_name: String,
    disputed_node_id: ID,
    clock: &Clock,
    ctx: &mut TxContext
) {
    let sender = tx_context::sender(ctx);
    let current_time = clock.timestamp_ms();

    let node_uid = object::new(ctx);
    let node_id = object::uid_to_inner(&node_uid);

    // Create the KnowledgeNode
    let node = KnowledgeNode {
        id: node_uid,
        topic_id: object::id(topic),
        blob_id,
        node_type: CHALLENGE,
        depth: 1, 
        agent_address: sender,
        model_name,
        created_at: current_time,
        fitness_score: 100,
        citation_count: 0,
        is_sealed: false,
        lineage_parents: vector[disputed_node_id],
    };

    // Create LineageEdge for the challenge
    let edge = LineageEdge {
        id: object::new(ctx),
        from_node_id: disputed_node_id,
        to_node_id: node_id,
        relationship: CHALLENGES,
    };
    transfer::public_transfer(edge, sender);

    // Update topic
    topic.total_nodes = topic.total_nodes + 1;

    // Emit standard node creation event
    event::emit(KnowledgeNodeCreated {
        node_id,
        topic_id: node.topic_id,
        blob_id: node.blob_id,
        node_type: node.node_type,
        depth: node.depth,
        agent_address: node.agent_address,
        model_name: node.model_name,
        parent_ids: node.lineage_parents,
    });

    // Emit challenge-specific event
    event::emit(ChallengeCreated {
        challenger_node_id: node_id,
        disputed_node_id,
        topic_id: node.topic_id,
        agent_address: sender,
    });

    // Transfer node to sender
    transfer::public_transfer(node, sender);
}

/// Adds a refinement or synthesis node resolving challenges or building on contributions.
public entry fun refine(
    topic: &mut TopicRoot,
    blob_id: String,
    model_name: String,
    parent_ids: vector<ID>,
    clock: &Clock,
    ctx: &mut TxContext
) {
    let sender = tx_context::sender(ctx);
    let current_time = clock.timestamp_ms();

    let node_uid = object::new(ctx);
    let node_id = object::uid_to_inner(&node_uid);

    let len = std::vector::length(&parent_ids);
    // Auto-detect type: 1 parent = REFINEMENT, 2+ parents = SYNTHESIS
    let node_type_val = if (len > 1) { SYNTHESIS } else { REFINEMENT };

    // Create the KnowledgeNode
    let node = KnowledgeNode {
        id: node_uid,
        topic_id: object::id(topic),
        blob_id,
        node_type: node_type_val,
        depth: 1, 
        agent_address: sender,
        model_name,
        created_at: current_time,
        fitness_score: 100,
        citation_count: 0,
        is_sealed: false,
        lineage_parents: parent_ids,
    };

    // Create LineageEdges
    let mut i = 0;
    let rel_type = if (len > 1) { SYNTHESIZES } else { REFINES };
    
    while (i < len) {
        let parent_id = *std::vector::borrow(&parent_ids, i);
        let edge = LineageEdge {
            id: object::new(ctx),
            from_node_id: parent_id,
            to_node_id: node_id,
            relationship: rel_type,
        };
        transfer::public_transfer(edge, sender);
        i = i + 1;
    };

    // Update topic
    topic.total_nodes = topic.total_nodes + 1;

    // Emit event
    event::emit(KnowledgeNodeCreated {
        node_id,
        topic_id: node.topic_id,
        blob_id: node.blob_id,
        node_type: node.node_type,
        depth: node.depth,
        agent_address: node.agent_address,
        model_name: node.model_name,
        parent_ids: node.lineage_parents,
    });

    // Transfer node to sender
    transfer::public_transfer(node, sender);
}
