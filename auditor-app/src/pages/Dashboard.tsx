import React, { useState, useEffect } from 'react';
import SidebarInfo from '../components/SidebarInfo';
import AuditorWidget from '../components/AuditorWidget';
import TokenAllowancePanel from '../components/TokenAllowancePanel';

const Dashboard: React.FC = () => {
  const [walletAddress, setWalletAddress] = useState('');
  const [selectedNetwork, setSelectedNetwork] = useState<'BNB' | 'TRON' | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);

  // Monitor accounts/chain changes for EVM
  useEffect(() => {
    if (window.ethereum) {
      const handleChainChanged = (hexId: string) => {
        setChainId(parseInt(hexId, 16));
      };
      const handleAccountsChanged = (accounts: string[]) => {
        setWalletAddress(accounts[0] || '');
      };
      
      // Initial checks if already connected
      window.ethereum.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0]);
          window.ethereum.request({ method: 'eth_chainId' }).then((hexId: string) => {
            setChainId(parseInt(hexId, 16));
          });
        }
      });

      window.ethereum.on('chainChanged', handleChainChanged);
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      return () => {
        window.ethereum.removeListener('chainChanged', handleChainChanged);
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);

  const connectWallet = async () => {
    // Default to BNB connection check, fall back to TRON if selected
    const networkToConnect = selectedNetwork || 'BNB';
    if (networkToConnect === 'BNB') {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          if (accounts && accounts.length > 0) {
            setWalletAddress(accounts[0]);
            const hexId = await window.ethereum.request({ method: 'eth_chainId' });
            setChainId(parseInt(hexId, 16));
            setSelectedNetwork('BNB');
          }
        } catch (err) {
          console.error("MetaMask connection failed:", err);
        }
      } else {
        alert("Please install MetaMask to connect BNB Smart Chain.");
      }
    } else if (networkToConnect === 'TRON') {
      if (typeof window.tronWeb !== 'undefined' || typeof window.tronLink !== 'undefined') {
        try {
          const tronLink = window.tronLink || (window as any).tron;
          if (tronLink) {
            const res = await tronLink.request({ method: 'tron_requestAccounts' });
            if (res && res.code === 200 && window.tronWeb && window.tronWeb.defaultAddress) {
              setWalletAddress(window.tronWeb.defaultAddress.base58);
              setSelectedNetwork('TRON');
            }
          }
        } catch (err) {
          console.error("TronLink connection failed:", err);
        }
      } else {
        alert("Please install TronLink to connect TRON Mainnet.");
      }
    }
  };

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
          <TokenAllowancePanel 
            owner={walletAddress}
            network={selectedNetwork}
            chainId={chainId}
            onConnect={connectWallet}
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
