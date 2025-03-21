
import { useState, useEffect } from 'react';
import { BarChart2, Filter, Search } from 'lucide-react';
import { toast } from 'sonner';

import PageContainer from '@/components/layout/PageContainer';
import SearchBar from '@/components/dashboard/SearchBar';
import FilterSection from '@/components/dashboard/FilterSection';
import TransactionTable from '@/components/dashboard/TransactionTable';
import FraudChart from '@/components/dashboard/FraudChart';
import MetricsCards from '@/components/dashboard/MetricsCards';

import { Transaction, TransactionFilters, ChartData, ConfusionMatrix, PerformanceMetrics } from '@/types';

// Mock data (would normally come from API)
const generateMockTransactions = (count: number): Transaction[] => {
  const channels = ['Web', 'Mobile', 'In-person', 'API'];
  const paymentModes = ['Card', 'UPI', 'Bank Transfer', 'Wallet'];
  const gateways = ['PayPal', 'Stripe', 'Square', 'Adyen', 'Chase'];
  
  return Array.from({ length: count }, (_, i) => {
    const is_fraud_predicted = Math.random() < 0.15;
    // 80% chance the reported status matches the prediction
    const is_fraud_reported = Math.random() < 0.8 
      ? is_fraud_predicted 
      : !is_fraud_predicted;
    
    return {
      transaction_id: `TXN-${(100000 + i).toString().padStart(6, '0')}`,
      amount: Math.round(Math.random() * 9900 + 100), // $100 to $10,000
      timestamp: new Date(
        Date.now() - Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000
      ).toISOString(), // Last 30 days
      payer_id: `P-${Math.floor(Math.random() * 1000).toString().padStart(4, '0')}`,
      payee_id: `M-${Math.floor(Math.random() * 500).toString().padStart(4, '0')}`,
      channel: channels[Math.floor(Math.random() * channels.length)] as any,
      payment_mode: paymentModes[Math.floor(Math.random() * paymentModes.length)] as any,
      payment_gateway: gateways[Math.floor(Math.random() * gateways.length)],
      is_fraud_predicted,
      is_fraud_reported
    };
  });
};

// Generate chart data from transactions
const generateChartData = (transactions: Transaction[], groupBy: 'channel' | 'payment_mode' | 'payment_gateway' | 'time'): ChartData => {
  if (groupBy === 'time') {
    // Generate time series data
    const timeLabels: string[] = [];
    const timePredicted: number[] = [];
    const timeReported: number[] = [];
    
    // Group by date (last 14 days)
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateString = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      timeLabels.push(dateString);
      
      // Count transactions for this date
      const dayStart = new Date(date.setHours(0, 0, 0, 0)).toISOString();
      const dayEnd = new Date(date.setHours(23, 59, 59, 999)).toISOString();
      
      const dayTransactions = transactions.filter(t => 
        t.timestamp >= dayStart && t.timestamp <= dayEnd
      );
      
      timePredicted.push(dayTransactions.filter(t => t.is_fraud_predicted).length);
      timeReported.push(dayTransactions.filter(t => t.is_fraud_reported).length);
    }
    
    return {
      labels: timeLabels,
      predicted: timePredicted,
      reported: timeReported
    };
  }
  
  // Group by the specified field
  const groups: Record<string, { predicted: number; reported: number }> = {};
  
  transactions.forEach(transaction => {
    const key = transaction[groupBy] as string;
    if (!groups[key]) {
      groups[key] = { predicted: 0, reported: 0 };
    }
    
    if (transaction.is_fraud_predicted) {
      groups[key].predicted++;
    }
    
    if (transaction.is_fraud_reported) {
      groups[key].reported++;
    }
  });
  
  return {
    labels: Object.keys(groups),
    predicted: Object.values(groups).map(g => g.predicted),
    reported: Object.values(groups).map(g => g.reported)
  };
};

// Calculate performance metrics
const calculatePerformanceMetrics = (transactions: Transaction[]): { matrix: ConfusionMatrix; metrics: PerformanceMetrics } => {
  let truePositives = 0;
  let falsePositives = 0;
  let trueNegatives = 0;
  let falseNegatives = 0;
  
  transactions.forEach(transaction => {
    if (transaction.is_fraud_predicted && transaction.is_fraud_reported) {
      truePositives++;
    } else if (transaction.is_fraud_predicted && !transaction.is_fraud_reported) {
      falsePositives++;
    } else if (!transaction.is_fraud_predicted && !transaction.is_fraud_reported) {
      trueNegatives++;
    } else if (!transaction.is_fraud_predicted && transaction.is_fraud_reported) {
      falseNegatives++;
    }
  });
  
  const precision = truePositives / (truePositives + falsePositives) || 0;
  const recall = truePositives / (truePositives + falseNegatives) || 0;
  const f1Score = 2 * (precision * recall) / (precision + recall) || 0;
  const accuracy = (truePositives + trueNegatives) / transactions.length || 0;
  
  return {
    matrix: {
      truePositives,
      falsePositives,
      trueNegatives,
      falseNegatives
    },
    metrics: {
      precision,
      recall,
      f1Score,
      accuracy
    }
  };
};

