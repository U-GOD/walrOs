#[test_only]
module cortex_protocol::cortex_protocol_tests;

use std::string;
use sui::test_scenario;
use sui::clock;
use cortex_protocol::cortex_protocol::{Self, TopicRoot, KnowledgeNode, LineageEdge};

#[test]
fun test_cortex_flow() {
    let creator = @0xA;
    let agent1 = @0xB;
    let agent2 = @0xC;

    let mut scenario = test_scenario::begin(creator);
    let mut clk = clock::create_for_testing(test_scenario::ctx(&mut scenario));

    // ---------------------------------------------------
    // 1. Create Topic (Creator)
    // ---------------------------------------------------
    cortex_protocol::create_topic(
        string::utf8(b"Are AI agents structurally undervalued?"), 
        &clk, 
        test_scenario::ctx(&mut scenario)
    );
    test_scenario::next_tx(&mut scenario, creator);

    // Verify TopicRoot was shared and root node was transferred to creator
    let mut topic = test_scenario::take_shared<TopicRoot>(&scenario);
    let root_node = test_scenario::take_from_sender<KnowledgeNode>(&scenario);
    let root_node_id = sui::object::id(&root_node);

    // ---------------------------------------------------
    // 2. Contribute (Agent 1)
    // ---------------------------------------------------
    test_scenario::next_tx(&mut scenario, agent1);
    
    cortex_protocol::contribute(
        &mut topic,
        string::utf8(b"blob_contrib_123"),
        string::utf8(b"llama3.2:3b"),
        vector[root_node_id],
        &clk,
        test_scenario::ctx(&mut scenario)
    );
    test_scenario::next_tx(&mut scenario, agent1);

    // Verify contribution node and edge
    let contrib_node = test_scenario::take_from_sender<KnowledgeNode>(&scenario);
    let contrib_node_id = sui::object::id(&contrib_node);
    let edge1 = test_scenario::take_from_sender<LineageEdge>(&scenario);

    // ---------------------------------------------------
    // 3. Challenge (Agent 2)
    // ---------------------------------------------------
    test_scenario::next_tx(&mut scenario, agent2);

    cortex_protocol::challenge(
        &mut topic,
        string::utf8(b"blob_challenge_456"),
        string::utf8(b"mistral:7b"),
        contrib_node_id,
        &clk,
        test_scenario::ctx(&mut scenario)
    );
    test_scenario::next_tx(&mut scenario, agent2);

    // Verify challenge node and edge
    let challenge_node = test_scenario::take_from_sender<KnowledgeNode>(&scenario);
    let challenge_node_id = sui::object::id(&challenge_node);
    let edge2 = test_scenario::take_from_sender<LineageEdge>(&scenario);

    // ---------------------------------------------------
    // 4. Synthesize/Refine (Agent 1)
    // ---------------------------------------------------
    test_scenario::next_tx(&mut scenario, agent1);

    cortex_protocol::refine(
        &mut topic,
        string::utf8(b"blob_synthesis_789"),
        string::utf8(b"llama3.2:3b"),
        vector[contrib_node_id, challenge_node_id],
        &clk,
        test_scenario::ctx(&mut scenario)
    );
    test_scenario::next_tx(&mut scenario, agent1);

    // Verify synthesis node and its 2 edges
    let synth_node = test_scenario::take_from_sender<KnowledgeNode>(&scenario);
    // Since we created 2 edges, we take them both to clear the test state cleanly
    let edge3 = test_scenario::take_from_sender<LineageEdge>(&scenario);
    let edge4 = test_scenario::take_from_sender<LineageEdge>(&scenario);

    // ---------------------------------------------------
    // Cleanup
    // ---------------------------------------------------
    test_scenario::return_shared(topic);
    
    // Return objects to their respective owners to satisfy test_scenario checks
    test_scenario::next_tx(&mut scenario, creator);
    test_scenario::return_to_sender(&scenario, root_node);

    test_scenario::next_tx(&mut scenario, agent1);
    test_scenario::return_to_sender(&scenario, contrib_node);
    test_scenario::return_to_sender(&scenario, edge1);
    test_scenario::return_to_sender(&scenario, synth_node);
    test_scenario::return_to_sender(&scenario, edge3);
    test_scenario::return_to_sender(&scenario, edge4);

    test_scenario::next_tx(&mut scenario, agent2);
    test_scenario::return_to_sender(&scenario, challenge_node);
    test_scenario::return_to_sender(&scenario, edge2);

    clock::destroy_for_testing(clk);
    test_scenario::end(scenario);
}
