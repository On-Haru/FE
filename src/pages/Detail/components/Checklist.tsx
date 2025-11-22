import { useState } from 'react';
import type { ChecklistItem } from '@/types/checklist';
import { format, parse } from 'date-fns';
import { Check } from 'lucide-react';
import ChecklistModal from './ChecklistModal';
import { updateTakenStatus } from '../services/takingLog';


interface ChecklistProps {
    date: string;
    items: ChecklistItem[];
    elderName: string;
    userId: number;
}

const Checklist = ({ date, items, elderName, userId }: ChecklistProps) => {
    const [selectedItem, setSelectedItem] = useState<ChecklistItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const parsedDate = parse(date, 'yyyy-MM-dd', new Date());
    const dayLabel = `${format(parsedDate, 'd')}일`;

    const handleItemClick = async (item: ChecklistItem) => {
        // API 호출하여 복용 여부 업데이트
        const extendedItem = item as ChecklistItem & {
            scheduleId?: number;
            scheduledDateTime?: string;
        };

        if (extendedItem.scheduleId && extendedItem.scheduledDateTime) {
            try {
                await updateTakenStatus({
                    scheduleId: extendedItem.scheduleId,
                    scheduledDateTime: extendedItem.scheduledDateTime,
                    taken: !item.checked, // 토글
                });
                // 성공 시 UI 업데이트는 부모 컴포넌트에서 처리
            } catch (error) {
                console.error('복용 여부 업데이트 실패:', error);
                alert('복용 여부 업데이트에 실패했습니다.');
            }
        }

        setSelectedItem(item);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedItem(null);
    };


    return (
        <>
            <div className="mt-4">
                <h3 className="text-base font-semibold mb-3 text-primary">{dayLabel}</h3>
                <div className="space-y-3">
                    {items.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => handleItemClick(item)}
                            className="flex items-center gap-3 cursor-pointer"
                        >
                            <div className={`relative flex items-center justify-center w-5 h-5 rounded border-1 transition-colors ${item.checked
                                ? 'bg-primary border-primary'
                                : 'bg-transparent border-gray-300'
                                }`}
                            >
                                {item.checked && (
                                    <Check className="w-4 h-4 text-white" />
                                )}
                            </div>
                            <span className={`text-base ${item.checked ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
            {selectedItem && (
                <ChecklistModal
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    date={date}
                    item={selectedItem}
                    elderName={elderName}
                    userId={userId}
                />
            )}
        </>
    );
};

export default Checklist;

