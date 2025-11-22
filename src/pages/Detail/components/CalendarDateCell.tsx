import { memo, useMemo } from 'react';
import { format } from 'date-fns';
import type { DateChecklist } from '@/types/checklist';
import OverlappingCircles from './OverlappingCircles';

interface CalendarDateCellProps {
    date: Date;
    checklistData: Record<string, DateChecklist>;
    isSelected?: boolean;
    isDisabled?: boolean;
    hasChecklist?: boolean;
    onClick?: () => void;
}

const CalendarDateCell = memo(({
    date,
    checklistData,
    isSelected = false,
    isDisabled = false,
    hasChecklist = false,
    onClick,
}: CalendarDateCellProps) => {
    // 날짜 키를 메모이제이션
    const dateKey = useMemo(() => format(date, 'yyyy-MM-dd'), [date]);

    // 완료율 계산을 메모이제이션
    const filledCount = useMemo(() => {
        const checklist = checklistData[dateKey];
        if (!checklist || checklist.items.length === 0) return 0;

        const checkedCount = checklist.items.filter(item => item.checked).length;
        const percentage = (checkedCount / checklist.items.length) * 100;

        // 완료율에 따라 틸 색상 원의 개수 결정
        if (percentage === 0) return 0;
        if (percentage <= 50) return 1;
        if (percentage < 100) return 2;
        return 3;
    }, [checklistData, dateKey]);

    // 클래스명을 메모이제이션
    const className = useMemo(() => {
        const baseClasses = 'relative w-8 h-8 flex items-center justify-center text-sm rounded transition-transform';
        if (isDisabled) {
            return `${baseClasses} text-gray-400 cursor-default`;
        }
        if (isSelected) {
            return `${baseClasses} text-gray-900 font-semibold cursor-pointer`;
        }
        return `${baseClasses} hover:scale-120 text-gray-900 cursor-pointer`;
    }, [isDisabled, isSelected, hasChecklist]);

    // 날짜 숫자를 메모이제이션
    const dayNumber = useMemo(() => format(date, 'd'), [date]);

    return (
        <button
            className={className}
            onClick={isDisabled ? undefined : onClick}
            disabled={isDisabled}
        >
            <span className="absolute inset-0 flex items-center justify-center z-10 font-semibold" style={{ fontSize: '12px' }}>
                {dayNumber}
            </span>
            <OverlappingCircles filledCount={filledCount} />
        </button>
    );
});

CalendarDateCell.displayName = 'CalendarDateCell';

export default CalendarDateCell;

