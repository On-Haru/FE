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

const CalendarDateCell = ({
    date,
    checklistData,
    isSelected = false,
    isDisabled = false,
    hasChecklist = false,
    onClick,
}: CalendarDateCellProps) => {
    // 날짜별 완료율 계산
    const getCompletionPercentage = (): number => {
        const dateKey = format(date, 'yyyy-MM-dd');
        const checklist = checklistData[dateKey];
        if (!checklist || checklist.items.length === 0) return 0;

        const checkedCount = checklist.items.filter(item => item.checked).length;
        return (checkedCount / checklist.items.length) * 100;
    };

    // 완료율에 따라 틸 색상 원의 개수 결정
    const getFilledCircleCount = (percentage: number): number => {
        if (percentage === 0) return 0;
        if (percentage <= 50) return 1;
        if (percentage < 100) return 2;
        return 3;
    };

    // 체크리스트가 없으면 모든 원을 회색으로 표시 (0% 완료)
    let filledCount = 0;
    const dateKey = format(date, 'yyyy-MM-dd');
    const checklist = checklistData[dateKey];
    if (checklist && checklist.items.length > 0) {
        const percentage = getCompletionPercentage();
        filledCount = getFilledCircleCount(percentage);
    }

    const baseClasses = 'relative w-8 h-8 flex items-center justify-center text-sm rounded transition-transform';
    const className = isDisabled
        ? `${baseClasses} text-gray-400 cursor-default`
        : isSelected
            ? `${baseClasses} text-gray-900 font-semibold cursor-pointer`
            : hasChecklist
                ? `${baseClasses} hover:scale-120 text-gray-900 cursor-pointer`
                : `${baseClasses} hover:scale-120 text-gray-900 cursor-pointer`;

    return (
        <button
            className={className}
            onClick={isDisabled ? undefined : onClick}
            disabled={isDisabled}
        >
            <span className="absolute inset-0 flex items-center justify-center z-10 font-semibold" style={{ fontSize: '12px' }}>
                {format(date, 'd')}
            </span>
            <OverlappingCircles filledCount={filledCount} />
        </button>
    );
};

export default CalendarDateCell;

