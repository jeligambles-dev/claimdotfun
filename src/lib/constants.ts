// Timing
export const DASHBOARD_REFRESH_MS = 30 * 1000; // 30 seconds

// Costs
export const DEPLOY_COST_SOL = 0.03;
export const PRIORITY_FEE_SOL = 0.0001;

// Solana
export const RPC_URL = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";

// Validation limits
export const MAX_TOKEN_NAME_LENGTH = 32;
export const MAX_SYMBOL_LENGTH = 10;
export const MAX_DESCRIPTION_LENGTH = 500;
export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const MAX_INITIAL_BUY_SOL = 100;

// Rate limiting
export const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
export const RATE_LIMIT_MAX_REQUESTS = 10;

// Platforms
export const VALID_PLATFORMS = ["TWITTER", "INSTAGRAM", "TIKTOK"] as const;
export type Platform = typeof VALID_PLATFORMS[number];
