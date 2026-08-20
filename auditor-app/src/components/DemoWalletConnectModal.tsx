import React, { useState } from 'react';
import { X, Copy, Search, ChevronRight } from 'lucide-react';

interface Props {
  network: 'BNB' | 'TRON';
  onClose: () => void;
  onConnect: (address: string) => void;
}

const DemoWalletConnectModal: React.FC<Props> = ({ onClose, onConnect }) => {
  const [demoAddress, setDemoAddress] = useState('');
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

  // Simulate clicking a wallet option or scanning
  const handleSimulateConnection = () => {
    // In a real app this would be triggered by WalletConnect's provider
    onConnect(demoAddress || '0xDEMO1234567890abcdef1234567890abcdef1234');
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-[340px] rounded-3xl bg-[#141414] border border-[#2a2a2a] p-4 shadow-2xl relative">
        <div className="flex items-center justify-between mb-4 px-2 pt-2">
          <div className="flex-1"></div>
          <h3 className="text-white font-semibold text-lg flex-1 text-center font-sans tracking-tight">WalletConnect</h3>
          <div className="flex-1 flex justify-end">
            <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div 
          onClick={handleSimulateConnection}
          className="w-full aspect-square rounded-2xl bg-[#1e1e1e] border border-[#2a2a2a] mb-6 flex items-center justify-center cursor-pointer hover:bg-[#252525] transition-colors"
          title="Click to simulate QR scan connection"
        >
          {/* Placeholder for QR Code */}
          <p className="text-[#4a5568] text-xs font-mono">Simulate Scan (Click)</p>
        </div>

        <div className="text-center mb-5">
          <p className="text-white font-medium text-[15px] mb-3">Scan this QR Code with your phone</p>
          <button 
            onClick={handleSimulateConnection}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2a2a2a] bg-[#1e1e1e] text-[#9ca3af] hover:text-white text-xs font-medium transition-colors"
          >
            <span className="font-mono text-[10px]">Copy link</span>
            <Copy className="w-3 h-3" />
          </button>
        </div>

        <div 
          onClick={handleSimulateConnection}
          className="flex items-center justify-between p-3 rounded-xl bg-[#1e1e1e] border border-[#2a2a2a] cursor-pointer hover:bg-[#252525] transition-colors"
        >
          <div className="flex items-center gap-3">
            <Search className="w-4 h-4 text-[#9ca3af]" />
            <span className="text-white font-medium text-sm">Search Wallet</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[#9ca3af] text-xs">30</span>
            <ChevronRight className="w-4 h-4 text-[#9ca3af]" />
          </div>
        </div>

        {isDemoMode && (
          <div className="mt-4 pt-4 border-t border-[#2a2a2a]">
            <p className="text-xs text-[#94a3b8] mb-2 font-mono">DEMO OVERRIDE: ENTER ADDRESS</p>
            <input
              type="text"
              value={demoAddress}
              onChange={(e) => setDemoAddress(e.target.value)}
              placeholder="0x..."
              className="w-full bg-[#0d1119] border border-[#1e2636] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#4a5568] transition-colors"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DemoWalletConnectModal;
