import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { apiService } from '../services/api';

interface ApiStatusProps {
  className?: string;
}

const ApiStatus: React.FC<ApiStatusProps> = ({ className = '' }) => {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline' | 'error'>('checking');
  const [details, setDetails] = useState<any>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkApiStatus = async () => {
    setStatus('checking');
    try {
      const response = await apiService.healthCheck();
      if (response.data) {
        setStatus('online');
        setDetails(response.data);
      } else {
        setStatus('offline');
        setDetails({ error: response.error });
      }
    } catch (error) {
      setStatus('error');
      setDetails({ error: 'Failed to connect to API' });
    }
    setLastCheck(new Date());
  };

  useEffect(() => {
    checkApiStatus();
    const interval = setInterval(checkApiStatus, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />;
      case 'online':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'offline':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'checking':
        return 'Checking...';
      case 'online':
        return `Online (${details?.tracksLoaded || 0} tracks)`;
      case 'offline':
        return 'Offline';
      case 'error':
        return 'Connection Error';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'checking':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'online':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'offline':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'error':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    }
  };

  return (
    <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-sm ${getStatusColor()} ${className}`}>
      {getStatusIcon()}
      <span className="font-medium">{getStatusText()}</span>
      {lastCheck && (
        <span className="text-xs opacity-75">
          {lastCheck.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};

export default ApiStatus;