const Dashboard = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TransactionFilters>({
    startDate: null,
    endDate: null,
    payerId: '',
    payeeId: '',
    searchQuery: '',
    fraudStatus: 'all'
  });
  
  // Load mock data
  useEffect(() => {
    const fetchData = async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        const mockData = generateMockTransactions(150);
        setTransactions(mockData);
        setFilteredTransactions(mockData);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        toast.error('Failed to load transaction data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Apply filters when they change
  useEffect(() => {
    let filtered = [...transactions];
    
    // Apply date filters
    if (filters.startDate) {
      filtered = filtered.filter(t => 
        new Date(t.timestamp) >= new Date(filters.startDate as Date)
      );
    }
    
    if (filters.endDate) {
      const endDate = new Date(filters.endDate as Date);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(t => 
        new Date(t.timestamp) <= endDate
      );
    }
    
    // Apply payer/payee filters
    if (filters.payerId) {
      filtered = filtered.filter(t => 
        t.payer_id.toLowerCase().includes(filters.payerId.toLowerCase())
      );
    }
    
    if (filters.payeeId) {
      filtered = filtered.filter(t => 
        t.payee_id.toLowerCase().includes(filters.payeeId.toLowerCase())
      );
    }
    
    // Apply search query
    if (filters.searchQuery) {
      filtered = filtered.filter(t => 
        t.transaction_id.toLowerCase().includes(filters.searchQuery.toLowerCase())
      );
    }
    
    // Apply fraud status filter
    if (filters.fraudStatus !== 'all') {
      switch (filters.fraudStatus) {
        case 'predicted':
          filtered = filtered.filter(t => t.is_fraud_predicted);
          break;
        case 'reported':
          filtered = filtered.filter(t => t.is_fraud_reported);
          break;
        case 'mismatch':
          filtered = filtered.filter(t => t.is_fraud_predicted !== t.is_fraud_reported);
          break;
      }
    }
    
    setFilteredTransactions(filtered);
  }, [filters, transactions]);
  
  // Handler for search changes
  const handleSearch = (query: string) => {
    setFilters(prev => ({ ...prev, searchQuery: query }));
  };
  
  // Handler for filter changes
  const handleFilterChange = (newFilters: TransactionFilters) => {
    setFilters(newFilters);
  };
  
  // Prepare chart data
  const channelChartData = generateChartData(filteredTransactions, 'channel');
  const paymentModeChartData = generateChartData(filteredTransactions, 'payment_mode');
  const timeSeriesChartData = generateChartData(filteredTransactions, 'time');
  
  // Calculate performance metrics
  const { matrix, metrics } = calculatePerformanceMetrics(filteredTransactions);
  
  // Calculate summary metrics
  const totalTransactions = filteredTransactions.length;
  const flaggedTransactions = filteredTransactions.filter(t => t.is_fraud_predicted).length;
  const fraudRatio = flaggedTransactions / totalTransactions || 0;
  const fraudTransactions = filteredTransactions.filter(t => t.is_fraud_predicted);
  const avgFraudAmount = fraudTransactions.reduce((sum, t) => sum + t.amount, 0) / fraudTransactions.length || 0;
  
  return (
    <PageContainer>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <BarChart2 className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-semibold">Fraud Monitoring Dashboard</h1>
        </div>
        <p className="text-gray-500">
          Monitor transactions, detect fraud patterns, and analyze detection performance.
        </p>
      </div>
      
      {/* Metrics cards */}
      <MetricsCards
        totalTransactions={totalTransactions}
        flaggedTransactions={flaggedTransactions}
        fraudRatio={fraudRatio}
        avgFraudAmount={avgFraudAmount}
      />
      
      {/* Search and filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="w-full md:w-1/3">
          <SearchBar 
            onSearch={handleSearch} 
            placeholder="Search by transaction ID..."
          />
        </div>
      </div>
      
      <FilterSection 
        filters={filters}
        onFilterChange={handleFilterChange}
      />
      
      {/* Transactions table */}
      <TransactionTable 
        transactions={filteredTransactions} 
        isLoading={loading} 
      />
      
      {/* Charts section */}
      <div className="mt-8 mb-4">
        <h2 className="text-xl font-semibold mb-6">Fraud Analysis</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <FraudChart
            chartType="channel"
            chartData={channelChartData}
            title="Fraud by Channel"
            subtitle="Comparison of predicted vs reported fraud by transaction channel"
          />
          
          <FraudChart
            chartType="payment"
            chartData={paymentModeChartData}
            title="Fraud by Payment Mode"
            subtitle="Comparison of predicted vs reported fraud by payment method"
          />
        </div>
        
        <FraudChart
          chartType="time"
          chartData={timeSeriesChartData}
          title="Fraud Trends Over Time"
          subtitle="Daily fraud patterns over the last 14 days"
        />
        
        <FraudChart
          chartType="performance"
          chartData={{ labels: [], predicted: [], reported: [] }}
          confusionMatrix={matrix}
          metrics={metrics}
          title="Detection Performance"
          subtitle="Evaluation metrics for the current fraud detection system"
        />
      </div>
    </PageContainer>
  );
};

export default Dashboard;
