import TableHeader from '@/pages/PreviousMedicine/components/TableHeader';
import TableList, {
  type MedicineItem,
} from '@/pages/PreviousMedicine/components/TableList';

export interface Prescription {
  prescription_id: string | number;
  date: string; // 처방전 날짜 (예: "2024-01-15")
  medicines: MedicineItem[];
}

const PreviousMedicinePage = () => {
  const prescriptions: Prescription[] = [
    {
      prescription_id: 1,
      date: '2024-01-10',
      medicines: [
        {
          medicine_id: 1,
          medicinename: '타이레놀',
          dosage: 2,
          number: 3,
          days: 5,
          alarms: [
            {
              id: 1,
              schedule_type: 'MORNING',
              notify_time: '08:00',
              repeated_time: 'DAILY',
            },
            {
              id: 2,
              schedule_type: 'EVENING',
              notify_time: '19:00',
              repeated_time: 'DAILY',
            },
          ],
        },
        {
          medicine_id: 2,
          medicinename: '오메가3',
          dosage: 1,
          number: 1,
          days: 30,
          alarms: [
            {
              id: 3,
              schedule_type: 'MORNING',
              notify_time: '09:00',
              repeated_time: 'DAILY',
            },
          ],
        },
      ],
    },
    {
      prescription_id: 2,
      date: '2024-01-20',
      medicines: [
        {
          medicine_id: 3,
          medicinename: '아스피린',
          dosage: 1,
          number: 2,
          days: 7,
          alarms: [
            {
              id: 4,
              schedule_type: 'LUNCH',
              notify_time: '12:00',
              repeated_time: 'DAILY',
            },
          ],
        },
      ],
    },
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  return (
    <div className="w-full">
      {prescriptions.map((prescription) => (
        <div key={prescription.prescription_id} className="mb-8">
          <div className="px-2 py-2">
            <span className="text-lg font-semibold text-gray-800">
              처방전 {prescription.prescription_id} &ensp;
            </span>
            <span className="text-md font-base text-gray-400">
              {formatDate(prescription.date)}
            </span>
          </div>
          <TableHeader />
          <TableList medicines={prescription.medicines} />
        </div>
      ))}
    </div>
  );
};

export default PreviousMedicinePage;
