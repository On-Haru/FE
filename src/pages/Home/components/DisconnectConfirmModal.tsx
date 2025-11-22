import { createPortal } from 'react-dom';

interface DisconnectConfirmModalProps {
  /** 모달 열림 여부 */
  isOpen: boolean;
  /** 피보호자 이름 */
  recipientName: string;
  /** 확인 버튼 클릭 핸들러 */
  onConfirm: () => void;
  /** 취소 버튼 클릭 핸들러 */
  onCancel: () => void;
}

const DisconnectConfirmModal = ({
  isOpen,
  recipientName,
  onConfirm,
  onCancel,
}: DisconnectConfirmModalProps) => {
  if (!isOpen) return null;

  const modalContent = (
    <div
      className="absolute inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-xl w-[90%] max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 제목 */}
        <h2 className="text-xl font-bold text-gray-900 mb-4">연결 해제하기</h2>

        {/* 메시지 */}
        <p className="text-base text-gray-700 mb-6">
          {recipientName}님과의 연결을 해제하시겠습니까?
          <br />
          연결 해제 후에는 복용 기록을 확인할 수 없습니다.
        </p>

        {/* 버튼들 */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
          >
            취소
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
          >
            연결 해제
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

export default DisconnectConfirmModal;
