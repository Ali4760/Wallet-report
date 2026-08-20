export interface SecurityReport {
  id: string;
  score: number;
  scoreLabel: string;
  balance: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  threatsFound: number;
  checksPassed: number;
  totalChecks: number;
  timestamp: string;
  address: string;
  network: 'BNB' | 'TRON';
  checks: {
    label: string;
    passed: boolean;
  }[];
}

export const mockReportService = {
  generateReport(address: string, network: 'BNB' | 'TRON', customBalance?: string): SecurityReport {
    // Generate deterministic mock data based on address length or first char to simulate variety
    const isHighRisk = address.toLowerCase().includes('bad') || address.startsWith('0x9');
    
    const score = isHighRisk ? 35 : 100;
    const scoreLabel = isHighRisk ? 'Critical Risk' : 'Excellent';
    const riskLevel = isHighRisk ? 'HIGH' : 'LOW';
    const threatsFound = isHighRisk ? 2 : 0;
    const checksPassed = isHighRisk ? 2 : 4;
    
    // Generate a deterministic random-looking ID
    const reportId = `SR-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
    
    const balance = customBalance || (isHighRisk ? '0.00 USDT' : 'Verified on-chain');
    
    return {
      id: reportId,
      score,
      scoreLabel,
      balance,
      riskLevel,
      threatsFound,
      checksPassed,
      totalChecks: 4,
      timestamp: new Date().toISOString(),
      address: address || '0xDEMO000000000000000000000000000000000001',
      network,
      checks: [
        { label: 'Smart Contract Verified', passed: true },
        { label: 'No Suspicious Activity', passed: !isHighRisk },
        { label: 'Valid Token Signatures', passed: true },
        { label: 'Clean Transaction History', passed: !isHighRisk },
      ]
    };
  }
};
