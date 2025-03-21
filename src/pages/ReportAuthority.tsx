
import { useState } from 'react';
import { Flag, Send } from 'lucide-react';
import { toast } from 'sonner';

import PageContainer from '@/components/layout/PageContainer';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

const ReportAuthority = () => {
  const [transactionId, setTransactionId] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!transactionId.trim()) {
      toast.error('Transaction ID is required');
      return;
    }
    
    if (!description.trim()) {
      toast.error('Please provide details about the suspicious activity');
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Simulate API request
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Success message
      toast.success('Report submitted successfully');
      
      // Clear form
      setTransactionId('');
      setDescription('');
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <PageContainer>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Flag className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-semibold">Report to Authority</h1>
        </div>
        <p className="text-gray-500">
          Report suspicious or fraudulent transactions to the appropriate authorities for investigation.
        </p>
      </div>
      
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Submit Fraud Report</CardTitle>
            <CardDescription>
              Provide details about the suspicious transaction that requires investigation.
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="transaction-id">Transaction ID</Label>
                <Input 
                  id="transaction-id"
                  placeholder="Enter the transaction ID (e.g., TXN-123456)"
                  value={transactionId}
                  onChange={(e) => setTransactionId(e.target.value)}
                  disabled={submitting}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Details of Suspicious Activity</Label>
                <Textarea 
                  id="description"
                  placeholder="Describe why you believe this transaction is suspicious or fraudulent..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={5}
                  disabled={submitting}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                type="submit" 
                disabled={submitting}
                className="w-full sm:w-auto"
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <div className="mt-8 bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-blue-800 mb-2">What happens next?</h3>
          <ul className="list-disc pl-5 space-y-2 text-blue-700">
            <li>Your report will be reviewed by our fraud investigation team.</li>
            <li>If necessary, the transaction will be flagged and may be temporarily suspended.</li>
            <li>Relevant authorities may be notified based on the severity of the case.</li>
            <li>You may be contacted for additional information if needed.</li>
          </ul>
        </div>
      </div>
    </PageContainer>
  );
};

export default ReportAuthority;
