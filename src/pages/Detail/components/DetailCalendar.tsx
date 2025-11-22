import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { DateChecklist } from '@/types/checklist';
import CalendarDateCell from './CalendarDateCell';

interface DetailCalendarProps {
    checklistData: Record<string, DateChecklist>;
    selectedDate: Date | null;
    onDateSelect: (date: Date | null) => void;
    currentMonth: Date;
    onMonthChange: (month: Date) => void;
    isLoading?: boolean;
}

const DetailCalendar = ({
    checklistData,
    selectedDate,
    onDateSelect,
    currentMonth: propCurrentMonth,
    onMonthChange,
    isLoading
}: DetailCalendarProps) => {
    const [currentMonth, setCurrentMonth] = useState(propCurrentMonth);

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // 해당 월의 첫 번째 날의 요일 계산 (0 = 일요일, 1 = 월요일 등)
    const firstDayOfWeek = getDay(monthStart);

    // 첫 번째 주를 채우기 위한 이전 달의 날짜들 가져오기
    const previousMonthDays: Date[] = [];
    if (firstDayOfWeek > 0) {
        const prevMonthEnd = endOfMonth(subMonths(currentMonth, 1));
        for (let i = firstDayOfWeek - 1; i >= 0; i--) {
            previousMonthDays.push(new Date(prevMonthEnd.getFullYear(), prevMonthEnd.getMonth(), prevMonthEnd.getDate() - i));
        }
    }

    // 마지막 주를 채우기 위한 다음 달의 날짜들 가져오기
    const totalCells = previousMonthDays.length + daysInMonth.length;
    const remainingCells = 42 - totalCells; // 6주 * 7일 = 42
    const nextMonthDays: Date[] = [];
    if (remainingCells > 0) {
        const nextMonthStart = addMonths(currentMonth, 1);
        for (let i = 1; i <= remainingCells; i++) {
            nextMonthDays.push(new Date(nextMonthStart.getFullYear(), nextMonthStart.getMonth(), i));
        }
    }

    // prop으로 받은 currentMonth가 변경되면 내부 state도 업데이트
    useEffect(() => {
        if (propCurrentMonth.getTime() !== currentMonth.getTime()) {
            setCurrentMonth(propCurrentMonth);
        }
    }, [propCurrentMonth]);

    const handlePreviousMonth = () => {
        const newMonth = subMonths(currentMonth, 1);
        setCurrentMonth(newMonth);
        onMonthChange(newMonth);
    };

    const handleNextMonth = () => {
        const newMonth = addMonths(currentMonth, 1);
        setCurrentMonth(newMonth);
        onMonthChange(newMonth);
    };

    const handleDateClick = (date: Date) => {
        onDateSelect(date);
    };

    const weekDays = ['일', '월', '화', '수', '목', '금', '토'];

    return (
        <div className="w-full border rounded-xl p-4 pb-10 border-[#E4E4E7] shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10 rounded-xl">
                    <div className="text-gray-500">로딩 중...</div>
                </div>
            )}
            {/* 월 네비게이션 */}
            <div className="flex items-center justify-between mb-4">
                <button
                    onClick={handlePreviousMonth}
                    className="flex items-center justify-center w-8 h-8 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
                    aria-label="이전 달"
                >
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <h2 className="text-lg font-semibold">
                    {format(currentMonth, 'yyyy년 M월')}
                </h2>
                <button
                    onClick={handleNextMonth}
                    className="flex items-center justify-center w-8 h-8 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
                    aria-label="다음 달"
                >
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
            </div>

            {/* 요일 레이블 */}
            <div className="grid grid-cols-7 gap-1 mb-2">
                {weekDays.map((day) => (
                    <div
                        key={day}
                        className={`text-center text-sm font-regularpy-1 ${day === '일' ? 'text-[#FF6363]' : 'text-[#71717A]'
                            }`}
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* 캘린더 그리드 */}
            <div className="grid grid-cols-7 gap-3 place-items-center">
                {/* 이전 달 날짜들 */}
                {previousMonthDays.map((date) => (
                    <CalendarDateCell
                        key={`prev-${date.getTime()}`}
                        date={date}
                        checklistData={checklistData}
                        isDisabled={true}
                    />
                ))}

                {/* 현재 달 날짜들 */}
                {daysInMonth.map((date) => {
                    const dateKey = format(date, 'yyyy-MM-dd');
                    const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
                    const hasChecklist = !!checklistData[dateKey];

                    return (
                        <CalendarDateCell
                            key={dateKey}
                            date={date}
                            checklistData={checklistData}
                            isSelected={isSelected}
                            hasChecklist={hasChecklist}
                            onClick={() => handleDateClick(date)}
                        />
                    );
                })}

                {/* 다음 달 날짜들 */}
                {nextMonthDays.map((date) => (
                    <CalendarDateCell
                        key={`next-${date.getTime()}`}
                        date={date}
                        checklistData={checklistData}
                        isDisabled={true}
                    />
                ))}
            </div>
        </div>
    );
};

export default DetailCalendar;

