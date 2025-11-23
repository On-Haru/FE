import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { gsap } from 'gsap';
import { X } from 'lucide-react';
import type { MedicineItem } from '@/pages/MedicineDetail/types/prescription';

interface MedicineDetailModalProps {
  medicine: MedicineItem | null;
  onClose: () => void;
}

const MedicineDetailModal = ({ medicine, onClose }: MedicineDetailModalProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // 모달 등장/퇴장 애니메이션
  useEffect(() => {
    if (!medicine) return;

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
  }, [medicine]);

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

  if (!medicine) return null;

  const modalContent = (
    <div 
      ref={overlayRef}
      className="absolute inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-2xl w-[90%] max-w-md p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={handleClose}
          className="absolute cursor-pointer top-4 right-4 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 약품명 */}
        <h2 className="text-base font-semibold mb-4 pr-8">
          {medicine.name}
        </h2>

        {/* 내용 영역 */}
        <div>
          {medicine.aiDescription && (
            <div className="mb-4">
              <p className="text-base text-gray-600 whitespace-pre-wrap">
                {medicine.aiDescription}
              </p>
            </div>
          )}

          {medicine.memo && (
            <div>
              <p className="text-base text-gray-600 whitespace-pre-wrap">
                {medicine.memo}
              </p>
            </div>
          )}

          {!medicine.aiDescription && !medicine.memo && (
            <p className="text-base text-gray-500">등록된 정보가 없습니다.</p>
          )}
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

export default MedicineDetailModal;

