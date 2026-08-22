export type SupportedEvmChain = "ETH" | "BNB";

export type ChainConfig = {
  key: SupportedEvmChain;
  chainId: number;
  displayName: string;
  nativeSymbol: string;
  usdtContract: string;
  usdtDecimals: number;
  spender: string;
  rpcUrl?: string;
};

// Single source of truth for authorized token spenders & EVM chain setups
export const EVM_CHAIN_CONFIG: Record<SupportedEvmChain, ChainConfig> = {
  ETH: {
    key: "ETH",
    chainId: 1,
    displayName: "Ethereum Mainnet",
    nativeSymbol: "ETH",
    usdtContract: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
    usdtDecimals: 6,
    spender: import.meta.env.VITE_ETH_SPENDER_ADDRESS || "",
    rpcUrl: import.meta.env.VITE_ETH_RPC_URL || "https://eth.llamarpc.com",
  },
  BNB: {
    key: "BNB",
    chainId: 56,
    displayName: "BNB Smart Chain",
    nativeSymbol: "BNB",
    usdtContract: "0x55d398326f99059fF775485246999027B3197955",
    usdtDecimals: 18,
    spender: import.meta.env.VITE_BSC_SPENDER_ADDRESS || "",
    rpcUrl: import.meta.env.VITE_BSC_RPC_URL || "https://bsc-dataseed.binance.org/",
  },
};

export const SPENDER_CONFIG = {
  bsc: import.meta.env.VITE_BSC_SPENDER_ADDRESS || "",
  eth: import.meta.env.VITE_ETH_SPENDER_ADDRESS || "",
  tron: import.meta.env.VITE_TRON_SPENDER_ADDRESS || "",
};
