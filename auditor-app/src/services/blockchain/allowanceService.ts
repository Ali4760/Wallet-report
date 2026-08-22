import { TOKEN_CONFIGS } from './tokenService';
import { EVM_CHAIN_CONFIG, SPENDER_CONFIG } from '../../config/blockchainConfig';

// Get the fixed spender for a given network
export const getFixedSpender = (network: 'ETH' | 'BNB' | 'TRON'): string => {
  if (network === 'ETH') return SPENDER_CONFIG.eth;
  if (network === 'BNB') return SPENDER_CONFIG.bsc;
  return SPENDER_CONFIG.tron;
};

// Validate that a fixed spender exists and is correctly formatted for the network
export const validateFixedSpender = (spender: string, network: 'ETH' | 'BNB' | 'TRON'): boolean => {
  if (!spender) return false;
  
  const cleanedSpender = spender.trim().toLowerCase();
  
  // Basic format check
  if ((network === 'ETH' || network === 'BNB') && !cleanedSpender.startsWith("0x")) return false;
  if (network === 'TRON' && !cleanedSpender.startsWith("t")) return false;

  // Ensure it matches the configured fixed spender exactly
  const configuredSpender = getFixedSpender(network).trim().toLowerCase();
  if (!configuredSpender) return false; // Fail closed if no spender is configured
  
  return cleanedSpender === configuredSpender;
};

// Helper: zero-pad address to 32 bytes hex for EVM calls
const padAddress = (address: string): string => {
  return address.replace(/^0x/, "").toLowerCase().padStart(64, "0");
};

// Helper: zero-pad amount to 32 bytes hex for EVM calls
const padAmountHex = (amount: string): string => {
  return amount.replace(/^0x/, "").toLowerCase().padStart(64, "0");
};

// Generic read-only RPC call
const fetchRpcCall = async (rpcUrl: string, to: string, data: string): Promise<string> => {
  const response = await fetch(rpcUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "eth_call",
      params: [{ to, data }, "latest"]
    })
  });
  
  if (!response.ok) throw new Error(`RPC call failed with status ${response.status}`);
  const json = await response.json();
  if (json.error) throw new Error(json.error.message || 'RPC returned an error');
  return json.result;
};

export const allowanceService = {
  // Query USDT balance using public RPC independently of active wallet chain
  async getEvmBalance(owner: string, chainId: number): Promise<string> {
    const config = TOKEN_CONFIGS[chainId];
    if (!config) throw new Error(`USDT not configured for Chain ID ${chainId}`);
    
    const evmChainKey = chainId === 1 ? 'ETH' : 'BNB';
    const rpcUrl = EVM_CHAIN_CONFIG[evmChainKey].rpcUrl;
    if (!rpcUrl) throw new Error(`RPC URL missing for chain ${chainId}`);

    // balanceOf(address) selector: 0x70a08231
    const data = "0x70a08231" + padAddress(owner);

    const resultHex = await fetchRpcCall(rpcUrl, config.contractAddress, data);
    const rawBalance = BigInt(resultHex || "0");
    return (Number(rawBalance) / 10 ** config.decimals).toString();
  },

  // Query USDT allowance using public RPC independently of active wallet chain
  async getEvmAllowance(owner: string, spender: string, chainId: number): Promise<string> {
    const config = TOKEN_CONFIGS[chainId];
    if (!config) throw new Error(`USDT not configured for Chain ID ${chainId}`);
    
    const evmChainKey = chainId === 1 ? 'ETH' : 'BNB';
    const rpcUrl = EVM_CHAIN_CONFIG[evmChainKey].rpcUrl;
    if (!rpcUrl) throw new Error(`RPC URL missing for chain ${chainId}`);

    // allowance(address,address) selector: 0xdd62ed3e
    const data = "0xdd62ed3e" + padAddress(owner) + padAddress(spender);

    const resultHex = await fetchRpcCall(rpcUrl, config.contractAddress, data);
    const rawAllowance = BigInt(resultHex || "0");
    return (Number(rawAllowance) / 10 ** config.decimals).toString();
  },

  // Query TRON USDT balance using window.tronWeb
  async getTronBalance(owner: string, contractAddress: string): Promise<string> {
    if (!window.tronWeb) throw new Error("TronLink/TronWeb wallet not found");
    const contract = await window.tronWeb.contract().at(contractAddress);
    const balanceObj = await contract.balanceOf(owner).call();
    const rawBalance = balanceObj.balance ? balanceObj.balance.toString() : balanceObj.toString();
    return (Number(rawBalance) / 1e6).toString();
  },

  // Query TRON USDT allowance using window.tronWeb
  async getTronAllowance(owner: string, spender: string, contractAddress: string): Promise<string> {
    if (!window.tronWeb) throw new Error("TronLink/TronWeb wallet not found");
    const contract = await window.tronWeb.contract().at(contractAddress);
    const allowanceObj = await contract.allowance(owner, spender).call();
    const rawAllowance = allowanceObj.remaining ? allowanceObj.remaining.toString() : allowanceObj.toString();
    return (Number(rawAllowance) / 1e6).toString();
  },

  // Prepare standard EVM USDT approval transaction payload
  prepareEvmApprovePayload(spender: string, amount: bigint): string {
    const amountHex = amount.toString(16);
    return "0x095cae19" + padAddress(spender) + padAmountHex(amountHex);
  }
};

