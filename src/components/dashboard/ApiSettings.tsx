
import { useState, useEffect } from 'react';
import { Settings, Save } from 'lucide-react';
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
} from "@/components/ui/dialog";

const ApiSettings = () => {
  const [apiUrl, setApiUrl] = useState(localStorage.getItem('fraudApiUrl') || 'http://localhost:5000');
  const [open, setOpen] = useState(false);

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>ML Model API Settings</DialogTitle>
          <DialogDescription>
            Configure the connection to your external ML model API (e.g., from Google Colab)
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label htmlFor="api-url" className="text-sm font-medium">
              ML API URL
            </label>
            <Input
              id="api-url"
              placeholder="http://localhost:5000"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
            />
            <p className="text-xs text-gray-500">
              For Google Colab, you can use ngrok to expose your notebook API
            </p>
          </div>
          <div className="flex justify-end">
            <Button onClick={saveSettings} className="gap-2">
              <Save className="h-4 w-4" />
              Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ApiSettings;
