
import { Transaction, ChartData, ConfusionMatrix, PerformanceMetrics } from '@/types';

// Transform imported data into the application's transaction format
export const transformToTransactions = (data: any[]): Transaction[] => {
  try {
    return data.map((item: any) => {
      // Default values to ensure type safety
      const defaultTransaction: Transaction = {
        transaction_id: `TXN-${Math.random().toString(36).substr(2, 9)}`,
        amount: 0,
        timestamp: new Date().toISOString(),
        payer_id: 'unknown',
        payee_id: 'unknown',
        channel: 'Web',
        payment_mode: 'Card',
        payment_gateway: 'Unknown',
        is_fraud_predicted: false,
        is_fraud_reported: false
      };

      // Map the incoming data to our transaction format, handling different property names
      return {
        ...defaultTransaction,
        transaction_id: item.transaction_id || item.id || item.txn_id || defaultTransaction.transaction_id,
        amount: parseFloat(item.amount || item.transaction_amount || 0),
        timestamp: item.timestamp || item.date || item.transaction_date || defaultTransaction.timestamp,
        payer_id: item.payer_id || item.sender_id || item.from || defaultTransaction.payer_id,
        payee_id: item.payee_id || item.receiver_id || item.to || defaultTransaction.payee_id,
        channel: mapChannel(item.channel || item.transaction_channel),
        payment_mode: mapPaymentMode(item.payment_mode || item.payment_method || item.method),
        payment_gateway: item.payment_gateway || item.gateway || item.processor || defaultTransaction.payment_gateway,
        is_fraud_predicted: Boolean(item.is_fraud || item.is_fraud_predicted || item.fraud_predicted || item.isFraud),
        is_fraud_reported: Boolean(item.is_fraud_reported || item.fraud_reported || item.reported_fraud)
      };
    });
  } catch (error) {
    console.error("Error transforming data:", error);
    return [];
  }
};

// Map various channel names to our standard channels
const mapChannel = (channel?: string): Transaction['channel'] => {
  if (!channel) return 'Web';
  
  const channelLower = channel.toLowerCase();
  
  if (channelLower.includes('web') || channelLower.includes('online')) {
    return 'Web';
  } else if (channelLower.includes('mobile') || channelLower.includes('app')) {
    return 'Mobile';
  } else if (channelLower.includes('person') || channelLower.includes('pos') || channelLower.includes('terminal')) {
    return 'In-person';
  } else if (channelLower.includes('api') || channelLower.includes('service')) {
    return 'API';
  }
  
  return 'Web';
};

// Map various payment method names to our standard payment modes
const mapPaymentMode = (mode?: string): Transaction['payment_mode'] => {
  if (!mode) return 'Card';
  
  const modeLower = mode.toLowerCase();
  
  if (modeLower.includes('card') || modeLower.includes('credit') || modeLower.includes('debit')) {
    return 'Card';
  } else if (modeLower.includes('upi') || modeLower.includes('instant')) {
    return 'UPI';
  } else if (modeLower.includes('bank') || modeLower.includes('transfer') || modeLower.includes('wire')) {
    return 'Bank Transfer';
  } else if (modeLower.includes('wallet') || modeLower.includes('paypal') || modeLower.includes('venmo')) {
    return 'Wallet';
  }
  
  return 'Card';
};

// Generate chart data from transactions
export const generateChartData = (transactions: Transaction[], groupBy: 'channel' | 'payment_mode' | 'payment_gateway' | 'time'): ChartData => {
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
export const calculatePerformanceMetrics = (transactions: Transaction[]): { matrix: ConfusionMatrix; metrics: PerformanceMetrics } => {
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
