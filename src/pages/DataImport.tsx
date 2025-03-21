
import { useState } from 'react';
import { Upload, BarChart2, AlertCircle, Database, FileJson } from 'lucide-react';
import { toast } from 'sonner';

import PageContainer from '@/components/layout/PageContainer';
import FileUpload from '@/components/data/FileUpload';
import FraudChart from '@/components/dashboard/FraudChart';
import MetricsCards from '@/components/dashboard/MetricsCards';
import TransactionTable from '@/components/dashboard/TransactionTable';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { Transaction } from '@/types';
import { transformToTransactions, generateChartData, calculatePerformanceMetrics } from '@/utils/dataTransform';

const DataImport = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [jsonData, setJsonData] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('upload');
  
  const handleFileLoaded = (data: any) => {
    if (Array.isArray(data)) {
      const transformedData = transformToTransactions(data);
      setTransactions(transformedData);
      
      // Update JSON editor with the transformed data
      setJsonData(JSON.stringify(transformedData, null, 2));
      
      toast.success('Data loaded successfully', {
        description: `${transformedData.length} transactions processed.`
      });
    } else {
      toast.error('Invalid data format', {
        description: 'The data must be an array of transaction objects.'
      });
    }
  };
  
  const handleJsonSubmit = () => {
    try {
      const parsedData = JSON.parse(jsonData);
      
      if (Array.isArray(parsedData)) {
        const transformedData = transformToTransactions(parsedData);
        setTransactions(transformedData);
        
        toast.success('Data loaded successfully', {
          description: `${transformedData.length} transactions processed.`
        });
      } else {
        toast.error('Invalid data format', {
          description: 'The data must be an array of transaction objects.'
        });
      }
    } catch (error) {
      toast.error('Invalid JSON', {
        description: 'Please check your JSON syntax and try again.'
      });
    }
  };
  
  // Prepare chart data
  const channelChartData = generateChartData(transactions, 'channel');
  const paymentModeChartData = generateChartData(transactions, 'payment_mode');
  const timeSeriesChartData = generateChartData(transactions, 'time');
  
  // Calculate performance metrics
  const { matrix, metrics } = calculatePerformanceMetrics(transactions);
  
  // Calculate summary metrics
  const totalTransactions = transactions.length;
  const flaggedTransactions = transactions.filter(t => t.is_fraud_predicted).length;
  const fraudRatio = flaggedTransactions / totalTransactions || 0;
  const fraudTransactions = transactions.filter(t => t.is_fraud_predicted);
  const avgFraudAmount = fraudTransactions.reduce((sum, t) => sum + t.amount, 0) / fraudTransactions.length || 0;
  
  return (
    <PageContainer>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Upload className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-semibold">Data Import & Analysis</h1>
        </div>
        <p className="text-gray-500">
          Import transaction data from JSON or CSV files for fraud analysis and visualization.
        </p>
      </div>
      
      <Tabs 
        defaultValue="upload" 
        value={activeTab} 
        onValueChange={setActiveTab}
        className="mb-6"
      >
        <TabsList className="grid grid-cols-2 w-[400px]">
          <TabsTrigger value="upload">File Upload</TabsTrigger>
          <TabsTrigger value="json">JSON Editor</TabsTrigger>
        </TabsList>
        
        <TabsContent value="upload" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Upload Transaction Data
              </CardTitle>
              <CardDescription>
                Upload a JSON or CSV file containing transaction data for analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FileUpload onFileLoaded={handleFileLoaded} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="json" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileJson className="h-5 w-5" />
                JSON Data Editor
              </CardTitle>
              <CardDescription>
                Paste or edit JSON data directly in the editor below
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  value={jsonData}
                  onChange={(e) => setJsonData(e.target.value)}
                  placeholder='[{"transaction_id": "123", "amount": 1000, "is_fraud": false, ...}]'
                  className="min-h-[300px] font-mono text-sm"
                />
                <Button onClick={handleJsonSubmit}>Process Data</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {transactions.length > 0 ? (
        <>
          {/* Metrics cards */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Data Summary</h2>
            <MetricsCards
              totalTransactions={totalTransactions}
              flaggedTransactions={flaggedTransactions}
              fraudRatio={fraudRatio}
              avgFraudAmount={avgFraudAmount}
            />
          </div>
          
          {/* Transactions table */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-4">Imported Transactions</h2>
            <TransactionTable 
              transactions={transactions} 
              isLoading={false} 
            />
          </div>
          
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
              subtitle="Daily fraud patterns over time"
            />
            
            <FraudChart
              chartType="performance"
              chartData={{ labels: [], predicted: [], reported: [] }}
              confusionMatrix={matrix}
              metrics={metrics}
              title="Detection Performance"
              subtitle="Evaluation metrics for fraud detection"
            />
          </div>
        </>
      ) : (
        <div className="mt-10 text-center p-8 border border-dashed rounded-lg bg-gray-50">
          <AlertCircle className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-700 mb-2">No Data Imported</h3>
          <p className="text-sm text-gray-500 mb-4">
            Upload a file or paste JSON data to visualize and analyze fraud patterns.
          </p>
        </div>
      )}
    </PageContainer>
  );
};

export default DataImport;
