import React from 'react';
import { Loader2, CheckCircle2, XCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { TxState } from '../hooks/useTokenAllowance';

interface Props {
  state: TxState;
  txHash: string;
  error: string;
  network: 'BNB' | 'TRON' | null;
  onReset: () => void;
}

const ApprovalStatus: React.FC<Props> = ({ state, txHash, error, network, onReset }) => {
  if (state === 'Idle') return null;

  const getExplorerLink = (hash: string) => {
    if (network === 'BNB') {
      return `https://bscscan.com/tx/${hash}`;
    } else {
      return `https://tronscan.org/#/transaction/${hash}`;
    }
  };

  const getStatusConfig = () => {
    switch (state) {
      case 'Preparing':
        return {
          icon: <Loader2 className="w-8 h-8 animate-spin text-[#94a3b8]" />,
          title: "Preparing Transaction",
          desc: "Constructing token approval payload...",
          color: "text-[#94a3b8]"
        };
      case 'Waiting for Wallet':
        return {
          icon: <Loader2 className="w-8 h-8 animate-spin text-[#f0b90b]" />,
          title: "Waiting for Wallet",
          desc: "Please confirm the transaction prompt in your wallet extension.",
          color: "text-[#f0b90b]"
        };
      case 'Submitted':
      case 'Confirming':
        return {
          icon: <Loader2 className="w-8 h-8 animate-spin text-blue-500" />,
          title: "Transaction Submitted",
          desc: "Confirming transaction on-chain. Please wait...",
          color: "text-blue-500"
        };
      case 'Confirmed':
        return {
          icon: <CheckCircle2 className="w-8 h-8 text-green-500" />,
          title: "Allowance Approved",
          desc: "Your USDT allowance has been successfully updated on-chain.",
          color: "text-green-500"
        };
      case 'Rejected':
        return {
          icon: <XCircle className="w-8 h-8 text-red-500" />,
          title: "Transaction Rejected",
          desc: "You declined the request in your wallet.",
          color: "text-red-500"
        };
      case 'Wrong Network':
        return {
          icon: <AlertCircle className="w-8 h-8 text-red-500" />,
          title: "Wrong Network Connected",
          desc: `Please switch your wallet network to ${network === 'BNB' ? 'BNB Smart Chain Mainnet' : 'TRON Mainnet'}.`,
          color: "text-red-500"
        };
      case 'Failed':
      default:
        return {
          icon: <XCircle className="w-8 h-8 text-red-500" />,
          title: "Transaction Failed",
          desc: error || "Something went wrong during transaction processing.",
          color: "text-red-500"
        };
    }
  };

  const config = getStatusConfig();
  const isPending = ['Preparing', 'Waiting for Wallet', 'Submitted', 'Confirming'].includes(state);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-sm rounded-2xl bg-[#111520] border border-[#1e2636] p-6 shadow-2xl text-center flex flex-col items-center">
        
        <div className="mb-4">
          {config.icon}
        </div>

        <h3 className={`font-bold text-lg mb-2 ${config.color}`}>
          {config.title}
        </h3>
        
        <p className="text-xs text-[#7b879b] mb-4 max-w-[260px] leading-relaxed">
          {config.desc}
        </p>

        {txHash && (
          <a
            href={getExplorerLink(txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0d1119] hover:bg-[#1a2130] border border-[#1e2636] text-[#94a3b8] hover:text-white font-mono text-[10px] mb-5 transition-colors"
          >
            Tx Hash: {txHash.substring(0, 8)}...{txHash.substring(txHash.length - 8)}
            <ExternalLink className="w-3 h-3" />
          </a>
        )}

        {!isPending && (
          <button
            onClick={onReset}
            className="w-full h-10 rounded-xl bg-[#1e2636] hover:bg-[#2a3444] text-white font-bold text-xs transition-colors"
          >
            Dismiss
          </button>
        )}
      </div>
    </div>
  );
};

export default ApprovalStatus;
