import TodayMedicationCard, {
  type MedicationTime,
} from './TodayMedicationCard';

interface Medication {
  time: MedicationTime;
  medicationName: string;
  dosage: string;
  isTaken: boolean;
}

interface TodayMedicationListProps {
  medications: Medication[];
}

const TodayMedicationList = ({ medications }: TodayMedicationListProps) => {
  if (medications.length === 0) {
    return null;
  }

  return (
    <div className="px-4">
      <h2 className="text-lg font-semibold text-gray-800 mb-3 px-4">
        오늘의 약
      </h2>
      <div>
        {medications.map((medication, index) => (
          <TodayMedicationCard
            key={index}
            time={medication.time}
            medicationName={medication.medicationName}
            dosage={medication.dosage}
            isTaken={medication.isTaken}
          />
        ))}
      </div>
    </div>
  );
};

export default TodayMedicationList;
