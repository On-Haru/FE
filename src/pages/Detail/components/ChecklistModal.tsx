import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { format, parse } from 'date-fns';
import type { ChecklistItem } from '@/types/checklist';
import TimeTag, { type TimeLabel } from '@/components/TimeTag';
import { sendNotification } from '../services/push';

interface ChecklistModalProps {
    isOpen: boolean;
    onClose: () => void;
    date: string;
    item: ChecklistItem & {
        scheduleId?: number;
        scheduledDateTime?: string;
        takenDateTime?: string | null;
        delayMinutes?: number | null;
    };
    elderName: string;
    userId: number;
}

const ChecklistModal = ({ isOpen, onClose, date, item, elderName, userId }: ChecklistModalProps) => {
    const [isSending, setIsSending] = useState(false);
    const parsedDate = parse(date, 'yyyy-MM-dd', new Date());
    const dateLabel = format(parsedDate, 'M월 d일');

    // 약 이름 추출 (예: "아침약 : 타이레놀, 타이레놀" -> "타이레놀")
    const medicineName = item.label.split(':')[1]?.trim().split(',')[0] || '약';

    // 식사 시간 추출 (예: "아침약" -> "아침")
    const mealTime = item.label.split('약')[0] || '';

    // 예정 시간 파싱
    const scheduledTime = item.scheduledDateTime
        ? format(parse(item.scheduledDateTime, "yyyy-MM-dd'T'HH:mm:ss", new Date()), 'HH:mm')
        : '12:30';

    // 복약 시간 파싱
    const takenTime = item.takenDateTime
        ? format(parse(item.takenDateTime, "yyyy-MM-dd'T'HH:mm:ss", new Date()), 'HH:mm')
        : null;

    // 딜레이 시간 포맷팅
    const delayText = item.delayMinutes !== null && item.delayMinutes !== undefined
        ? item.delayMinutes > 0
            ? `${item.delayMinutes}분 지연`
            : item.delayMinutes === 0
                ? '정시 복용'
                : `${Math.abs(item.delayMinutes)}분 일찍`
        : null;

    const handleSendNotification = async () => {
        setIsSending(true);
        try {
            // 알림 제목과 본문 생성
            const title = `${mealTime} 복약 알림`;
            const body = `${medicineName} 복용 시간입니다.`;

            await sendNotification(userId, {
                scheduleId: item.scheduleId,
                title,
                body,
            });

            alert('알림이 전송되었습니다.');
            onClose();
        } catch (error) {
            alert('알림 전송에 실패했습니다. 잠시 후 다시 시도해주세요.');
        } finally {
            setIsSending(false);
        }
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
                    {item.checked
                        ? `${elderName} 님의 복약 정보`
                        : `${elderName} 님께 알림을 보내시겠습니까?`
                    }
                </h2>

                {/* 약 정보 박스 */}
                <div className="bg-primary/5 border border-primary/30 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-gray-700">{dateLabel} {scheduledTime}</p>
                        {mealTime === '아침' || mealTime === '점심' || mealTime === '저녁' ? (
                            <TimeTag label={mealTime as TimeLabel} />
                        ) : (
                            <span className="text-sm text-primary">{mealTime}</span>
                        )}
                    </div>
                    <p className="text-base font-medium text-gray-900 mb-3">{medicineName}</p>

                    {/* 복약 정보 (복약한 경우에만 표시) */}
                    {item.checked && (
                        <div className="mt-3 pt-3 border-t border-primary/20">
                            {takenTime && (
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600">복약 시간:</span>
                                    <span className="text-sm font-medium text-gray-900">{takenTime}</span>
                                </div>
                            )}
                            {delayText !== null && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">지연 시간:</span>
                                    <span className={`text-sm font-medium ${item.delayMinutes !== null && item.delayMinutes !== undefined
                                        ? item.delayMinutes > 0
                                            ? 'text-red-500'
                                            : item.delayMinutes === 0
                                                ? 'text-green-500'
                                                : 'text-blue-500'
                                        : 'text-gray-500'
                                        }`}>
                                        {delayText || '정보 없음'}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
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
                            disabled={isSending}
                            className={`flex-1 px-4 py-2 bg-secondary text-white rounded-xl font-medium transition-colors ${isSending
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:bg-secondary/80 cursor-pointer'
                                }`}
                        >
                            {isSending ? '전송 중...' : '알림 보내기'}
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

