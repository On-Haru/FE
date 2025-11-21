import type { Statistics } from '@/types/report';

interface ReportOverallStatsProps {
    statistics: Statistics;
}

const ReportOverallStats = ({ statistics }: ReportOverallStatsProps) => {
    const { overallRate, comparisonRate, averageDelayMinutes, missedCount } = statistics;

    const getComparisonText = () => {
        if (!comparisonRate) return null;
        const { diff, direction } = comparisonRate;
        const directionText = direction === 'UP' ? '향상' : direction === 'DOWN' ? '감소' : '동일';
        const sign = direction === 'UP' ? '+' : direction === 'DOWN' ? '-' : '';
        return `지난달 대비 ${sign}${diff}% ${directionText}`;
    };

    return (
        <div className="mb-6 bg-white rounded-lg p-4 border border-gray-200">
            <div className="space-y-4">
                {/* 전체 복약률 */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <p className="text-base font-bold text-black">전체 복약률</p>
                        {comparisonRate && (
                            <p className="text-xs">{getComparisonText()}</p>
                        )}
                    </div>
                    <span className="text-2xl font-bold text-primary">
                        {overallRate}%
                    </span>
                </div>

                {/* 평균 지연 시간 */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <p className="text-base font-bold text-black">평균 지연 시간</p>
                        <p className="text-xs text-gray-600">알림 이후 복용까지</p>
                    </div>
                    <span className="text-2xl font-bold" style={{ color: '#36C8B7' }}>
                        {averageDelayMinutes}분
                    </span>
                </div>

                {/* 미복용 알림 */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <p className="text-base font-bold text-black">미복용 알림</p>
                        <p className="text-xs text-gray-600">최근 7일 기준</p>
                    </div>
                    <span className="text-2xl font-bold" style={{ color: '#36C8B7' }}>
                        {missedCount}회
                    </span>
                </div>
            </div>
        </div>
    );
};

export default ReportOverallStats;

