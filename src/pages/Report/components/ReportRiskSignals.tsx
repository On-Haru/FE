
interface ReportRiskSignalsProps {
    quickResponseRate: number; // 알림 후 5분 이내 복용 비율
    delayedResponseRate: number; // 알림 후 30분 이상 지연 복용 비율
}

const ReportRiskSignals = ({
    quickResponseRate,
    delayedResponseRate,
}: ReportRiskSignalsProps) => {
    return (
        <div>
            <div className="bg-white rounded-xl px-4">
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <p className="text-base font-regular text-black">알림 후 5분 이내 복용 비율</p>
                        <span className="text-base font-bold text-primary">
                            {quickResponseRate}%
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-base font-regular text-black">알림 후 30분 이상 지연 복용 비율</p>
                        <span className="text-base font-bold text-primary">
                            {delayedResponseRate}%
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ReportRiskSignals;

