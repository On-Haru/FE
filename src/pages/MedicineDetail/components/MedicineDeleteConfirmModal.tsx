import BaseModal from '@/components/BaseModal';

interface MedicineDeleteConfirmModalProps {
  isOpen: boolean;
  medicineName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const MedicineDeleteConfirmModal = ({
  isOpen,
  medicineName,
  onConfirm,
  onCancel,
}: MedicineDeleteConfirmModalProps) => {
  const handleConfirm = () => {
    onConfirm();
    onCancel();
  };

  return (
    <BaseModal isOpen={isOpen} onClose={onCancel}>
      {/* 제목 */}
      <h2 className="text-xl font-bold text-gray-900 mb-4">약 삭제</h2>

      {/* 메시지 */}
      <p className="text-base text-gray-700 mb-6">
        <span className="font-semibold">"{medicineName}"</span> 약을 삭제하시겠습니까?
      </p>

      {/* 버튼들 */}
      <div className="flex gap-3">
        <button
          onClick={onCancel}
          className="cursor-pointer flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
        >
          취소
        </button>
        <button
          onClick={handleConfirm}
          className="cursor-pointer flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
        >
          삭제
        </button>
      </div>
    </BaseModal>
  );
};

export default MedicineDeleteConfirmModal;

