import React from 'react';
import SidebarInfo from '../components/SidebarInfo';
import AuditorWidget from '../components/AuditorWidget';

const Dashboard: React.FC = () => {
  return (
    <div className="min-h-[100svh] overflow-x-hidden px-3 py-5 sm:px-6 sm:py-8 crypto-bg">
      <div className="crypto-grid"></div>
      <div className="crypto-accent-tl"></div>
      <div className="crypto-accent-br"></div>
      
      <div className="crypto-content mx-auto grid w-full max-w-6xl min-w-0 gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,430px)] lg:items-start">
        <SidebarInfo />
        <AuditorWidget />
      </div>
      
      <p className="crypto-content text-center text-[#2a3444] text-[10px] mt-4 font-mono tracking-wide">
        MetaMask · Trust Wallet · Binance Wallet · WalletConnect
      </p>
    </div>
  );
};

export default Dashboard;
