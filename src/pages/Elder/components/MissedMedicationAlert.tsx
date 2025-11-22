import { BellRing, CheckCircle } from 'lucide-react';

interface MissedMedicationAlertProps {
  missedMedication?: string;
  hasNoMedication?: boolean;
}

const MissedMedicationAlert = ({
  missedMedication,
  hasNoMedication,
}: MissedMedicationAlertProps) => {
  if (!missedMedication && !hasNoMedication) {
    return null;
  }

  return (
    <div className="px-4 mb-4">
      <div className="bg-white rounded-xl border-1 border-gray-200 px-6 py-6 flex flex-col items-center">
        {hasNoMedication ? (
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
