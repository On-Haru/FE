import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import type { Statistics } from '@/types/report';

interface ReportOverallStatsProps {
    statistics: Statistics;
}

const ReportOverallStats = ({ statistics }: ReportOverallStatsProps) => {
    const { overallRate, comparisonRate, averageDelayMinutes, missedCount } = statistics;
    const rateTextRef = useRef<HTMLSpanElement>(null);
    const delayTextRef = useRef<HTMLSpanElement>(null);
    const missedTextRef = useRef<HTMLSpanElement>(null);
    const [animatedRate, setAnimatedRate] = useState(0);
    const [animatedDelay, setAnimatedDelay] = useState(0);
    const [animatedMissed, setAnimatedMissed] = useState(0);

    useEffect(() => {
        const rateText = rateTextRef.current;
        if (!rateText) return;

        // 전체 복약률 숫자 카운트업 애니메이션
        const rateCountObj = { value: 0 };
        gsap.to(rateCountObj, {
            value: overallRate,
            duration: 1.7,
            ease: 'power2.out',
            onUpdate: () => {
                setAnimatedRate(Math.round(rateCountObj.value));
            },
        });
    }, [overallRate]);

    useEffect(() => {
        if (averageDelayMinutes === null) return;
        const delayText = delayTextRef.current;
        if (!delayText) return;

        // 평균 지연 시간 숫자 카운트업 애니메이션
        const delayCountObj = { value: 0 };
        gsap.to(delayCountObj, {
            value: averageDelayMinutes,
            duration: 1.7,
            ease: 'power2.out',
            onUpdate: () => {
                setAnimatedDelay(Math.round(delayCountObj.value));
            },
        });
    }, [averageDelayMinutes]);

    useEffect(() => {
        if (missedCount === null) return;
        const missedText = missedTextRef.current;
        if (!missedText) return;

        // 미복용 알림 숫자 카운트업 애니메이션
        const missedCountObj = { value: 0 };
        gsap.to(missedCountObj, {
            value: missedCount,
            duration: 1.7,
            ease: 'power2.out',
            onUpdate: () => {
                setAnimatedMissed(Math.round(missedCountObj.value));
            },
        });
    }, [missedCount]);

    const getComparisonText = () => {
        if (!comparisonRate) return null;
        const { diff, direction } = comparisonRate;
        const directionText = direction === 'UP' ? '향상' : direction === 'DOWN' ? '감소' : '동일';
        const sign = direction === 'UP' ? '+' : direction === 'DOWN' ? '-' : '';
        return `지난달 대비 ${sign}${diff}% ${directionText}`;
    };

    return (
        <div>
            <div className="bg-white rounded-xl p-4 border border-gray-200">
                <div className="space-y-4">
                    {/* 전체 복약률 */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <p className="text-base font-bold text-black">전체 복약률</p>
                            {comparisonRate && (
                                <p className="text-xs">{getComparisonText()}</p>
                            )}
                        </div>
                        <span ref={rateTextRef} className="text-2xl font-bold text-primary">
                            {animatedRate}%
                        </span>
                    </div>

                    {/* 평균 지연 시간 */}
                    {averageDelayMinutes !== null && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <p className="text-base font-bold text-black">평균 지연 시간</p>
                                <p className="text-xs text-gray-600">알림 이후 복용까지</p>
                            </div>
                            <span ref={delayTextRef} className="text-2xl font-bold" style={{ color: '#36C8B7' }}>
                                {animatedDelay}분
                            </span>
                        </div>
                    )}

                    {/* 미복용 알림 */}
                    {missedCount !== null && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <p className="text-base font-bold text-black">미복용 알림</p>
                                <p className="text-xs text-gray-600">최근 7일 기준</p>
                            </div>
                            <span ref={missedTextRef} className="text-2xl font-bold" style={{ color: '#36C8B7' }}>
                                {animatedMissed}회
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportOverallStats;

