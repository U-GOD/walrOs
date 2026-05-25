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
