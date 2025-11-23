import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { CheckCircle2, X, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
  onRetry?: () => void;
}

const Toast = ({ message, type = 'success', duration = 3000, onClose, onRetry }: ToastProps) => {
  const toastRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const toast = toastRef.current;
    if (!toast) return;

    // 등장 애니메이션
    gsap.fromTo(
      toast,
      { opacity: 0, y: -20, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.3,
        ease: 'back.out(1.7)',
      }
    );

    // 자동 닫기 (에러 타입이거나 재시도 버튼이 있으면 자동 닫기 안 함)
    if (type !== 'error' && !onRetry) {
      const timer = setTimeout(() => {
        gsap.to(toast, {
          opacity: 0,
          y: -20,
          scale: 0.9,
          duration: 0.2,
          ease: 'power2.in',
          onComplete: onClose,
        });
      }, duration);

      return () => {
        clearTimeout(timer);
        gsap.killTweensOf(toast);
      };
    }

    return () => {
      gsap.killTweensOf(toast);
    };
  }, [duration, onClose, type, onRetry]);

  const handleClose = () => {
    const toast = toastRef.current;
    if (!toast) {
      onClose();
      return;
    }

    gsap.to(toast, {
      opacity: 0,
      y: -20,
      scale: 0.9,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: onClose,
    });
  };

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />;
      default:
        return <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'error':
        return 'border-red-200';
      case 'info':
        return 'border-blue-200';
      default:
        return 'border-gray-200';
    }
  };

  return (
    <div
      ref={toastRef}
      className={`absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-white rounded-xl shadow-lg border ${getBorderColor()} px-4 py-3 flex items-center gap-3 min-w-[200px] max-w-[90%]`}
    >
      {getIcon()}
      <span className="text-sm font-medium text-gray-900 flex-1">{message}</span>
      {onRetry && (
        <button
          onClick={() => {
            onRetry();
            handleClose();
          }}
          className="px-3 py-1 text-xs font-medium text-primary border border-primary rounded-lg hover:bg-primary/10 transition-colors flex-shrink-0"
        >
          다시 시도
        </button>
      )}
      <button
        onClick={handleClose}
        className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
        aria-label="닫기"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;

