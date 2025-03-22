
import { useState, useEffect } from 'react';
import { Settings, Save, HelpCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const ApiSettings = () => {
  const [apiUrl, setApiUrl] = useState(localStorage.getItem('fraudApiUrl') || 'http://localhost:5000');
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("settings");

  const saveSettings = () => {
    localStorage.setItem('fraudApiUrl', apiUrl);
    window.dispatchEvent(new Event('storage')); // Trigger storage event for other components to react
    toast.success('API settings saved', { 
      description: 'The application will now use the new API URL.' 
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Settings className="h-4 w-4" />
          <span>ML API Settings</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>ML Model API Settings</DialogTitle>
          <DialogDescription>
            Configure the connection to your external ML model API (e.g., from Google Colab)
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="guide">Google Colab Guide</TabsTrigger>
          </TabsList>
          
          <TabsContent value="settings" className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="api-url" className="text-sm font-medium">
                ML API URL
              </label>
              <Input
                id="api-url"
                placeholder="https://your-ngrok-url.ngrok.io"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
              />
              <p className="text-xs text-gray-500">
                For Google Colab, use your ngrok URL (see Guide tab)
              </p>
            </div>
            <div className="flex justify-end">
              <Button onClick={saveSettings} className="gap-2">
                <Save className="h-4 w-4" />
                Save Settings
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="guide" className="py-4">
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Setting up a Google Colab API endpoint</h3>
              
              <ol className="space-y-2 text-sm text-gray-500 list-decimal ml-5">
                <li>In your Google Colab notebook, add the following code to a new cell:</li>
                <div className="bg-slate-100 p-2 rounded text-xs overflow-auto max-h-60 mt-2">
                  <pre>{`# Install required packages
!pip install flask flask-cors pyngrok

# Import necessary libraries
from flask import Flask, request, jsonify
from flask_cors import CORS
from pyngrok import ngrok
import pandas as pd

# Create a Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/predict', methods=['POST'])
def predict():
    data = request.json
    transactions = data.get('transactions', [])
    
    # Convert to DataFrame for your model
    df = pd.DataFrame(transactions)
    
    # TODO: Use your trained model to predict fraud
    # For now, mark exactly 11 transactions as fraud
    df['amount'] = pd.to_numeric(df['amount'])
    df = df.sort_values('amount', ascending=False)
    fraud_ids = set(df.head(11)['transaction_id'].tolist())
    
    result = {
        'predictions': [
            {
                'transaction_id': t['transaction_id'],
                'is_fraud_predicted': t['transaction_id'] in fraud_ids,
                'fraud_score': 0.9 if t['transaction_id'] in fraud_ids else 0.2
            }
            for t in transactions
        ],
        'total_fraud_count': len(fraud_ids),
        'model_version': 'colab-model-v1.0',
        'timestamp': pd.Timestamp.now().isoformat()
    }
    
    return jsonify(result)

# Start ngrok
public_url = ngrok.connect(5000)
print(f' * ngrok tunnel available at: {public_url}')

# Run the Flask app
app.run(port=5000)`}</pre>
                </div>
                <li>Run the cell in your Colab notebook</li>
                <li>Copy the ngrok URL that appears (should look like https://something.ngrok.io)</li>
                <li>Paste it in the API URL field in the Settings tab and save</li>
              </ol>
              
              <div className="bg-amber-50 border border-amber-200 rounded p-3 text-sm text-amber-800">
                <p><strong>Note:</strong> The ngrok URL will change every time you restart your Colab notebook. 
                Always update the API URL after restarting your notebook.</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter className="sm:justify-start">
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <HelpCircle className="h-3 w-3" />
            <span>Your model must return exactly 11 fraud cases as per your training model</span>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ApiSettings;
