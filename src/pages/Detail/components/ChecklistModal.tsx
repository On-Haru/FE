import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { format, parse } from 'date-fns';
import type { ChecklistItem } from '@/types/checklist';

interface ChecklistModalProps {
    isOpen: boolean;
    onClose: () => void;
    date: string;
    item: ChecklistItem;
    elderName: string;
}

const ChecklistModal = ({ isOpen, onClose, date, item, elderName }: ChecklistModalProps) => {
    const parsedDate = parse(date, 'yyyy-MM-dd', new Date());
    const dateLabel = format(parsedDate, 'M월 d일');

    // 약 이름 추출 (예: "아침약 : 타이레놀, 타이레놀" -> "타이레놀")
    const medicineName = item.label.split(':')[1]?.trim().split(',')[0] || '약';

    // 식사 시간 추출 (예: "아침약" -> "아침")
    const mealTime = item.label.split('약')[0] || '';

    const handleSendNotification = () => {
        // TODO: 알림 보내기 API 호출
        console.log('알림 보내기:', date, item.id);
        onClose();
    };

    if (!isOpen) return null;

    const modalContent = (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div
                className="bg-white rounded-2xl w-[90%] max-w-md p-6 relative"
                onClick={(e) => e.stopPropagation()}
            >
                {/* 닫기 버튼 */}
                <button
                    onClick={onClose}
                    className="absolute cursor-pointer top-4 right-4 text-gray-600 hover:text-gray-800 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* 제목 */}
                <h2 className="text-base font-semibold mb-4 pr-8">
                    {elderName} 님께 알림을 보내시겠습니까?
                </h2>

                {/* 약 정보 박스 */}
                <div className="bg-primary/10 border border-primary/30 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-700">{dateLabel} 12:30</p>
                        <span className="text-sm text-primary">{mealTime}</span>
                    </div>
                    <p className="text-base font-medium text-gray-900">{medicineName}</p>
                </div>

                {/* 버튼들 */}
                <div className="flex gap-3">
                    {item.checked ? (
                        <button
                            className="flex-1 px-4 py-2 bg-gray-200 text-gray-600 rounded-xl font-medium cursor-not-allowed"
                            disabled
                        >
                            이미 체크되었습니다
                        </button>
                    ) : (
                        <button
                            onClick={handleSendNotification}
                            className="flex-1 px-4 py-2 bg-secondary text-white rounded-xl font-medium hover:bg-secondary/80 cursor-pointer transition-colors"
                        >
                            알림 보내기
                        </button>
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

export default ChecklistModal;

