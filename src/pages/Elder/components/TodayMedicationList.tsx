import TodayMedicationCard, { type Medication } from './TodayMedicationCard';

interface TodayMedicationListProps {
  medications: Medication[];
  onMedicationClick?: (medication: Medication) => void;
}

const TodayMedicationList = ({
  medications,
  onMedicationClick,
}: TodayMedicationListProps) => {
  if (medications.length === 0) {
    return null;
  }

  return (
    <div className="px-4">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 px-4">
        오늘의 약
      </h2>
      <div>
        {medications.map((medication) => (
          <TodayMedicationCard
            key={medication.id}
            time={medication.time}
            medicationName={medication.medicationName}
            dosage={medication.dosage}
            isTaken={medication.isTaken}
            onClick={() => onMedicationClick?.(medication)}
          />
        ))}
      </div>
    </div>
  );
};

export default TodayMedicationList;
