import type { MedicinePattern } from '@/types/report';

interface ReportMedicinePatternProps {
    medicinePattern: MedicinePattern[];
    averageDelayMinutes?: number;
}

const ReportMedicinePattern = ({
    medicinePattern,
    averageDelayMinutes,
}: ReportMedicinePatternProps) => {
    return (
        <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-black">약별 복용 패턴</h2>
                <p className="text-sm text-gray-600">
                    현재 총 복용 중인 약 · {medicinePattern.length}개
                </p>
            </div>
            <div className="space-y-3">
                {medicinePattern.map((medicine, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                                <h3 className="text-base font-bold text-black mb-1">
                                    {medicine.medicineName}
                                </h3>
                                <p className="text-sm text-gray-500 font-semibold mb-2">
                                    복약률 {medicine.rate}% · 평균 지연{' '}
                                    {averageDelayMinutes || 12}분
                                </p>
                            </div>
                            <p className="text-xs text-gray-500">최근 1달 기준</p>
                        </div>
                        {medicine.aiComment && (
                            <div className="mt-2 flex items-start gap-2">
                                <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-primary/30 text-primary flex-shrink-0">
                                    AI 분석
                                </span>
                                <p className="text-sm text-primary leading-relaxed flex-1">
                                    {medicine.aiComment}
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReportMedicinePattern;

