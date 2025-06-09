import { useState, useCallback } from 'react';
import { ApiResponse } from '../services/api';

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>() {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (apiCall: () => Promise<ApiResponse<T>>) => {
    setState({ data: null, loading: true, error: null });

    try {
      const response = await apiCall();
      
      if (response.error) {
        setState({ data: null, loading: false, error: response.error });
      } else {
        setState({ data: response.data || null, loading: false, error: null });
      }
      
      return response;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setState({ data: null, loading: false, error: errorMessage });
      return { error: errorMessage, status: 0 };
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}