import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import TimeTag from '@/components/TimeTag';
import type { TimePattern } from '@/types/report';

interface ReportTimePatternProps {
    timePattern: TimePattern[];
}

const ReportTimePattern = ({ timePattern }: ReportTimePatternProps) => {
    const progressBarsRef = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        // 각 프로그레스 바에 애니메이션 적용
        progressBarsRef.current.forEach((bar, index) => {
            if (!bar) return;
            const item = timePattern[index];
            if (!item) return;

            // 초기 상태 설정
            gsap.set(bar, { width: 0 });

            // 프로그레스 바 애니메이션 (스태거 효과)
            gsap.to(bar, {
                width: `${item.rate}%`,
                duration: 1.6,
                delay: index * 0.15, // 각 바마다 0.15초씩 지연
                ease: 'power2.out',
            });
        });
    }, [timePattern]);

    return (
        <div>
            <div className="space-y-4">
                {timePattern.map((item, index) => {
                    return (
                        <div key={item.label} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <TimeTag label={item.label as '아침' | '점심' | '저녁'} />
                                <span className="text-sm font-medium text-black">
                                    복용률 {item.rate}%
                                </span>
                            </div>
                            <div className="relative">
                                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        ref={(el) => {
                                            progressBarsRef.current[index] = el;
                                        }}
                                        className="h-full rounded-full"
                                        style={{
                                            width: 0,
                                            backgroundColor: '#36C8B7',
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ReportTimePattern;

