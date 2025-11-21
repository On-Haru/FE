import type { MedicinePattern } from '@/types/report';

interface ReportMedicinePatternProps {
  medicinePattern: MedicinePattern[];
}

const ReportMedicinePattern = ({ medicinePattern }: ReportMedicinePatternProps) => {
  return (
    <div className="mb-6">
      <h2 className="text-lg font-semibold text-black mb-4">약별 복용 패턴</h2>
      <div className="space-y-3">
        {medicinePattern.map((medicine, index) => (
          <div
            key={index}
            className="bg-white rounded-lg p-4 border border-gray-200"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="text-base font-bold text-black mb-1">
                  {medicine.medicineName}
                </h3>
                <p className="text-xs text-gray-500 mb-2">최근 1달 기준</p>
                {medicine.aiComment && (
                  <div className="mt-2">
                    <span
                      className="inline-block px-2 py-1 rounded text-xs font-medium mb-1"
                      style={{ backgroundColor: '#E8F5E9', color: '#36C8B7' }}
                    >
                      AI 분석
                    </span>
                    <p className="text-sm text-black mt-1">{medicine.aiComment}</p>
                  </div>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm text-black">
                  복약률 {medicine.rate}%
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportMedicinePattern;

