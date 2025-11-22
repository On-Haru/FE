import { BellRing, CheckCircle, CalendarX } from 'lucide-react';

interface MissedMedicationAlertProps {
  missedMedication?: string;
  hasNoMedication?: boolean; // 약이 없는 경우
  allMedicationsTaken?: boolean; // 약이 있고 모두 복용한 경우
}

const MissedMedicationAlert = ({
  missedMedication,
  hasNoMedication,
  allMedicationsTaken,
}: MissedMedicationAlertProps) => {
  if (!missedMedication && !hasNoMedication && !allMedicationsTaken) {
    return null;
  }

  return (
    <div className="px-4 mb-4">
      <div className="bg-white rounded-xl border-1 border-gray-200 px-6 py-6 flex flex-col items-center">
        {hasNoMedication ? (
          // 약이 없는 경우
          <>
            <CalendarX
              className="w-12 h-12 mb-4"
              style={{ color: 'var(--color-primary)' }}
            />
            <p className="text-xl font-bold text-gray-700 mb-2 text-center">
              오늘은 복용할 약이 없습니다
            </p>
          </>
        ) : allMedicationsTaken ? (
          // 약이 있고 모두 복용한 경우
          <>
            <CheckCircle
              className="w-12 h-12 mb-4"
              style={{ color: 'var(--color-primary)' }}
            />
            <p className="text-xl font-bold text-gray-700 mb-2 text-center">
              오늘의 약을 모두 복용하셨습니다
            </p>
          </>
        ) : (
          // 미복용 약이 있는 경우
          <>
            <BellRing className="w-12 h-12 text-secondary mb-4" />
            <p className="text-xl font-bold text-black mb-2 text-center">
              아직 안 드신 약이 있어요!
            </p>
            <p className="text-lg text-secondary text-center">
              {missedMedication}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default MissedMedicationAlert;
