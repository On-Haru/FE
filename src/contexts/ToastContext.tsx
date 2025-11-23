import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import Toast, { type ToastType } from '@/components/Toast';

interface ToastConfig {
  message: string;
  type?: ToastType;
  duration?: number;
  onRetry?: () => void;
}

interface ToastContextType {
  showToast: (message: string, duration?: number) => void;
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, onRetry?: () => void) => void;
  showInfo: (message: string, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
  const [toast, setToast] = useState<ToastConfig | null>(null);

  const showToast = useCallback((message: string, duration?: number) => {
    setToast({ message, type: 'success', duration });
  }, []);

  const showSuccess = useCallback((message: string, duration?: number) => {
    setToast({ message, type: 'success', duration });
  }, []);

  const showError = useCallback((message: string, onRetry?: () => void) => {
    setToast({ message, type: 'error', onRetry });
  }, []);

  const showInfo = useCallback((message: string, duration?: number) => {
    setToast({ message, type: 'info', duration });
  }, []);

  const handleClose = useCallback(() => {
    setToast(null);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showInfo }}>
      {children}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onRetry={toast.onRetry}
          onClose={handleClose}
        />
      )}
    </ToastContext.Provider>
  );
};

