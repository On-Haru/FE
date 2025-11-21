import { Bell } from 'lucide-react';

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
        <Bell className="w-6 h-6 text-red-500 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-base font-medium text-gray-800 mb-1">
            아직 안 드신 약이 있어요!
          </p>
          <p className="text-sm text-red-500">{missedMedication}</p>
        </div>
      </div>
    </div>
  );
};

export default MissedMedicationAlert;
