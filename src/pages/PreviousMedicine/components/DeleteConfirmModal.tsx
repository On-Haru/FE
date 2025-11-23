import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';

interface DeleteConfirmModalProps {
  /** 모달 열림 여부 */
  isOpen: boolean;
  /** 처방전 병원명 */
  hospitalName: string;
  /** 확인 버튼 클릭 핸들러 */
  onConfirm: () => void;
  /** 취소 버튼 클릭 핸들러 */
  onCancel: () => void;
}

const DeleteConfirmModal = ({
  isOpen,
  hospitalName,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const overlay = overlayRef.current;
    const modal = modalRef.current;

    if (!overlay || !modal) return;

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

    return () => {
      gsap.killTweensOf([overlay, modal]);
    };
  }, [isOpen]);

  const handleClose = () => {
    const overlay = overlayRef.current;
    const modal = modalRef.current;

    if (!overlay || !modal) {
      onCancel();
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
        onCancel();
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
        className="bg-white rounded-xl w-[90%] max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 제목 */}
        <h2 className="text-xl font-bold text-gray-900 mb-4">처방전 삭제</h2>

        {/* 메시지 */}
        <p className="text-base text-gray-700 mb-6">
          정말로 <span className="font-semibold">"{hospitalName}"</span> 처방전을 삭제하시겠습니까?
          <br />
          삭제된 처방전은 복구할 수 없습니다.
        </p>

        {/* 버튼들 */}
        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="cursor-pointer flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
          >
            취소
          </button>
          <button
            onClick={() => {
              onConfirm();
              handleClose();
            }}
            className="cursor-pointer flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
          >
            삭제
          </button>
        </div>
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

export default DeleteConfirmModal;

