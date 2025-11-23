import { X } from 'lucide-react';
import BaseModal from '@/components/BaseModal';
import type { MedicineItem } from '@/pages/MedicineDetail/types/prescription';

interface MedicineDetailModalProps {
  medicine: MedicineItem | null;
  onClose: () => void;
}

const MedicineDetailModal = ({ medicine, onClose }: MedicineDetailModalProps) => {
  if (!medicine) return null;

  return (
    <BaseModal isOpen={!!medicine} onClose={onClose} rounded="rounded-2xl">
      {/* 닫기 버튼 */}
      <button
        onClick={onClose}
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
    </BaseModal>
  );
};

export default MedicineDetailModal;

