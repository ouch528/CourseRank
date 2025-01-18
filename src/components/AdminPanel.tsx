import React, { useState, useCallback } from 'react';
import { Upload, Check, AlertCircle, RefreshCw } from 'lucide-react';

interface AdminPanelProps {
  onUpdateData: (data: any[]) => void;
}

export function AdminPanel({ onUpdateData }: AdminPanelProps) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const validateCourseData = (data: any[]): { isValid: boolean; error?: string } => {
    if (!Array.isArray(data) || data.length === 0) {
      return { isValid: false, error: 'No valid data found in the CSV file' };
    }

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      if (!row.course_code || typeof row.course_code !== 'string') {
        return { isValid: false, error: `Invalid course code in row ${i + 1}` };
      }
      if (!row.course_class || typeof row.course_class !== 'string') {
        return { isValid: false, error: `Invalid class code in row ${i + 1}` };
      }
      
      // Validate rates if they exist
      const rates = ['Rd0_rate', 'Rd1_rate', 'Rd2_rate', 'Rd3_rate'];
      for (const rate of rates) {
        const rateValue = row[rate];
        if (rateValue !== undefined && rateValue !== null && rateValue !== '') {
          // Handle 'inf' string value
          if (rateValue === 'inf') {
            row[rate] = Infinity;
            continue;
          }
          const numRate = Number(rateValue);
          if (Number.isNaN(numRate)) {
            return { isValid: false, error: `Invalid rate value in ${rate} for row ${i + 1}` };
          }
        }
      }
    }

    return { isValid: true };
  };

  const processFileWithRetry = async (file: File, currentRetry = 0): Promise<void> => {
    try {
      setIsProcessing(true);
      const text = await file.text();
      const rows = text.split('\n');
      
      if (rows.length < 2) {
        throw new Error('CSV file is empty or contains only headers');
      }

      const headers = rows[0].split(',').map(header => header.trim());
      const requiredHeaders = ['course_code', 'course_class'];
      const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
      
      if (missingHeaders.length > 0) {
        throw new Error(`Missing required headers: ${missingHeaders.join(', ')}`);
      }

      // Check if at least one round header exists
      const roundHeaders = ['Rd0_rate', 'Rd1_rate', 'Rd2_rate', 'Rd3_rate'];
      const hasAnyRoundHeader = roundHeaders.some(header => headers.includes(header));
      if (!hasAnyRoundHeader) {
        throw new Error('CSV must contain at least one round data column (Rd0_rate, Rd1_rate, etc.)');
      }
      
      const data = rows.slice(1)
        .filter(row => row.trim())
        .map((row, index) => {
          const values = row.split(',');
          if (values.length !== headers.length) {
            throw new Error(`Row ${index + 2} has incorrect number of columns`);
          }

          const obj: any = {};
          headers.forEach((header, index) => {
            const cleanHeader = header.trim();
            const value = values[index]?.trim();
            
            if (cleanHeader === '' || cleanHeader.startsWith('Unnamed:')) return;
            
            if (cleanHeader === 'course_code' || cleanHeader === 'course_class') {
              obj[cleanHeader] = value || '';
            } else if (cleanHeader.endsWith('_TF')) {
              obj[cleanHeader] = value?.toLowerCase() === 'true';
            } else if (cleanHeader.endsWith('_rate')) {
              // Handle 'inf' string value
              if (value === 'inf') {
                obj[cleanHeader] = Infinity;
              } else {
                // Set rate to null if it's missing or empty
                obj[cleanHeader] = value ? Number(value) : null;
              }
              
              // If rate exists, also set corresponding TF value if not provided
              if (value) {
                const tfHeader = cleanHeader.replace('_rate', '_TF');
                if (obj[tfHeader] === undefined) {
                  obj[tfHeader] = value === 'inf' ? false : Number(value) <= 1;
                }
              }
            }
          });

          // Ensure all round fields exist, even if null
          roundHeaders.forEach(header => {
            if (obj[header] === undefined) {
              obj[header] = null;
            }
            const tfHeader = header.replace('_rate', '_TF');
            if (obj[tfHeader] === undefined) {
              obj[tfHeader] = null;
            }
          });

          return obj;
        });

      const validation = validateCourseData(data);
      if (!validation.isValid) {
        throw new Error(validation.error || 'Invalid course data format');
      }

      onUpdateData(data);
      setMessage({ type: 'success', text: 'Course data updated successfully!' });
      setRetryCount(0);
    } catch (error) {
      console.error('Error processing CSV:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (currentRetry < MAX_RETRIES) {
        setMessage({ 
          type: 'error', 
          text: `Error: ${errorMessage}. Retrying... Attempt ${currentRetry + 1} of ${MAX_RETRIES}` 
        });
        setRetryCount(currentRetry + 1);
        await new Promise(resolve => setTimeout(resolve, 1000));
        await processFileWithRetry(file, currentRetry + 1);
      } else {
        setMessage({ 
          type: 'error', 
          text: `Failed to process the file: ${errorMessage}. Please check the file format and try again.` 
        });
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setMessage({ type: 'error', text: 'Please upload a CSV file.' });
      return;
    }

    try {
      await processFileWithRetry(file);
      event.target.value = '';
    } catch (error) {
      console.error('Error in file upload:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setMessage({ 
        type: 'error', 
        text: `Error uploading file: ${errorMessage}. Please try again.` 
      });
    }
  }, [onUpdateData]);

  if (!isAdmin) {
    return (
      <button
        onClick={() => setIsAdmin(true)}
        className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Admin Login
      </button>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Admin Panel</h3>
        <button
          onClick={() => setIsAdmin(false)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Logout
        </button>
      </div>
      
      <div className="flex items-center justify-center w-full">
        <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 ${
          isProcessing ? 'opacity-50 cursor-not-allowed' : ''
        }`}>
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {isProcessing ? (
              <RefreshCw className="w-8 h-8 mb-3 text-gray-400 animate-spin" />
            ) : (
              <Upload className="w-8 h-8 mb-3 text-gray-400" />
            )}
            <p className="mb-2 text-sm text-gray-500">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">CSV file only</p>
          </div>
          <input
            type="file"
            className="hidden"
            accept=".csv"
            onChange={handleFileUpload}
            disabled={isProcessing}
          />
        </label>
      </div>

      {message && (
        <div className={`flex items-center p-4 rounded-md ${
          message.type === 'success' ? 'bg-green-50' : 'bg-red-50'
        }`}>
          {message.type === 'success' ? (
            <Check className="h-5 w-5 text-green-400 mr-3" />
          ) : (
            <AlertCircle className="h-5 w-5 text-red-400 mr-3" />
          )}
          <p className={`text-sm ${
            message.type === 'success' ? 'text-green-700' : 'text-red-700'
          }`}>
            {message.text}
          </p>
        </div>
      )}
    </div>
  );
}