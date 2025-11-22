import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import DetailPageHeader from './components/DetailPageHeader';
import DetailCalendar from './components/DetailCalendar';
import Checklist from './components/Checklist';
import EmptyDateActions from './components/EmptyDateActions';
import type { DateChecklist } from '@/types/checklist';

interface Elder {
    id: string;
    name: string;
}

const DetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const [currentElder, setCurrentElder] = useState<Elder | null>(null);
    const [elders, setElders] = useState<Elder[]>([]);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [isDateClicked, setIsDateClicked] = useState<boolean>(false);
    const [checklistData, setChecklistData] = useState<Record<string, DateChecklist>>({});

    // 각 어르신별 임시 체크리스트 데이터 (나중에 API로 교체)
    const getElderChecklistData = (elderId: string): Record<string, DateChecklist> => {
        // 어르신별로 다른 데이터를 반환
        const baseData: Record<string, DateChecklist> = {
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
        };

        // 어르신 ID에 따라 약 이름이나 체크 상태를 다르게 설정
        if (elderId === '2') {
            // 이노인: 다른 약 이름 사용
            return Object.fromEntries(
                Object.entries(baseData).map(([date, data]) => [
                    date,
                    {
                        ...data,
                        items: data.items.map((item) => ({
                            ...item,
                            label: item.label.replace('타이레놀', '아스피린'),
                        })),
                    },
                ])
            );
        } else if (elderId === '3') {
            // 박노인: 다른 약 이름과 체크 상태
            return Object.fromEntries(
                Object.entries(baseData).map(([date, data]) => [
                    date,
                    {
                        ...data,
                        items: data.items.map((item) => ({
                            ...item,
                            label: item.label.replace('타이레놀', '게보린'),
                            checked: Math.random() > 0.5, // 랜덤 체크 상태
                        })),
                    },
                ])
            );
        }

        // 김노인 (기본)
        return baseData;
    };

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

    // 어르신이 변경되면 해당 어르신의 체크리스트 데이터 로드
    useEffect(() => {
        if (currentElder) {
            const data = getElderChecklistData(currentElder.id);
            setChecklistData(data);
            // 날짜 선택 초기화
            setSelectedDate(new Date());
            setIsDateClicked(false);
        }
    }, [currentElder]);

    const handleElderChange = (elderId: string) => {
        const elder = elders.find((e) => e.id === elderId);
        if (elder) {
            setCurrentElder(elder);
        }
    };

    const handleDateSelect = (date: Date | null) => {
        if (date) {
            setSelectedDate(date);
            setIsDateClicked(true);
        }
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
        <div className="flex flex-col min-h-full relative">
            <DetailPageHeader
                currentElder={currentElder}
                elders={elders}
                onElderChange={handleElderChange}
            />
            <div className="flex-1 overflow-y-auto py-3">
                <DetailCalendar
                    checklistData={checklistData}
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelect}
                />
                {getSelectedDateChecklist() ? (
                    <div className="mt-4 px-4">
                        <Checklist
                            date={getSelectedDateChecklist()!.date}
                            items={getSelectedDateChecklist()!.items}
                            elderName={currentElder.name}
                        />
                    </div>
                ) : isDateClicked ? (
                    <EmptyDateActions
                        date={selectedDate}
                        elderName={currentElder.name}
                        isDateClicked={isDateClicked}
                    />
                ) : null}
            </div>
        </div>
    );
};

export default DetailPage;