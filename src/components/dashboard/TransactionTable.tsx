
import { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  ArrowDownUp,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Transaction } from '@/types';
import { cn } from '@/lib/utils';

interface TransactionTableProps {
  transactions: Transaction[];
  isLoading?: boolean;
}

const TransactionTable = ({ 
  transactions, 
  isLoading = false 
}: TransactionTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof Transaction | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  const itemsPerPage = 10;
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  
  const handleSort = (field: keyof Transaction) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };
  
  const sortedTransactions = [...transactions].sort((a, b) => {
    if (!sortField) return 0;
    
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue) 
        : bValue.localeCompare(aValue);
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    }
    
    if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
      return sortDirection === 'asc' 
        ? (aValue ? 1 : 0) - (bValue ? 1 : 0)
        : (bValue ? 1 : 0) - (aValue ? 1 : 0);
    }
    
    return 0;
  });
  
  const paginatedTransactions = sortedTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  const renderSortIcon = (field: keyof Transaction) => {
    if (sortField !== field) return <ArrowDownUp className="w-3 h-3 ml-1 opacity-50" />;
    return sortDirection === 'asc' 
      ? <ArrowDownUp className="w-3 h-3 ml-1 text-blue-600" /> 
      : <ArrowDownUp className="w-3 h-3 ml-1 text-blue-600 rotate-180" />;
  };
  
  // Status indicators
  const FraudStatus = ({ predicted, reported }: { predicted: boolean, reported: boolean }) => {
    // Both true or both false = match
    const isMatch = predicted === reported;
    
    if (isMatch) {
      if (predicted) {
        // True positive - Predicted fraud, reported fraud
        return (
          <div className="flex items-center text-red-600 font-medium">
            <XCircle className="w-4 h-4 mr-1" />
            <span>Fraud</span>
          </div>
        );
      } else {
        // True negative - Not predicted, not reported
        return (
          <div className="flex items-center text-green-600 font-medium">
            <CheckCircle2 className="w-4 h-4 mr-1" />
            <span>Legitimate</span>
          </div>
        );
      }
    } else {
      // Mismatch
      return (
        <div className="flex items-center text-amber-500 font-medium">
          <AlertTriangle className="w-4 h-4 mr-1" />
          <span>Mismatch</span>
        </div>
      );
    }
  };
  
  // Loading skeleton
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl p-6 card-shadow overflow-hidden">
        <div className="space-y-4 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-2">
            {Array(5).fill(0).map((_, index) => (
              <div key={index} className="h-12 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Empty state
  if (transactions.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 card-shadow">
        <div className="text-center py-6">
          <Info className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No transactions found</h3>
          <p className="text-sm text-gray-500">Try adjusting your filters or search criteria.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl card-shadow overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleSort('transaction_id')}
              >
                <div className="flex items-center">
                  ID {renderSortIcon('transaction_id')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleSort('timestamp')}
              >
                <div className="flex items-center">
                  Date {renderSortIcon('timestamp')}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center">
                  Amount {renderSortIcon('amount')}
                </div>
              </TableHead>
              <TableHead>Payer / Payee</TableHead>
              <TableHead>Payment Details</TableHead>
              <TableHead className="text-right">
                <div className="flex items-center justify-end">
                  Status
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3.5 h-3.5 ml-1 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent className="w-60">
                        <p className="font-normal text-xs">
                          <span className="font-semibold">Fraud</span>: Both predicted and reported as fraud
                          <br />
                          <span className="font-semibold">Legitimate</span>: Neither predicted nor reported as fraud
                          <br />
                          <span className="font-semibold">Mismatch</span>: Prediction does not match reporting
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedTransactions.map((transaction) => (
              <TableRow 
                key={transaction.transaction_id}
                className={cn(
                  "hover:bg-gray-50 transition-colors",
                  transaction.is_fraud_predicted && transaction.is_fraud_reported ? "bg-red-50/50" : "",
                  transaction.is_fraud_predicted !== transaction.is_fraud_reported ? "bg-amber-50/50" : ""
                )}
              >
                <TableCell className="font-mono text-sm">
                  {transaction.transaction_id}
                </TableCell>
                <TableCell className="text-sm">
                  {formatTimestamp(transaction.timestamp)}
                </TableCell>
                <TableCell className="font-medium text-sm">
                  {formatCurrency(transaction.amount)}
                </TableCell>
                <TableCell className="text-sm">
                  <div className="text-xs text-gray-500">Payer</div>
                  <div className="font-medium">{transaction.payer_id}</div>
                  <div className="text-xs text-gray-500 mt-1">Payee</div>
                  <div className="font-medium">{transaction.payee_id}</div>
                </TableCell>
                <TableCell className="text-sm">
                  <div className="space-y-1">
                    <div>
                      <span className="text-xs text-gray-500">Channel:</span>{" "}
                      {transaction.channel}
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Method:</span>{" "}
                      {transaction.payment_mode}
                    </div>
                    <div>
                      <span className="text-xs text-gray-500">Gateway:</span>{" "}
                      {transaction.payment_gateway}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <FraudStatus 
                    predicted={transaction.is_fraud_predicted} 
                    reported={transaction.is_fraud_reported} 
                  />
                  <div className="flex flex-col items-end mt-1 text-xs">
                    <div className={transaction.is_fraud_predicted ? "text-red-500" : "text-green-500"}>
                      Predicted: {transaction.is_fraud_predicted ? "Fraud" : "Legitimate"}
                    </div>
                    <div className={transaction.is_fraud_reported ? "text-red-500" : "text-green-500"}>
                      Reported: {transaction.is_fraud_reported ? "Fraud" : "Legitimate"}
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t">
          <div className="text-sm text-gray-500">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, transactions.length)} of {transactions.length} transactions
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TransactionTable;
