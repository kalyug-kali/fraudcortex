
import { useState } from 'react';
import { Upload, FileUp, AlertCircle, Check } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface FileUploadProps {
  onFileLoaded: (data: any) => void;
  acceptedTypes?: string;
}

const FileUpload = ({ onFileLoaded, acceptedTypes = ".json,.csv" }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const parseFile = (file: File) => {
    const reader = new FileReader();
    
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(progress);
      }
    };
    
    reader.onload = (e) => {
      try {
        const fileContent = e.target?.result as string;
        let parsedData;
        
        if (file.name.endsWith('.json')) {
          parsedData = JSON.parse(fileContent);
        } else if (file.name.endsWith('.csv')) {
          // Simple CSV parser (could be replaced with a more robust solution)
          const lines = fileContent.split('\n');
          const headers = lines[0].split(',').map(h => h.trim());
          parsedData = lines.slice(1).map(line => {
            const values = line.split(',').map(v => v.trim());
            return headers.reduce((obj, header, index) => {
              obj[header] = values[index];
              return obj;
            }, {} as Record<string, string>);
          });
        } else {
          throw new Error('Unsupported file format');
        }
        
        onFileLoaded(parsedData);
        setFileName(file.name);
        setError(null);
        setIsUploading(false);
        toast.success('File uploaded successfully', {
          description: `${file.name} has been processed.`
        });
      } catch (err) {
        setError('Failed to parse file. Please check the file format and try again.');
        setIsUploading(false);
        toast.error('Failed to parse file', {
          description: 'Please check the file format and try again.'
        });
      }
    };
    
    reader.onerror = () => {
      setError('Error reading file. Please try again.');
      setIsUploading(false);
      toast.error('Error reading file', {
        description: 'Please try again.'
      });
    };
    
    if (file.name.endsWith('.json')) {
      reader.readAsText(file);
    } else if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      setError(`Unsupported file format. Please upload ${acceptedTypes} files.`);
      setIsUploading(false);
      toast.error('Unsupported file format', {
        description: `Please upload ${acceptedTypes} files.`
      });
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files.length) {
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);
      const file = e.dataTransfer.files[0];
      parseFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setIsUploading(true);
      setUploadProgress(0);
      setError(null);
      const file = e.target.files[0];
      parseFile(file);
    }
  };

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : error
            ? 'border-red-200 bg-red-50'
            : fileName
            ? 'border-green-200 bg-green-50'
            : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {isUploading ? (
          <div className="w-full space-y-4">
            <FileUp className="h-12 w-12 text-blue-500 mx-auto" />
            <div className="text-lg font-medium">Uploading...</div>
            <Progress value={uploadProgress} className="h-2 w-full" />
          </div>
        ) : error ? (
          <div className="space-y-4">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
            <div className="text-lg font-medium text-red-600">Error</div>
            <p className="text-red-500">{error}</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setError(null);
                setFileName(null);
              }}
            >
              Try Again
            </Button>
          </div>
        ) : fileName ? (
          <div className="space-y-4">
            <Check className="h-12 w-12 text-green-500 mx-auto" />
            <div className="text-lg font-medium text-green-600">File Uploaded</div>
            <p>{fileName}</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setFileName(null);
              }}
            >
              Upload Another File
            </Button>
          </div>
        ) : (
          <>
            <Upload className="h-12 w-12 text-blue-500 mx-auto" />
            <div className="mt-4 mb-2 text-lg font-medium">
              Drag & drop your file here
            </div>
            <p className="text-gray-500 mb-6">
              or click to browse from your computer
            </p>
            <div className="flex gap-4">
              <Button 
                variant="default"
                onClick={() => document.getElementById('file-upload')?.click()}
                className="cursor-pointer"
              >
                <FileUp className="mr-2 h-4 w-4" />
                Browse Files
              </Button>
            </div>
            <input
              id="file-upload"
              type="file"
              accept={acceptedTypes}
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="mt-4 text-xs text-gray-500">
              Supported file types: JSON, CSV
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
