import React, { useState } from 'react';
import { ShieldAlert, RefreshCw, KeyRound, Ban, ChevronDown } from 'lucide-react';
import { useTokenAllowance } from '../hooks/useTokenAllowance';
import { TOKEN_CONFIGS } from '../services/blockchain/tokenService';
import ApprovalConfirmation from './ApprovalConfirmation';
import ApprovalStatus from './ApprovalStatus';
import { ReportBalances } from '../pages/Dashboard';

interface Props {
  owner: string;
  network: 'ETH' | 'BNB' | 'TRON' | null;
  setNetwork: (network: 'ETH' | 'BNB' | 'TRON' | null) => void;
  chainId: number | null;
  onConnect: () => void;
  reportBalances: ReportBalances;
}

const TokenAllowancePanel: React.FC<Props> = ({ owner, network, setNetwork, chainId, onConnect, reportBalances }) => {
  // Require explicit user choice (no default)
  const [approveType, setApproveType] = useState<'unlimited' | 'custom' | ''>('');
  const [customAmount, setCustomAmount] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [inputError, setInputError] = useState('');
  const [isSelectingNetwork, setIsSelectingNetwork] = useState(false);

  const {
    txState,
    balance,
    allowance,
    error: allowanceError,
    txHash,
    fixedSpender,
    approve,
    revoke,
    refresh,
    resetState
  } = useTokenAllowance({
    owner,
    network,
    chainId
  });

  const handleApproveClick = () => {
    if (!network) {
      setInputError('Please select a network first.');
      return;
    }

    if (!fixedSpender) {
      setInputError(`No authorized spender configured for ${network}.`);
      return;
    }
    
    if (approveType === '') {
      setInputError('Please select an allowance amount type.');
      return;
    }
    
    if (approveType === 'custom' && (!customAmount || parseFloat(customAmount) <= 0)) {
      setInputError('Please enter a valid custom amount.');
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
    if (!fixedSpender) {
      setInputError(`No authorized spender configured for ${network || 'this network'}.`);
      return;
    }
    if (confirm("Are you sure you want to completely revoke allowance for this spender?")) {
      revoke();
    }
  };

  const getUsdtAddress = () => {
    if (network === 'ETH') {
      return TOKEN_CONFIGS[1]?.contractAddress || '0xdAC17...';
    } else if (network === 'BNB') {
      return TOKEN_CONFIGS[56]?.contractAddress || '0x55d39...';
    } else if (network === 'TRON') {
      return 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t';
    }
    return 'None';
  };
  
  const getNetworkName = (net: typeof network) => {
    if (net === 'ETH') return 'Ethereum Mainnet';
    if (net === 'BNB') return 'BNB Smart Chain';
    if (net === 'TRON') return 'TRON Mainnet';
    return 'Select Network';
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
          
          {/* Network Selection */}
          <div className="relative">
            <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-[#7b879b] block mb-2">Select USDT Network</span>
            
            <button 
              onClick={() => setIsSelectingNetwork(!isSelectingNetwork)}
              className="w-full flex items-center justify-between bg-[#0d1119] border border-[#1e2636] p-3 rounded-xl hover:border-[#f0b90b]/50 transition-colors"
            >
              <span className={`text-sm font-semibold ${network ? 'text-white' : 'text-[#4a5568]'}`}>
                {getNetworkName(network)}
              </span>
              <ChevronDown className="w-4 h-4 text-[#7b879b]" />
            </button>

            {isSelectingNetwork && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-[#0d1119] border border-[#1e2636] rounded-xl overflow-hidden z-10 shadow-2xl">
                <button 
                  onClick={() => { setNetwork('ETH'); setIsSelectingNetwork(false); }}
                  className="w-full text-left px-4 py-3 border-b border-[#1e2636] hover:bg-[#1e2636] flex justify-between items-center"
                >
                  <span className="text-sm text-white font-medium">Ethereum Mainnet</span>
                  <span className="text-xs text-[#7b879b] font-mono">{reportBalances.ETH ? `${parseFloat(reportBalances.ETH).toFixed(2)} USDT` : ''}</span>
                </button>
                <button 
                  onClick={() => { setNetwork('BNB'); setIsSelectingNetwork(false); }}
                  className="w-full text-left px-4 py-3 border-b border-[#1e2636] hover:bg-[#1e2636] flex justify-between items-center"
                >
                  <span className="text-sm text-white font-medium">BNB Smart Chain</span>
                  <span className="text-xs text-[#7b879b] font-mono">{reportBalances.BNB ? `${parseFloat(reportBalances.BNB).toFixed(2)} USDT` : ''}</span>
                </button>
                <button 
                  onClick={() => { setNetwork('TRON'); setIsSelectingNetwork(false); }}
                  className="w-full text-left px-4 py-3 hover:bg-[#1e2636] flex justify-between items-center"
                >
                  <span className="text-sm text-white font-medium">TRON Mainnet</span>
                  <span className="text-xs text-[#7b879b] font-mono">{reportBalances.TRON ? `${parseFloat(reportBalances.TRON).toFixed(2)} USDT` : ''}</span>
                </button>
              </div>
            )}
          </div>

          {network && (
            <>
              {/* Spender Info Read-Only */}
              <div className="bg-[#0d1119] rounded-xl p-4 border border-[#1e2636] space-y-3 font-mono mt-4">
                 <div className="flex justify-between items-start">
                   <div>
                      <span className="text-[10px] text-[#4a5568] block mb-1 uppercase tracking-widest font-sans">Authorized Spender</span>
                      <span className="text-white text-xs break-all">{fixedSpender || 'Not Configured'}</span>
                   </div>
                 </div>
                 <div className="pt-2 border-t border-[#1e2636]">
                   <span className="text-[10px] text-[#4a5568] block mb-1 uppercase tracking-widest font-sans">Token Contract (USDT)</span>
                   <span className="text-[#7b879b] text-[11px] break-all">{getUsdtAddress()}</span>
                 </div>
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
                      onChange={() => {
                        setApproveType('unlimited');
                        setInputError('');
                      }}
                      className="accent-[#f0b90b]"
                    />
                    Unlimited Allowance
                  </label>
                  <label className="flex items-center gap-2 text-xs text-white cursor-pointer select-none">
                    <input
                      type="radio"
                      name="approveType"
                      checked={approveType === 'custom'}
                      onChange={() => {
                        setApproveType('custom');
                        setInputError('');
                      }}
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
                      onChange={(e) => {
                         setCustomAmount(e.target.value);
                         setInputError('');
                      }}
                      placeholder="0.00"
                      className="w-full bg-transparent text-sm text-white focus:outline-none"
                    />
                    <span className="text-xs text-[#4a5568] font-bold">USDT</span>
                  </div>
                )}
                
                {inputError && <p className="text-[10px] text-red-500 mt-2 font-mono">{inputError}</p>}
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
                  disabled={Number(allowance) === 0 || !fixedSpender}
                  className={`flex-1 h-11 rounded-xl border border-[#1e2636] font-bold text-xs tracking-wider flex items-center justify-center gap-1.5 transition-colors ${
                    Number(allowance) === 0 || !fixedSpender
                      ? 'bg-transparent text-[#4a5568] border-transparent cursor-not-allowed' 
                      : 'bg-red-500/10 hover:bg-red-500/20 border-red-500/30 text-red-500'
                  }`}
                >
                  <Ban className="w-4 h-4" />
                  Revoke Allowance
                </button>
                <button
                  onClick={handleApproveClick}
                  disabled={!fixedSpender}
                  className={`flex-1 h-11 rounded-xl font-bold text-xs tracking-wider transition-colors ${
                    !fixedSpender
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-[#f0b90b] hover:bg-[#f5c842] text-black'
                  }`}
                >
                  Approve USDT
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Confirmation & Status Modals */}
      <ApprovalConfirmation
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={executeApproval}
        token="USDT"
        network={getNetworkName(network)}
        tokenAddress={getUsdtAddress()}
        spender={fixedSpender}
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
