import { useState } from 'react';
import AlarmList from '@/pages/MedicineDetail/components/AlarmList';
import MedicineDetailModal from '@/pages/MedicineDetail/components/MedicineDetailModal';
import type { MedicineItem } from '@/pages/MedicineDetail/types/prescription';

export type { MedicineItem };

interface TableListProps {
  medicines: MedicineItem[];
  editMode: boolean;
  onChangeField?: (id: number, field: string, value: string | number) => void;
  onChangeAlarm?: (
    medicineId: number,
    alarmId: number,
    newTime: string,
    newType: 'MORNING' | 'LUNCH' | 'EVENING'
  ) => void;
  onDeleteAlarm?: (medicineId: number, alarmId: number) => void;
  onAddAlarm?: (medicineId: number) => void;
  onDeleteMedicine?: (medicineId: number) => void;
  onAddMedicine?: () => void;
}

const TableList = ({
  medicines,
  editMode,
  onChangeField,
  onChangeAlarm,
  onDeleteAlarm,
  onAddAlarm,
  onDeleteMedicine,
  onAddMedicine,
}: TableListProps) => {
  const [selectedMedicine, setSelectedMedicine] = useState<MedicineItem | null>(null);

  const handleMedicineClick = (item: MedicineItem) => {
    if (!editMode) setSelectedMedicine(item);
  };

  const handleCloseModal = () => setSelectedMedicine(null);

  return (
    <div className="w-full">

      {medicines.map((item) => (
        <div
          key={item.id}
          className={`border-b border-gray-200 pb-2 ${
            !editMode ? 'cursor-pointer hover:bg-gray-50' : ''
          }`}
          onClick={() => handleMedicineClick(item)}
        >
          {/* ---- 약 정보 Row ---- */}
          <div
            className="flex items-center px-2 py-2 text-base gap-3"
            onClick={(e) => editMode && e.stopPropagation()}
          >
            {/* 약품명 */}
            {editMode ? (
              <input
                type="text"
                className="flex-[2.2] min-w-0 bg-transparent border-b border-gray-300 
                           font-semibold focus:outline-none w-full"
                value={item.name}
                onChange={(e) => onChangeField?.(item.id, "name", e.target.value)}
              />
            ) : (
              <span className="flex-[3] min-w-0 font-semibold truncate">
                {item.name}
              </span>
            )}

            {/* 투약량 / 횟수 / 일수 */}
            <div className="flex flex-[2.3] gap-2 text-center font-medium">

              {/* 투약량 */}
              {editMode ? (
                <input
                  type="number"
                  className="flex-1 w-full text-center border-b border-gray-300 focus:outline-none"
                  value={item.dosage ?? ''}
                  onChange={(e) => onChangeField?.(item.id, 'dosage', Number(e.target.value))}
                />
              ) : (
                <span className="flex-1">{item.dosage ?? '-'}</span>
              )}

              {/* 횟수 */}
              {editMode ? (
                <input
                  type="number"
                  className="flex-1 w-full text-center border-b border-gray-300 focus:outline-none"
                  value={item.totalCount}
                  onChange={(e) => onChangeField?.(item.id, 'totalCount', Number(e.target.value))}
                />
              ) : (
                <span className="flex-1">{item.totalCount}</span>
              )}

              {/* 일수 */}
              {editMode ? (
                <input
                  type="number"
                  className="flex-1 w-full text-center border-b border-gray-300 focus:outline-none"
                  value={item.durationDays}
                  onChange={(e) =>
                    onChangeField?.(item.id, 'durationDays', Number(e.target.value))
                  }
                />
              ) : (
                <span className="flex-1">{item.durationDays}</span>
              )}
            </div>

            {/* 삭제 버튼 */}
            {editMode && onDeleteMedicine && (
              <button
                type="button"
                className="min-w-[2.5rem] px-2 py-1 text-sm text-red-500 border border-red-300 rounded-lg whitespace-nowrap"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteMedicine(item.id);
                }}
              >
                삭제
              </button>
            )}
          </div>

          {/* ---- 알람 ---- */}
          <div className="px-2 mt-1" onClick={(e) => editMode && e.stopPropagation()}>
            <AlarmList
              medicineId={item.id}
              alarms={item.schedules}
              editMode={editMode}
              onChangeAlarm={onChangeAlarm}
              onDeleteAlarm={onDeleteAlarm}
              onAddAlarm={onAddAlarm}
            />
          </div>
        </div>
      ))}

      {/* ---- 약 추가 버튼 ---- */}
      {editMode && onAddMedicine && (
        <div className="flex justify-center py-4">
          <button
            className="px-5 py-2 flex items-center gap-2 rounded-full border border-primary text-primary font-semibold"
            onClick={onAddMedicine}
          >
            <span className="text-xl">+</span> 약 추가하기
          </button>
        </div>
      )}

      <MedicineDetailModal medicine={selectedMedicine} onClose={handleCloseModal} />
    </div>
  );
};

export default TableList;
