import type { TodayMedicationStatus } from '@/types/caregiver';

interface MedicationProgressBarProps {
  /** 오늘의 복용 현황 */
  status: TodayMedicationStatus;
}

const MedicationProgressBar = ({ status }: MedicationProgressBarProps) => {
  const { takenCount, totalCount } = status;

  // 0으로 나누기 방지 및 진행률 계산
  const progressPercentage =
    totalCount > 0 ? (takenCount / totalCount) * 100 : 0;

  return (
    <div className="w-full space-y-2">
      {/* 진행바 */}
      <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* 분수 텍스트 (예: "1/3") */}
      <p className="text-sm text-gray-600 text-right">
        {takenCount}/{totalCount}
      </p>
    </div>
  );
};

export default MedicationProgressBar;
