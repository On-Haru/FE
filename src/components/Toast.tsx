import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { CheckCircle2, X } from 'lucide-react';

export interface ToastProps {
  message: string;
  duration?: number;
  onClose: () => void;
}

const Toast = ({ message, duration = 3000, onClose }: ToastProps) => {
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

    // 자동 닫기
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
  }, [duration, onClose]);

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

  return (
    <div
      ref={toastRef}
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-white rounded-xl shadow-lg border border-gray-200 px-4 py-3 flex items-center gap-3 min-w-[200px] max-w-[90%]"
    >
      <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
      <span className="text-sm font-medium text-gray-900 flex-1">{message}</span>
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

