import { useState } from 'react';
import AlarmList from '@/pages/MedicineDetail/components/AlarmList';
import MedicineDetailModal from '@/pages/MedicineDetail/components/MedicineDetailModal';
import type { MedicineItem } from '@/pages/MedicineDetail/types/prescription';

export type { MedicineItem };

interface TableListProps {
  medicines: MedicineItem[];
  selected?: number[];
  onToggleItem?: (id: number) => void;
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
    if (!editMode) {
      setSelectedMedicine(item);
    }
  };

  const handleCloseModal = () => {
    setSelectedMedicine(null);
  };

  return (
    <div className="w-full">
      {medicines.length === 0 && (
        <div className="w-full px-4 py-6 text-center text-sm text-gray-500">
          등록된 약물이 없습니다.
        </div>
      )}

      {medicines.map((item) => {
        return (
          <div 
            key={item.id} 
            className={`border-b border-gray-200 pb-2 ${!editMode ? 'cursor-pointer hover:bg-gray-50' : ''}`}
            onClick={() => handleMedicineClick(item)}
          >
            {/* ---- 약 정보 Row ---- */}
            <div 
              className="flex items-center px-2 py-2 text-base gap-3"
              onClick={(e) => {
                if (editMode) {
                  e.stopPropagation();
                }
              }}
            >
              {/* 약품명 */}
              {editMode ? (
                <input
                  type="text"
                  className="flex-[3] bg-transparent border-b border-gray-300 font-semibold
                             focus:outline-none focus:border-primary"
                  value={item.name}
                  onChange={(e) =>
                    onChangeField?.(item.id, 'name', e.target.value)
                  }
                />
              ) : (
                <span className="flex-[3] font-semibold truncate">
                  {item.name}
                </span>
              )}

              {/* 용량/개수/일수 */}
              <div className="flex flex-[2] justify-between text-center font-medium">
                {/* 용량 */}
                {editMode ? (
                  <input
                    type="text"
                    className="w-1/3 rounded text-center focus:outline-none"
                    value={item.dosage ?? ''}
                    onChange={(e) =>
                      onChangeField?.(item.id, 'dosage', Number(e.target.value) || 0)
                    }
                  />
                ) : (
                  <span className="w-1/3">{item.dosage ?? '-'}</span>
                )}

                {/* 총 개수 */}
                {editMode ? (
                  <input
                    type="text"
                    className="w-1/3 rounded text-center focus:outline-none"
                    value={item.totalCount}
                    onChange={(e) =>
                      onChangeField?.(
                        item.id,
                        'totalCount',
                        Number(e.target.value)
                      )
                    }
                  />
                ) : (
                  <span className="w-1/3">{item.totalCount}</span>
                )}

                {/* 일수 */}
                {editMode ? (
                  <input
                    type="text"
                    className="w-1/3 rounded text-center focus:outline-none"
                    value={item.durationDays}
                    onChange={(e) =>
                      onChangeField?.(
                        item.id,
                        'durationDays',
                        Number(e.target.value)
                      )
                    }
                  />
                ) : (
                  <span className="w-1/3">{item.durationDays}</span>
                )}
              </div>

              {/* 약 삭제 버튼 */}
              {editMode && onDeleteMedicine && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteMedicine(item.id);
                  }}
                  className="w-8 px-2 py-1 text-sm text-red-500 border border-red-300 rounded-lg"
                >
                  삭제
                </button>
              )}
            </div>

            {/* ---- 스케줄 영역 ---- */}
            <div className="px-2">
              <div onClick={(e) => {
                if (editMode) {
                  e.stopPropagation();
                }
              }}>
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
          </div>
        );
      })}

      {/* ---- 약 추가 버튼 ---- */}
      {editMode && onAddMedicine && (
        <div className="flex justify-center py-4">
          <button
            type="button"
            onClick={onAddMedicine}
            className="px-5 py-2 flex items-center gap-2 rounded-full
                       border border-primary text-primary font-semibold"
          >
            <span className="text-xl">+</span> 약 추가하기
          </button>
        </div>
      )}

      {/* 약 상세 정보 모달 */}
      <MedicineDetailModal
        medicine={selectedMedicine}
        onClose={handleCloseModal}
      />
    </div>
  );
};

export default TableList;
