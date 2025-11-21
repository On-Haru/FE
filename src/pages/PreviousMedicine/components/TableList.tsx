import { type AlarmItem } from '@/pages/MedicineDetail/components/AlarmList';

export interface MedicineItem {
  medicine_id: string | number;
  medicinename: string;
  dosage: number;
  number: number;
  days: number;
  alarms?: AlarmItem[];
}

interface TableListProps {
  medicines: MedicineItem[];
}

const TableList = ({ medicines }: TableListProps) => {
  if (!medicines.length) {
    return (
      <div className="w-full px-4 py-6 text-center text-sm text-gray-500">
        등록된 약물이 없습니다.
      </div>
    );
  }

  return (
    <div className="w-full">
      {medicines.map((item) => (
        <div key={item.medicine_id} className="border-b border-gray-200 mb-1">
          <div className="flex items-center px-2 py-2 text-base text-gray-800">
            <span className="flex-[3] min-w-0 truncate font-semibold">
              {item.medicinename}
            </span>

            <div className="flex flex-[2] justify-between text-center font-medium">
              <span className="w-1/3">{item.dosage}</span>
              <span className="w-1/3">{item.number}</span>
              <span className="w-1/3">{item.days}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TableList;
