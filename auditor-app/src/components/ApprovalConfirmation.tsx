import React from 'react';
import { X, ShieldAlert, ArrowRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  token: string;
  network: string;
  tokenAddress: string;
  spender: string;
  currentAllowance: string;
  requestedAllowance: string;
}

const ApprovalConfirmation: React.FC<Props> = ({
  isOpen,
  onClose,
  onConfirm,
  token,
  network,
  tokenAddress,
  spender,
  currentAllowance,
  requestedAllowance,
}) => {
  if (!isOpen) return null;

  const isUnlimited = requestedAllowance === '' || Number(requestedAllowance) > 1e12;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-[#111520] border border-[#1e2636] p-5 shadow-2xl relative">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-[#f0b90b]" />
          Confirm Token Allowance
        </h3>

        <div className="space-y-3.5 text-xs">
          <div className="bg-[#0d1119] rounded-xl p-3.5 border border-[#1e2636] space-y-2.5 font-mono text-[#94a3b8]">
            <div className="flex justify-between">
              <span>Token:</span>
              <span className="text-white font-bold">{token}</span>
            </div>
            <div className="flex justify-between">
              <span>Network:</span>
              <span className="text-white font-bold">{network}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span>Token Contract Address:</span>
              <span className="text-white font-bold text-[10px] break-all">{tokenAddress}</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span>Spender Address:</span>
              <span className="text-white font-bold text-[10px] break-all">{spender}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 font-mono text-center">
            <div className="bg-[#0d1119] rounded-xl p-3 border border-[#1e2636]">
              <span className="text-[10px] text-[#4a5568] block mb-1">Current Allowance</span>
              <span className="text-white font-bold">{currentAllowance} USDT</span>
            </div>
            <div className="bg-[#0d1119] rounded-xl p-3 border border-[#1e2636]">
              <span className="text-[10px] text-[#4a5568] block mb-1">Requested Allowance</span>
              <span className="text-white font-bold">
                {isUnlimited ? "Unlimited" : `${requestedAllowance} USDT`}
              </span>
            </div>
          </div>

          <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-500 leading-relaxed text-[11px]">
            <strong>On-Chain Authorization:</strong> This transaction will authorize the spender contract to interact with your USDT tokens. Always verify the spender is trusted before confirming.
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-xl bg-[#1e2636] hover:bg-[#2a3444] text-[#94a3b8] font-bold text-xs transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 h-10 rounded-xl bg-[#f0b90b] hover:bg-[#f5c842] text-black font-bold text-xs transition-colors flex items-center justify-center gap-1.5"
          >
            Approve USDT
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApprovalConfirmation;
