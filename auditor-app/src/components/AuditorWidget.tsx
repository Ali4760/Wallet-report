import React, { useState } from 'react';
import { Shield, Activity, FileText, Lock } from 'lucide-react';
import AnalysisSlider from './AnalysisSlider';
import DemoWalletConnectModal from './DemoWalletConnectModal';
import ReportLoadingState from './ReportLoadingState';
import SecurityReportPanel from './SecurityReportPanel';
import { mockReportService } from '../services/mockReportService';

type AppState = 'IDLE' | 'CONNECTING' | 'ANALYZING' | 'REPORT';

const AuditorWidget: React.FC = () => {
  const [appState, setAppState] = useState<AppState>('IDLE');
  const [selectedNetwork, setSelectedNetwork] = useState<'BNB' | 'TRON' | null>(null);
  const [walletAddress, setWalletAddress] = useState('');
  const [reportData, setReportData] = useState<any>(null);

  // VITE_DEMO_MODE config
  const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';

  const handleGenerateClick = (network: 'BNB' | 'TRON') => {
    setSelectedNetwork(network);
    if (isDemoMode && walletAddress) {
      startAnalysis(walletAddress, network);
    } else {
      setAppState('CONNECTING');
    }
  };

  const handleWalletConnected = (address: string) => {
    setWalletAddress(address);
    startAnalysis(address, selectedNetwork || 'BNB');
  };

  const startAnalysis = (address: string, network: 'BNB' | 'TRON') => {
    setAppState('ANALYZING');
    
    // Simulate the 10s progress sequence (handled in ReportLoadingState)
    setTimeout(() => {
      const data = mockReportService.generateReport(address, network);
      setReportData(data);
      setAppState('REPORT');
    }, 10000);
  };

  return (
    <div className="rounded-xl border border-[#1e2636] bg-[#111520] overflow-hidden shadow-[0_32px_80px_rgba(0,0,0,0.6)]">
      {/* Header section is consistent across IDLE and CONNECTING */}
      {(appState === 'IDLE' || appState === 'CONNECTING') && (
        <>
          <div className="px-5 pt-5 pb-4 border-b border-[#1e2636]">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#f0b90b]/10 border border-[#f0b90b]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Shield className="w-5 h-5 text-[#f0b90b]" />
              </div>
              <div>
                <h1 className="text-white font-bold text-[15px] tracking-tight leading-snug">
                  Wallet Security Center · BNB + TRON
                </h1>
                <p className="text-[#4a5568] text-[11px] mt-0.5 leading-relaxed">
                  On-chain audit portal for BNB Smart Chain and TRON Mainnet
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="bg-[#0d1119] rounded-lg px-2.5 py-2 border border-[#1e2636]">
                <p className="text-[#2a3444] text-[9px] font-medium uppercase tracking-wider font-mono">Networks</p>
                <p className="text-[#94a3b8] font-mono font-bold text-xs mt-0.5">BSC · TRON</p>
              </div>
              <div className="bg-[#0d1119] rounded-lg px-2.5 py-2 border border-[#1e2636]">
                <p className="text-[#2a3444] text-[9px] font-medium uppercase tracking-wider font-mono">Standards</p>
                <p className="text-[#94a3b8] font-mono font-bold text-xs mt-0.5">BEP-20 · TRC-20</p>
              </div>
              <div className="bg-[#0d1119] rounded-lg px-2.5 py-2 border border-[#1e2636]">
                <p className="text-[#2a3444] text-[9px] font-medium uppercase tracking-wider font-mono">Token</p>
                <p className="text-[#94a3b8] font-mono font-bold text-xs mt-0.5">USDT</p>
              </div>
            </div>
          </div>

          <div className="border-b border-[#1e2636] px-5 py-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-[#7b879b]">Available Services</p>
              <span className="font-mono text-[9px] text-[#4a5568]">READ-ONLY</span>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="flex min-w-0 items-center gap-3 rounded-xl border border-[#f0b90b]/20 bg-[#f0b90b]/5 p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#f0b90b]/25 bg-[#f0b90b]/10">
                  <span className="font-mono text-[10px] font-black text-[#f0b90b]">BNB</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white">BNB Smart Chain</p>
                  <p className="mt-1 truncate text-[10px] text-[#7b879b]">BEP-20 security reporting</p>
                </div>
              </div>
              <div className="flex min-w-0 items-center gap-3 rounded-xl border border-[#eb0029]/20 bg-[#eb0029]/5 p-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#eb0029]/25 bg-[#eb0029]/10">
                  <span className="font-mono text-[10px] font-black text-[#ff4d67]">TRX</span>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-white">TRON Mainnet</p>
                  <p className="mt-1 truncate text-[10px] text-[#7b879b]">TRC-20 security reporting</p>
                </div>
              </div>
            </div>
          </div>

          <div className="px-5 py-4 border-b border-[#1e2636]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-[#4a5568]" />
                <p className="text-[#4a5568] font-mono text-[10px] font-medium uppercase tracking-widest">Analysis Depth</p>
              </div>
              <div className="bg-[#0d1119] border border-[#1e2636] rounded px-2 py-0.5">
                <span className="text-[#f0b90b] font-mono font-semibold text-[11px]">Standard</span>
              </div>
            </div>
            <AnalysisSlider />
          </div>
          
          <div className="space-y-2.5 px-5 py-4">
            <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-[#7b879b]">Generate reports</p>
            
            {isDemoMode && (
              <input 
                type="text" 
                placeholder="Enter Wallet Address (Demo Mode)" 
                className="w-full h-10 px-3 bg-[#0d1119] border border-[#1e2636] rounded text-white text-xs mb-4"
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
              />
            )}

            <button 
              onClick={() => handleGenerateClick('TRON')}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#eb0029]/30 font-bold text-sm tracking-wide text-white transition-all duration-150 touch-manipulation bg-[#eb0029] hover:bg-[#ff3658] active:scale-[0.985] shadow-lg shadow-[#eb0029]/20"
            >
              <FileText className="h-4 w-4" />
              Generate Security Report · TRON
            </button>
            <button 
              onClick={() => handleGenerateClick('BNB')}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#f0b90b]/30 font-bold text-sm tracking-wide transition-all duration-150 touch-manipulation bg-[#f0b90b] hover:bg-[#f5c842] active:scale-[0.985] text-black shadow-lg shadow-[#f0b90b]/20"
            >
              <FileText className="h-4 w-4" />
              Generate Security Report · BNB
            </button>
          </div>
          
          <div className="flex items-center justify-between px-5 py-3 border-t border-[#1e2636] bg-[#0d1119]">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-[#2a3444]" />
              <span className="text-[#2a3444] text-[10px]">Non-custodial · Read-only</span>
            </div>
            <span className="text-[#2a3444] text-[10px] font-mono">BNB Smart Chain · TRON Mainnet</span>
          </div>
        </>
      )}

      {appState === 'ANALYZING' && (
        <ReportLoadingState network={selectedNetwork!} />
      )}

      {appState === 'REPORT' && (
        <SecurityReportPanel 
          network={selectedNetwork!} 
          reportData={reportData} 
          onReset={() => {
            setAppState('IDLE');
            setWalletAddress('');
            setReportData(null);
          }}
        />
      )}

      {appState === 'CONNECTING' && (
        <DemoWalletConnectModal 
          network={selectedNetwork!}
          onClose={() => setAppState('IDLE')}
          onConnect={handleWalletConnected}
        />
      )}
    </div>
  );
};

export default AuditorWidget;
