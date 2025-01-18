import { useState, useCallback } from 'react';

interface ErrorState {
  message: string;
  code?: string;
  retry?: () => Promise<void>;
}

export function useErrorHandler() {
  const [error, setError] = useState<ErrorState | null>(null);

  const handleError = useCallback((error: unknown, retryFn?: () => Promise<void>) => {
    console.error('Error caught by handler:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Failed to fetch')) {
        setError({
          message: 'Network connection error. Please check your connection and try again.',
          code: 'NETWORK_ERROR',
          retry: retryFn
        });
      } else {
        setError({
          message: error.message,
          retry: retryFn
        });
      }
    } else {
      setError({
        message: 'An unexpected error occurred. Please try again.',
        retry: retryFn
      });
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const retryOperation = useCallback(async () => {
    if (error?.retry) {
      clearError();
      try {
        await error.retry();
      } catch (e) {
        handleError(e);
      }
    }
  }, [error, clearError]);

  return {
    error,
    handleError,
    clearError,
    retryOperation
  };
}