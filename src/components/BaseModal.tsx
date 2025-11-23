import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';

interface BaseModalProps {
  /** 모달 열림 여부 */
  isOpen: boolean;
  /** 모달 닫기 핸들러 */
  onClose: () => void;
  /** 모달 내용 */
  children: ReactNode;
  /** 모달 최대 너비 (기본값: max-w-md) */
  maxWidth?: string;
  /** 모달 패딩 클래스 (기본값: p-6) */
  padding?: string;
  /** 모달 둥근 모서리 클래스 (기본값: rounded-xl) */
  rounded?: string;
}

const BaseModal = ({
  isOpen,
  onClose,
  children,
  maxWidth = 'max-w-md',
  padding = 'p-6',
  rounded = 'rounded-xl',
}: BaseModalProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const overlay = overlayRef.current;
    const modal = modalRef.current;

    if (!overlay || !modal) return;

    if (isOpen) {
      // 초기 상태 설정
      gsap.set(overlay, { opacity: 0 });
      gsap.set(modal, { scale: 0.8, opacity: 0, y: 20 });

      // 등장 애니메이션
      gsap.to(overlay, {
        opacity: 1,
        duration: 0.2,
        ease: 'power2.out',
      });

      gsap.to(modal, {
        scale: 1,
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: 'back.out(1.7)',
      });
    }

    return () => {
      gsap.killTweensOf([overlay, modal]);
    };
  }, [isOpen]);

  const handleClose = () => {
    const overlay = overlayRef.current;
    const modal = modalRef.current;

    if (!overlay || !modal) {
      onClose();
      return;
    }

    // 퇴장 애니메이션
    gsap.to(modal, {
      scale: 0.8,
      opacity: 0,
      y: 20,
      duration: 0.2,
      ease: 'power2.in',
    });

    gsap.to(overlay, {
      opacity: 0,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        onClose();
      },
    });
  };

  if (!isOpen) return null;

  const modalContent = (
    <div
      ref={overlayRef}
      className="absolute inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div
        ref={modalRef}
        className={`bg-white w-[90%] ${maxWidth} ${padding} ${rounded} relative`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );

  // mobile-content 요소 찾기
  const mobileContent = document.querySelector('.mobile-content');
  if (mobileContent) {
    return createPortal(modalContent, mobileContent);
  }

  return modalContent;
};

export default BaseModal;

