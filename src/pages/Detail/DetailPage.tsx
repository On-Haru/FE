import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import DetailPageHeader from './components/DetailPageHeader';
import DetailCalendar from './components/DetailCalendar';
import Checklist from './components/Checklist';
import type { DateChecklist } from '@/types/checklist';

interface Elder {
    id: string;
    name: string;
}

const DetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const [currentElder, setCurrentElder] = useState<Elder | null>(null);
    const [elders, setElders] = useState<Elder[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    // 임시 체크리스트 데이터 (나중에 API로 교체)
    const [checklistData] = useState<Record<string, DateChecklist>>({
        '2025-11-30': {
            date: '2025-11-30',
            items: [
                { id: '1', label: '아침약 : 타이레놀, 타이레놀', checked: true },
                { id: '2', label: '점심약 : 타이레놀, 타이레놀', checked: true },
                { id: '3', label: '저녁약 : 타이레놀, 타이레놀', checked: true },
            ],
        },
        '2025-11-29': {
            date: '2025-11-29',
            items: [
                { id: '1', label: '아침약 : 타이레놀, 타이레놀', checked: true },
                { id: '2', label: '점심약 : 타이레놀, 타이레놀', checked: true },
                { id: '3', label: '저녁약 : 타이레놀, 타이레놀', checked: false },
            ],
        },
        '2025-11-28': {
            date: '2025-11-28',
            items: [
                { id: '1', label: '아침약 : 타이레놀, 타이레놀', checked: true },
                { id: '2', label: '점심약 : 타이레놀, 타이레놀', checked: false },
                { id: '3', label: '저녁약 : 타이레놀, 타이레놀', checked: false },
            ],
        },
        '2025-11-27': {
            date: '2025-11-27',
            items: [
                { id: '1', label: '아침약 : 타이레놀, 타이레놀', checked: false },
                { id: '2', label: '점심약 : 타이레놀, 타이레놀', checked: false },
                { id: '3', label: '저녁약 : 타이레놀, 타이레놀', checked: false },
            ],
        },
        '2025-11-26': {
            date: '2025-11-26',
            items: [
                { id: '1', label: '아침약 : 타이레놀, 타이레놀', checked: true },
                { id: '2', label: '점심약 : 타이레놀, 타이레놀', checked: true },
                { id: '3', label: '저녁약 : 타이레놀, 타이레놀', checked: true },
            ],
        },
        '2025-11-25': {
            date: '2025-11-25',
            items: [
                { id: '1', label: '아침약 : 타이레놀, 타이레놀', checked: true },
                { id: '2', label: '점심약 : 타이레놀, 타이레놀', checked: true },
                { id: '3', label: '저녁약 : 타이레놀, 타이레놀', checked: false },
            ],
        },
        '2025-11-24': {
            date: '2025-11-24',
            items: [
                { id: '1', label: '아침약 : 타이레놀, 타이레놀', checked: true },
                { id: '2', label: '점심약 : 타이레놀, 타이레놀', checked: false },
                { id: '3', label: '저녁약 : 타이레놀, 타이레놀', checked: false },
            ],
        },
        '2025-11-23': {
            date: '2025-11-23',
            items: [
                { id: '1', label: '아침약 : 타이레놀, 타이레놀', checked: true },
                { id: '2', label: '점심약 : 타이레놀, 타이레놀', checked: true },
                { id: '3', label: '저녁약 : 타이레놀, 타이레놀', checked: true },
            ],
        },
        '2025-11-22': {
            date: '2025-11-22',
            items: [
                { id: '1', label: '아침약 : 타이레놀, 타이레놀', checked: true },
                { id: '2', label: '점심약 : 타이레놀, 타이레놀', checked: true },
                { id: '3', label: '저녁약 : 타이레놀, 타이레놀', checked: true },
            ],
        },
        '2025-11-21': {
            date: '2025-11-21',
            items: [
                { id: '1', label: '아침약 : 타이레놀, 타이레놀', checked: true },
                { id: '2', label: '점심약 : 타이레놀, 타이레놀', checked: false },
                { id: '3', label: '저녁약 : 타이레놀, 타이레놀', checked: false },
            ],
        },
        '2025-11-20': {
            date: '2025-11-20',
            items: [
                { id: '1', label: '아침약 : 타이레놀, 타이레놀', checked: true },
                { id: '2', label: '점심약 : 타이레놀, 타이레놀', checked: true },
                { id: '3', label: '저녁약 : 타이레놀, 타이레놀', checked: true },
            ],
        },
    });

    // TODO: API에서 어르신 목록 가져오기
    useEffect(() => {
        // 임시 데이터 (나중에 API로 교체)
        const mockElders: Elder[] = [
            { id: '1', name: '김노인' },
            { id: '2', name: '이노인' },
            { id: '3', name: '박노인' },
        ];
        setElders(mockElders);

        // 현재 선택된 어르신 찾기
        const elder = mockElders.find((e) => e.id === id) || mockElders[0];
        setCurrentElder(elder);
    }, [id]);

    const handleElderChange = (elderId: string) => {
        const elder = elders.find((e) => e.id === elderId);
        if (elder) {
            setCurrentElder(elder);
        }
    };

    const handleDateSelect = (date: Date | null) => {
        setSelectedDate(date);
    };

    // 선택된 날짜의 체크리스트 가져오기
    const getSelectedDateChecklist = (): DateChecklist | null => {
        if (!selectedDate) return null;
        const dateKey = format(selectedDate, 'yyyy-MM-dd');
        return checklistData[dateKey] || null;
    };

    if (!currentElder) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex flex-col min-h-full">
            <DetailPageHeader
                currentElder={currentElder}
                elders={elders}
                onElderChange={handleElderChange}
            />
            <div className="flex-1 overflow-y-auto py-6">
                <DetailCalendar
                    checklistData={checklistData}
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelect}
                />
                {selectedDate && getSelectedDateChecklist() && (
                    <div className="mt-6 border-t border-gray-200">
                        <Checklist
                            date={getSelectedDateChecklist()!.date}
                            items={getSelectedDateChecklist()!.items}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default DetailPage;