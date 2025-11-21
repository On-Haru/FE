interface ReportRiskSignalsProps {
    quickResponseRate: number; // 알림 후 5분 이내 복용 비율
    delayedResponseRate: number; // 알림 후 30분 이상 지연 복용 비율
    suggestion?: string; // AI 제안
}

const ReportRiskSignals = ({
    quickResponseRate,
    delayedResponseRate,
    suggestion,
}: ReportRiskSignalsProps) => {
    return (
        <div className="mb-6">
            <h2 className="text-lg font-semibold text-black mb-4">위험 신호 & 행동 제안</h2>
            <div className="space-y-0 mb-4">
                <div className="flex items-center justify-between">
                    <p className="text-base font-regular text-black">알림 후 5분 이내 복용 비율</p>
                    <span className="text-xl font-bold text-primary">
                        {quickResponseRate}%
                    </span>
                </div>
                <div className="flex items-center justify-between">
                    <p className="text-base font-regular text-black">알림 후 30분 이상 지연 복용 비율</p>
                    <span className="text-xl font-bold text-primary">
                        {delayedResponseRate}%
                    </span>
                </div>
            </div>
            {suggestion && (
                <div className="p-4 rounded-lg bg-primary/30 border border-primary">
                    <h3 className="text-base font-bold text-black mb-2">AI 제안</h3>
                    <p className="text-sm text-black leading-relaxed">{suggestion}</p>
                </div>
            )}
        </div>
    );
};

export default ReportRiskSignals;

