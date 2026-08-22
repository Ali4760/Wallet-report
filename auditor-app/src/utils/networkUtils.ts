export const normalizeChainId = (rawChainId: string | number | null | undefined): number | null => {
  if (rawChainId === null || rawChainId === undefined) return null;
  if (typeof rawChainId === 'number') return rawChainId;
  const str = String(rawChainId).trim();
  if (str.startsWith('0x') || str.startsWith('0X')) {
    return parseInt(str, 16);
  }
  return parseInt(str, 10);
};

export const switchEvmNetwork = async (chainId: number, chainConfig: any): Promise<void> => {
  if (!window.ethereum) throw new Error("No Ethereum provider found.");
  
  const hexChainId = `0x${chainId.toString(16)}`;

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: hexChainId }],
    });
  } catch (switchError: any) {
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: hexChainId,
            chainName: chainConfig.displayName,
            nativeCurrency: { 
              name: chainConfig.nativeSymbol, 
              symbol: chainConfig.nativeSymbol, 
              decimals: 18 
            },
            rpcUrls: [chainConfig.rpcUrl],
          },
        ],
      });
    } else {
      throw switchError;
    }
  }
};
