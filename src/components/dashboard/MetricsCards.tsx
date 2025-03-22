
import { Activity, AlertTriangle, DollarSign, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricsCardsProps {
  totalTransactions: number;
  flaggedTransactions: number;
  fraudRatio: number;
  avgFraudAmount: number;
  className?: string;
}

const MetricsCards = ({
  totalTransactions,
  flaggedTransactions,
  fraudRatio,
  avgFraudAmount,
  className
}: MetricsCardsProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Recalculate the metrics to ensure they're correct
  const actualFlaggedCount = flaggedTransactions;
  const actualFraudRatio = totalTransactions > 0 ? (actualFlaggedCount / totalTransactions) : 0;

  const metrics = [
    {
      title: 'Total Transactions',
      value: totalTransactions.toLocaleString(),
      icon: Activity,
      color: 'bg-blue-50 text-blue-600',
      trend: '+5.2% from last month',
      trendUp: true
    },
    {
      title: 'Flagged as Fraud',
      value: actualFlaggedCount.toLocaleString(),
      icon: AlertTriangle,
      color: 'bg-red-50 text-red-600',
      trend: '+2.1% from last month',
      trendUp: false
    },
    {
      title: 'Fraud Ratio',
      value: formatPercent(actualFraudRatio),
      icon: TrendingUp,
      color: 'bg-amber-50 text-amber-600',
      trend: '-0.3% from last month',
      trendUp: true
    },
    {
      title: 'Avg. Fraud Amount',
      value: formatCurrency(avgFraudAmount),
      icon: DollarSign,
      color: 'bg-green-50 text-green-600',
      trend: '+12.3% from last month',
      trendUp: false
    }
  ];

  return (
    <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6", className)}>
      {metrics.map((metric, index) => (
        <div 
          key={index}
          className="bg-white rounded-xl card-shadow p-6 animate-fade-in-up"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex justify-between items-start mb-4">
            <div className={cn("p-2 rounded-lg", metric.color)}>
              <metric.icon className="w-5 h-5" />
            </div>
            <span 
              className={cn(
                "text-xs font-medium rounded-full px-2 py-0.5 flex items-center", 
                metric.trendUp ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
              )}
            >
              {metric.trend}
            </span>
          </div>
          <h3 className="text-sm font-medium text-gray-500">{metric.title}</h3>
          <p className="text-2xl font-semibold mt-1">{metric.value}</p>
        </div>
      ))}
    </div>
  );
};

export default MetricsCards;
