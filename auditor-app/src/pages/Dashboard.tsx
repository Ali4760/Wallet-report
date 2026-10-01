import React, { useState } from 'react';
import SidebarInfo from '../components/SidebarInfo';
import AuditorWidget from '../components/AuditorWidget';

const Dashboard: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState<'BNB' | 'TRON' | null>(null);

  return (
    <div className="min-h-[100svh] overflow-x-hidden px-3 py-5 sm:px-6 sm:py-8 crypto-bg">
      <div className="crypto-grid"></div>
      <div className="crypto-accent-tl"></div>
      <div className="crypto-accent-br"></div>
      
      <div className="crypto-content mx-auto grid w-full max-w-6xl min-w-0 gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,430px)] lg:items-start">
        <SidebarInfo />
        <div className="flex flex-col gap-5">
          <AuditorWidget 
            walletAddress={walletAddress}
            setWalletAddress={setWalletAddress}
            selectedNetwork={selectedNetwork}
            setSelectedNetwork={setSelectedNetwork}
          />
        </div>
      </div>
      
      <p className="crypto-content text-center text-[#2a3444] text-[10px] mt-4 font-mono tracking-wide">
        MetaMask · Trust Wallet · Binance Wallet · WalletConnect
      </p>
    </div>
  );
};

export default Dashboard;
