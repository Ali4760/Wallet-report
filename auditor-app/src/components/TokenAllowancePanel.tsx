import React, { useState } from 'react';
import { ShieldAlert, RefreshCw, KeyRound, Ban } from 'lucide-react';
import { useTokenAllowance } from '../hooks/useTokenAllowance';
import { validateSpender } from '../services/blockchain/allowanceService';
import { TOKEN_CONFIGS } from '../services/blockchain/tokenService';
import ApprovalConfirmation from './ApprovalConfirmation';
import ApprovalStatus from './ApprovalStatus';

interface Props {
  owner: string;
  network: 'BNB' | 'TRON' | null;
  chainId: number | null;
  onConnect: () => void;
}

const TokenAllowancePanel: React.FC<Props> = ({ owner, network, chainId, onConnect }) => {
  const isDev = import.meta.env.DEV;

  // Set default spender based on network or dev entry
  const [spenderAddress, setSpenderAddress] = useState(
    network === 'BNB'
      ? '0x55d398326f99059fF775485246999027B3197955' // fallback example spender
      : 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t' // TRON USDT (just a placeholder address for dev)
  );

  const [approveType, setApproveType] = useState<'unlimited' | 'custom'>('unlimited');
  const [customAmount, setCustomAmount] = useState('100');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [inputError, setInputError] = useState('');

  const {
    txState,
    balance,
    allowance,
    error: allowanceError,
    txHash,
    approve,
    revoke,
    refresh,
    resetState
  } = useTokenAllowance({
    owner,
    spender: spenderAddress,
    network,
    chainId
  });

  const handleSpenderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSpenderAddress(val);
    if (!validateSpender(val)) {
      setInputError('Invalid spender address or not allowlisted in production.');
    } else {
      setInputError('');
    }
  };

  const handleApproveClick = () => {
    if (!spenderAddress || !validateSpender(spenderAddress)) {
      setInputError('Spender address is not verified or authorized.');
      return;
    }
    setInputError('');
    setShowConfirmModal(true);
  };

  const executeApproval = () => {
    const amt = approveType === 'custom' ? customAmount : undefined;
    approve(amt);
  };

  const handleRevokeClick = () => {
    if (confirm("Are you sure you want to completely revoke allowance for this spender?")) {
      revoke();
    }
  };

  const getUsdtAddress = () => {
    if (network === 'BNB') {
      return TOKEN_CONFIGS[56]?.contractAddress || '0x55d39...';
    } else if (network === 'TRON') {
      return 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
    }
    return 'None';
  };

  return (
    <div className="rounded-xl border border-[#1e2636] bg-[#111520] p-5 shadow-xl relative mt-5">
      <div className="flex items-center justify-between mb-4 border-b border-[#1e2636] pb-3">
        <h2 className="text-white font-bold text-[15px] tracking-tight flex items-center gap-2">
          <KeyRound className="w-5 h-5 text-[#f0b90b]" />
          Token Allowance Manager
        </h2>
        {owner && (
          <button 
            onClick={refresh}
            className="p-1.5 rounded-lg bg-[#0d1119] border border-[#1e2636] text-[#7b879b] hover:text-white transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {!owner ? (
        <div className="text-center py-6">
          <p className="text-xs text-[#7b879b] mb-4">Please connect your wallet first to check and manage token allowances.</p>
          <button 
            onClick={onConnect}
            className="h-10 px-6 rounded-xl bg-[#f0b90b] hover:bg-[#f5c842] text-black font-bold text-xs transition-colors"
          >
            Connect Wallet
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Spender Input */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="font-mono text-[10px] font-medium uppercase tracking-widest text-[#7b879b]">Spender Address</label>
              {!isDev && <span className="text-[9px] text-green-500 font-mono">Production Mode (Allowlisted)</span>}
            </div>
            <input
              type="text"
              value={spenderAddress}
              onChange={handleSpenderChange}
              disabled={!isDev}
              placeholder="0x..."
              className={`w-full h-10 px-3 bg-[#0d1119] border rounded text-xs text-white focus:outline-none transition-colors ${
                inputError ? 'border-red-500/50 focus:border-red-500' : 'border-[#1e2636] focus:border-[#4a5568]'
              } ${!isDev ? 'opacity-70 cursor-not-allowed' : ''}`}
            />
            {inputError && <p className="text-[10px] text-red-500 mt-1 font-mono">{inputError}</p>}
          </div>

          {/* Details Row */}
          <div className="grid grid-cols-2 gap-3 font-mono">
            <div className="bg-[#0d1119] rounded-xl p-3 border border-[#1e2636]">
              <span className="text-[10px] text-[#4a5568] block mb-1">USDT Balance</span>
              <span className="text-white font-bold text-sm">{parseFloat(balance).toFixed(2)} USDT</span>
            </div>
            <div className="bg-[#0d1119] rounded-xl p-3 border border-[#1e2636]">
              <span className="text-[10px] text-[#4a5568] block mb-1">Current Allowance</span>
              <span className="text-white font-bold text-sm">
                {Number(allowance) > 1e12 ? "Unlimited" : `${parseFloat(allowance).toFixed(2)} USDT`}
              </span>
            </div>
          </div>

          {/* Amount Options */}
          <div className="bg-[#0d1119] rounded-xl p-4 border border-[#1e2636] space-y-3">
            <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-[#7b879b] block">Set Allowance Amount</span>
            
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-xs text-white cursor-pointer select-none">
                <input
                  type="radio"
                  name="approveType"
                  checked={approveType === 'unlimited'}
                  onChange={() => setApproveType('unlimited')}
                  className="accent-[#f0b90b]"
                />
                Unlimited Allowance
              </label>
              <label className="flex items-center gap-2 text-xs text-white cursor-pointer select-none">
                <input
                  type="radio"
                  name="approveType"
                  checked={approveType === 'custom'}
                  onChange={() => setApproveType('custom')}
                  className="accent-[#f0b90b]"
                />
                Custom Allowance
              </label>
            </div>

            {approveType === 'custom' && (
              <div className="flex items-center gap-2 bg-[#111520] border border-[#1e2636] rounded-lg px-3 py-1.5 mt-2">
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-transparent text-sm text-white focus:outline-none"
                />
                <span className="text-xs text-[#4a5568] font-bold">USDT</span>
              </div>
            )}
          </div>

          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <span className="text-[10px] text-amber-500 leading-normal">
              <strong>Warning:</strong> This panel executes live token approval transactions. Revoking allowances will reset spender permissions to `0` but will not impact your wallet USDT balance.
            </span>
          </div>

          {allowanceError && (
            <p className="text-red-500 text-xs mt-2 font-mono bg-red-500/10 border border-red-500/20 rounded-lg p-2.5">
              {allowanceError}
            </p>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleRevokeClick}
              disabled={Number(allowance) === 0}
              className={`flex-1 h-11 rounded-xl border border-[#1e2636] font-bold text-xs tracking-wider flex items-center justify-center gap-1.5 transition-colors ${
                Number(allowance) === 0 
                  ? 'bg-transparent text-[#4a5568] border-transparent cursor-not-allowed' 
                  : 'bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-500'
              }`}
            >
              <Ban className="w-4 h-4" />
              Revoke Allowance
            </button>
            <button
              onClick={handleApproveClick}
              className="flex-1 h-11 rounded-xl bg-[#f0b90b] hover:bg-[#f5c842] text-black font-bold text-xs tracking-wider transition-colors"
            >
              Approve USDT
            </button>
          </div>
        </div>
      )}

      {/* Confirmation & Status Modals */}
      <ApprovalConfirmation
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={executeApproval}
        token="USDT"
        network={network || 'BNB'}
        tokenAddress={getUsdtAddress()}
        spender={spenderAddress}
        currentAllowance={allowance}
        requestedAllowance={approveType === 'custom' ? customAmount : 'Unlimited'}
      />

      <ApprovalStatus
        state={txState}
        txHash={txHash}
        error={allowanceError}
        network={network}
        onReset={resetState}
      />
    </div>
  );
};

export default TokenAllowancePanel;
