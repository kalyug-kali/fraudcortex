
// Transaction types
export interface Transaction {
  transaction_id: string;
  amount: number;
  timestamp: string;
  payer_id: string;
  payee_id: string;
  channel: 'Web' | 'Mobile' | 'In-person' | 'API';
  payment_mode: 'Card' | 'UPI' | 'Bank Transfer' | 'Wallet';
  payment_gateway: string;
  is_fraud_predicted: boolean;
  is_fraud_reported: boolean;
}

// Rule types
export interface Rule {
  id: string;
  name: string;
  description: string;
  type: string;
  value: number | string;
  enabled: boolean;
}

// Filter types
export interface TransactionFilters {
  startDate: Date | null;
  endDate: Date | null;
  payerId: string;
  payeeId: string;
  searchQuery: string;
  fraudStatus: 'all' | 'predicted' | 'reported' | 'mismatch';
}

// Chart data types
export interface ChartData {
  labels: string[];
  predicted: number[];
  reported: number[];
}

// Performance metrics
export interface PerformanceMetrics {
  precision: number;
  recall: number;
  f1Score: number;
  accuracy: number;
}

// Confusion matrix
export interface ConfusionMatrix {
  truePositives: number;
  falsePositives: number;
  trueNegatives: number;
  falseNegatives: number;
}
