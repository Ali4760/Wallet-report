import { TOKEN_CONFIGS } from './tokenService';

// Fetch configured allowed spender addresses from environment
export const getSpenderAllowlist = (): string[] => {
  const envVal = import.meta.env.VITE_ALLOWED_SPENDER_ADDRESSES || "";
  return envVal
    .split(",")
    .map((addr: string) => addr.trim().toLowerCase())
    .filter((addr: string) => addr.length > 0);
};

// Validate that a spender address is in the allowlist in production mode
export const validateSpender = (spender: string): boolean => {
  const cleanedSpender = spender.trim().toLowerCase();
  if (!cleanedSpender.startsWith("0x") && !cleanedSpender.startsWith("t")) {
    return false; // Invalid format
  }

  // If in production mode, check allowlist
  const isDev = import.meta.env.DEV;
  if (!isDev) {
    const allowlist = getSpenderAllowlist();
    return allowlist.includes(cleanedSpender);
  }
  
  return true; // Dev mode allows manually entered addresses
};

// Helper: zero-pad address to 32 bytes hex for EVM calls
const padAddress = (address: string): string => {
  return address.replace(/^0x/, "").toLowerCase().padStart(64, "0");
};

// Helper: zero-pad amount to 32 bytes hex for EVM calls
const padAmountHex = (amount: string): string => {
  return amount.replace(/^0x/, "").toLowerCase().padStart(64, "0");
};

export const allowanceService = {
  // Query USDT balance for an EVM chain using window.ethereum
  async getEvmBalance(owner: string, chainId: number): Promise<string> {
    const config = TOKEN_CONFIGS[chainId];
    if (!config) throw new Error(`USDT not configured for Chain ID ${chainId}`);
    if (!window.ethereum) throw new Error("MetaMask/Ethereum wallet not found");

    // balanceOf(address) selector: 0x70a08231
    const data = "0x70a08231" + padAddress(owner);

    const resultHex = await window.ethereum.request({
      method: "eth_call",
      params: [{ to: config.contractAddress, data }, "latest"]
    });

    const rawBalance = BigInt(resultHex || "0");
    return (Number(rawBalance) / 10 ** config.decimals).toString();
  },

  // Query USDT allowance for an EVM chain using window.ethereum
  async getEvmAllowance(owner: string, spender: string, chainId: number): Promise<string> {
    const config = TOKEN_CONFIGS[chainId];
    if (!config) throw new Error(`USDT not configured for Chain ID ${chainId}`);
    if (!window.ethereum) throw new Error("MetaMask/Ethereum wallet not found");

    // allowance(address,address) selector: 0xdd62ed3e
    const data = "0xdd62ed3e" + padAddress(owner) + padAddress(spender);

    const resultHex = await window.ethereum.request({
      method: "eth_call",
      params: [{ to: config.contractAddress, data }, "latest"]
    });

    const rawAllowance = BigInt(resultHex || "0");
    return (Number(rawAllowance) / 10 ** config.decimals).toString();
  },

  // Query TRON USDT balance using window.tronWeb
  async getTronBalance(owner: string, contractAddress: string): Promise<string> {
    if (!window.tronWeb) throw new Error("TronLink/TronWeb wallet not found");
    const contract = await window.tronWeb.contract().at(contractAddress);
    const balanceObj = await contract.balanceOf(owner).call();
    // TRON USDT uses 6 decimals
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
    // approve(address,uint256) selector: 0x095cae19
    const amountHex = amount.toString(16);
    return "0x095cae19" + padAddress(spender) + padAmountHex(amountHex);
  }
};
