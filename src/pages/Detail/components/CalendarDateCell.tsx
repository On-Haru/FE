import { memo, useMemo, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { gsap } from 'gsap';
import type { DateChecklist } from '@/types/checklist';
import OverlappingCircles from './OverlappingCircles';

interface CalendarDateCellProps {
    date: Date;
    checklistData: Record<string, DateChecklist>;
    isSelected?: boolean;
    isDisabled?: boolean;
    status?: 'NONE' | 'PLANNED' | 'PARTIAL' | 'COMPLETE' | 'MISSED';
    onClick?: () => void;
}

const CalendarDateCell = memo(({
    date,
    checklistData,
    isSelected = false,
    isDisabled = false,
    status,
    onClick,
}: CalendarDateCellProps) => {
    const cellRef = useRef<HTMLButtonElement>(null);

    // 날짜 키를 메모이제이션
    const dateKey = useMemo(() => format(date, 'yyyy-MM-dd'), [date]);

    // 완료율 계산을 메모이제이션 (status와 takenRatio 우선 사용)
    const filledCount = useMemo(() => {
        const checklist = checklistData[dateKey];

        // status가 NONE이면 표시 없음
        if (status === 'NONE' || !checklist) return 0;

        // takenRatio가 있으면 우선 사용
        if (checklist.takenRatio !== undefined) {
            const ratio = checklist.takenRatio;
            if (ratio === 0) return 0;
            if (ratio <= 50) return 1;
            if (ratio < 100) return 2;
            return 3;
        }

        // takenRatio가 없으면 기존 로직 사용
        if (checklist.items.length === 0) return 0;
        const checkedCount = checklist.items.filter(item => item.checked).length;
        const percentage = (checkedCount / checklist.items.length) * 100;

        // 완료율에 따라 틸 색상 원의 개수 결정
        if (percentage === 0) return 0;
        if (percentage <= 50) return 1;
        if (percentage < 100) return 2;
        return 3;
    }, [checklistData, dateKey, status]);

    // 클래스명을 메모이제이션 (status에 따른 색상 추가)
    const className = useMemo(() => {
        const baseClasses = 'relative w-8 h-8 flex items-center justify-center text-sm rounded';
        if (isDisabled) {
            return `${baseClasses} text-gray-300 cursor-default`;
        }

        // status에 따른 텍스트 색상
        let textColor = 'text-gray-600';
        if (status === 'MISSED') {
            textColor = 'text-black';
        } else if (status === 'PLANNED') {
            textColor = 'text-black';
        } else if (status === 'COMPLETE') {
            textColor = 'text-black';
        }

        if (isSelected) {
            return `${baseClasses} ${textColor} font-semibold cursor-pointer`;
        }
        return `${baseClasses} ${textColor} cursor-pointer`;
    }, [isDisabled, isSelected, status]);

    // GSAP 호버 애니메이션
    useEffect(() => {
        const cell = cellRef.current;
        if (!cell || isDisabled) return;

        const handleMouseEnter = () => {
            gsap.to(cell, {
                scale: 1.4,
                duration: 0.01,
                ease: 'power2.out',
            });
        };

        const handleMouseLeave = () => {
            gsap.to(cell, {
                scale: 1,
                duration: 0.15,
                ease: 'power2.out',
            });
        };

        cell.addEventListener('mouseenter', handleMouseEnter);
        cell.addEventListener('mouseleave', handleMouseLeave);

        return () => {
            cell.removeEventListener('mouseenter', handleMouseEnter);
            cell.removeEventListener('mouseleave', handleMouseLeave);
            // 컴포넌트 언마운트 시 애니메이션 정리
            gsap.killTweensOf(cell);
        };
    }, [isDisabled]);

    // 날짜 숫자를 메모이제이션
    const dayNumber = useMemo(() => format(date, 'd'), [date]);

    return (
        <button
            ref={cellRef}
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

