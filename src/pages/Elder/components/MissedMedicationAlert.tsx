import { BellRing } from 'lucide-react';

interface MissedMedicationAlertProps {
  missedMedication?: string;
}

const MissedMedicationAlert = ({
  missedMedication,
}: MissedMedicationAlertProps) => {
  if (!missedMedication) {
    return null;
  }

  return (
    <div className="px-4 mb-4">
      <div className="bg-[#FFE6E6] rounded-2xl px-6 py-4 flex items-center gap-3">
        <BellRing className="w-10 h-10 text-red-500 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-xl font-medium text-gray-800 mb-2">
            아직 안 드신 약이 있어요!
          </p>
          <p className="text-lg text-red-500">{missedMedication}</p>
        </div>
      </div>
    </div>
  );
};

export default MissedMedicationAlert;
