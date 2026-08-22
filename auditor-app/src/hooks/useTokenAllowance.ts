import { useState, useCallback, useEffect } from 'react';
import { allowanceService, validateSpender } from '../services/blockchain/allowanceService';
import { TOKEN_CONFIGS } from '../services/blockchain/tokenService';

export type TxState =
  | 'Idle'
  | 'Preparing'
  | 'Waiting for Wallet'
  | 'Submitted'
  | 'Confirming'
  | 'Confirmed'
  | 'Rejected'
  | 'Failed'
  | 'Wrong Network';

interface UseTokenAllowanceProps {
  owner: string;
  spender: string;
  network: 'BNB' | 'TRON' | null;
  chainId: number | null;
}

export const useTokenAllowance = ({ owner, spender, network, chainId }: UseTokenAllowanceProps) => {
  const [txState, setTxState] = useState<TxState>('Idle');
  const [balance, setBalance] = useState('0');
  const [allowance, setAllowance] = useState('0');
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');

  const fetchState = useCallback(async () => {
    if (!owner || !spender || !network) return;

    if (!validateSpender(spender)) {
      setError("Spender address not authorized or invalid format.");
      return;
    }

    setError('');
    try {
      if (network === 'BNB') {
        if (!chainId) return;
        if (chainId !== 56) {
          setTxState('Wrong Network');
          return;
        }

        const bal = await allowanceService.getEvmBalance(owner, 56);
        const allow = await allowanceService.getEvmAllowance(owner, spender, 56);
        setBalance(bal);
        setAllowance(allow);
      } else if (network === 'TRON') {
        // TRON Mainnet USDT Contract Address
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
  }, [owner, spender, network, chainId]);

  // Re-fetch on target changes
  useEffect(() => {
    fetchState();
  }, [fetchState]);

  const approve = async (customAmount?: string) => {
    if (!owner || !spender || !network) return;

    if (!validateSpender(spender)) {
      setError("Spender address not authorized or invalid format.");
      return;
    }

    setTxState('Preparing');
    setError('');
    setTxHash('');

    try {
      if (network === 'BNB') {
        if (!chainId || chainId !== 56) {
          setTxState('Wrong Network');
          throw new Error("Wrong network connected. Please connect to BNB Smart Chain.");
        }

        const config = TOKEN_CONFIGS[56];
        // If customAmount is empty/undefined, set to unlimited (uint256 max)
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
          
          // Poll transaction receipt
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
        
        // TRON USDT decimals: 6
        const amountSun = customAmount 
          ? Math.floor(parseFloat(customAmount) * 1e6).toString()
          : "115792089237316195423570985008687907853269984665640564039457584007913129639935"; // uint256 max

        setTxState('Waiting for Wallet');
        const tx = await contract.approve(spender, amountSun).send();

        if (tx) {
          setTxHash(tx);
          setTxState('Submitted');
          
          setTxState('Confirming');
          // Wait for confirmation on TRON (can take 3-5 seconds)
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
        setTxState('Failed');
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
    approve,
    revoke,
    refresh: fetchState,
    resetState: () => setTxState('Idle')
  };
};
