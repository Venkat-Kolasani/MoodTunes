import React, { useEffect, useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { apiService } from '../services/api';

interface ApiStatusProps {
  className?: string;
}

const ApiStatus: React.FC<ApiStatusProps> = ({ className = '' }) => {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline' | 'error'>('checking');
  const [details, setDetails] = useState<any>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [isFallback, setIsFallback] = useState(false);

  const checkApiStatus = async () => {
    setStatus('checking');
    try {
      console.log('🔍 Starting API health check...');
      const response = await apiService.healthCheck();
      console.log('📡 API health check response:', response);
      
      if (response.data) {
        console.log('✅ API response received:', response.data);
        setIsFallback(response.isFallback || false);
        
        if (response.isFallback) {
          setStatus('offline');
          setDetails({ 
            ...response.data, 
            mode: 'Offline Mode - Using Fallback Music Library' 
          });
        } else {
          setStatus('online');
          setDetails(response.data);
        }
      } else {
        console.log('❌ No data in API response:', response.error);
        setStatus('error');
        setDetails({ error: response.error });
        setIsFallback(false);
      }
    } catch (error) {
      console.log('💥 API health check failed with exception:', error);
      setStatus('error');
      setDetails({ error: 'Failed to connect to API' });
      setIsFallback(false);
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
        return <Wifi className="w-4 h-4 text-green-500" />;
      case 'offline':
        return isFallback ? <WifiOff className="w-4 h-4 text-orange-500" /> : <XCircle className="w-4 h-4 text-red-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'checking':
        return 'Checking...';
      case 'online':
        return `Online (${details?.tracksLoaded || 0} tracks)`;
      case 'offline':
        return isFallback ? `Offline (${details?.tracksLoaded || 0} fallback tracks)` : 'Offline';
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
        return isFallback ? 'text-orange-600 bg-orange-50 border-orange-200' : 'text-red-600 bg-red-50 border-red-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const getTooltipText = () => {
    if (isFallback) {
      return 'API unavailable - Using offline fallback music library';
    }
    if (status === 'online') {
      return 'Connected to MoodTunes API';
    }
    if (status === 'offline') {
      return 'API server is offline';
    }
    if (status === 'error') {
      return details?.error || 'Connection error';
    }
    return 'Checking connection...';
  };

  return (
    <div 
      className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full border text-sm ${getStatusColor()} ${className}`}
      title={getTooltipText()}
    >
      {getStatusIcon()}
      <span className="font-medium">{getStatusText()}</span>
      {isFallback && (
        <span className="text-xs bg-orange-200 text-orange-800 px-2 py-0.5 rounded-full">
          Offline
        </span>
      )}
      {lastCheck && (
        <span className="text-xs opacity-75">
          {lastCheck.toLocaleTimeString()}
        </span>
      )}
    </div>
  );
};

export default ApiStatus;