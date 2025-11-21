import TodayMedicationCard, {
  type MedicationTime,
} from './TodayMedicationCard';

interface Medication {
  id: number;
  time: MedicationTime;
  medicationName: string;
  dosage: string;
  isTaken: boolean;
}

interface TodayMedicationListProps {
  medications: Medication[];
  onMedicationTaken: (id: number) => void;
}

const TodayMedicationList = ({
  medications,
  onMedicationTaken,
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
            id={medication.id}
            time={medication.time}
            medicationName={medication.medicationName}
            dosage={medication.dosage}
            isTaken={medication.isTaken}
            onMedicationTaken={onMedicationTaken}
          />
        ))}
      </div>
    </div>
  );
};

export default TodayMedicationList;
