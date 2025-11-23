import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import type { ChecklistItem } from '@/types/checklist';
import { format, parse } from 'date-fns';
import { Check } from 'lucide-react';
import ChecklistModal from './ChecklistModal';


interface ChecklistProps {
    date: string;
    items: ChecklistItem[];
    elderName: string;
    userId: number;
}

const Checklist = ({ date, items, elderName, userId }: ChecklistProps) => {
    const [selectedItem, setSelectedItem] = useState<ChecklistItem | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const itemsRef = useRef<(HTMLDivElement | null)[]>([]);

    const parsedDate = parse(date, 'yyyy-MM-dd', new Date());
    const dayLabel = `${format(parsedDate, 'd')}일`;

    // 아이템 등장 애니메이션
    useEffect(() => {
        itemsRef.current.forEach((item, index) => {
            if (!item) return;
            
            // 초기 상태 설정
            gsap.set(item, { opacity: 0, y: 20 });

            // 스태거 효과로 순차 등장
            gsap.to(item, {
                opacity: 1,
                y: 0,
                duration: 0.4,
                delay: index * 0.1,
                ease: 'power2.out',
            });
        });
    }, [items]);

    const handleItemClick = (item: ChecklistItem) => {
        // 보호자 페이지에서는 체크 불가, 모달만 열기
        // 체크는 어르신만 할 수 있음
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
                    {items.map((item, index) => (
                        <div
                            key={item.id}
                            ref={(el) => {
                                itemsRef.current[index] = el;
                            }}
                            onClick={() => handleItemClick(item)}
                            className="flex items-center gap-3 cursor-pointer"
                        >
                            <div
                                className={`relative flex items-center justify-center w-5 h-5 rounded border-1 transition-colors ${item.checked
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

