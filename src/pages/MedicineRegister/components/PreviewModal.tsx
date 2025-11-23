import { X } from 'lucide-react';
import type { OCRResponse } from '@/pages/MedicineRegister/services/ocr';

interface PreviewModalProps {
  file: File | null;
  ocrResult: OCRResponse | null;
  onRetake: () => void;
  onConfirm: () => void;
}

const PreviewModal = ({
  file,
  ocrResult,
  onRetake,
  onConfirm,
}: PreviewModalProps) => {
  if (!file || !ocrResult) return null;

  const imageUrl = URL.createObjectURL(file);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white w-[90%] max-w-md rounded-xl p-6 max-h-[90vh] overflow-y-auto relative">
        {/* 닫기 버튼 */}
        <button
          onClick={onRetake}
          className="absolute cursor-pointer top-4 right-4 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-bold mb-4 pr-8">처방전 미리보기</h2>

        {/* 촬영한 이미지 */}
        <div className="mb-4">
          <img
            src={imageUrl}
            alt="처방전"
            className="w-full rounded-lg border border-gray-200"
          />
        </div>

        {/* 약물 정보 인식 실패 시에만 표시 */}
        {(!ocrResult.medicines || ocrResult.medicines.length === 0) && (
          <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              약물 정보를 인식하지 못했습니다. 다시 촬영해주세요.
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <button
            onClick={onRetake}
            className="flex-1 py-2 rounded-xl border border-primary text-primary font-medium"
          >
            다시촬영
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 rounded-xl bg-primary text-white font-medium"
          >
            저장하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
