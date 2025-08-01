// Raffle smart contract constants
export const ENTRY_FEE = 1_000_000_000; // 1 SUI in MIST
export const MIN_PARTICIPANTS = 2;
export const RANDOM_OBJECT = "0x8";

// Default package ID from your deployment
export const DEFAULT_PACKAGE_ID = "0x5c5d81f0c1b5a307df9358299e61f9b88f12711280c5f4864ef6d124f8c13d72";
export const RAFFLE_PACKAGE_ID = DEFAULT_PACKAGE_ID;

// Contract module and function names
export const CONTRACT_MODULE = "simple_raffle";
export const FUNCTIONS = {
  CREATE_RAFFLE: "create_raffle",
  JOIN: "join",
  PICK_WINNER: "pick_winner",
  GET_ENTRANTS: "get_entrants",
  GET_ENTRANT_COUNT: "get_entrant_count",
  GET_POOL_VALUE: "get_pool_value",
  IS_OPEN: "is_open",
  GET_OWNER: "get_owner",
  GET_WINNER: "get_winner",
  HAS_WINNER: "has_winner",
} as const;

// Error codes from the smart contract
export const ERROR_CODES = {
  ERaffleNotOpen: 0,
  EInsufficientPayment: 1,
  ENotOwner: 2,
  EAlreadyJoined: 3,
  EInsufficientParticipants: 4,
} as const;

// Error messages for user-friendly display
export const ERROR_MESSAGES = {
  [ERROR_CODES.ERaffleNotOpen]: "This raffle is not open for entries",
  [ERROR_CODES.EInsufficientPayment]: "Insufficient payment amount",
  [ERROR_CODES.ENotOwner]: "Only the raffle owner can perform this action",
  [ERROR_CODES.EAlreadyJoined]: "You have already joined this raffle",
  [ERROR_CODES.EInsufficientParticipants]: "Not enough participants to pick a winner",
} as const;
