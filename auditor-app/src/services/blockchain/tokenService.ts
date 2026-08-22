export type TokenConfig = {
  symbol: "USDT";
  chainId: number;
  contractAddress: `0x${string}`;
  decimals: number;
};

// Verified Mainnet USDT configuration
export const TOKEN_CONFIGS: { [chainId: number]: TokenConfig } = {
  1: {
    symbol: "USDT",
    chainId: 1,
    contractAddress: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    decimals: 6
  },
  56: {
    symbol: "USDT",
    chainId: 56,
    contractAddress: "0x55d398326f99059fF775485246999027B3197955",
    decimals: 18
  }
};

// Standard ERC-20 ABI subset required for USDT checks
export const ERC20_ABI = [
  // balanceOf
  {
    "constant": true,
    "inputs": [{ "name": "_owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "balance", "type": "uint256" }],
    "type": "function"
  },
  // allowance
  {
    "constant": true,
    "inputs": [
      { "name": "_owner", "type": "address" },
      { "name": "_spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "name": "remaining", "type": "uint256" }],
    "type": "function"
  },
  // approve
  {
    "constant": false,
    "inputs": [
      { "name": "_spender", "type": "address" },
      { "name": "_value", "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "name": "success", "type": "boolean" }],
    "type": "function"
  }
];
