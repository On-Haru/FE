import AlarmList, {
  type AlarmItem,
} from '@/pages/MedicineDetail/components/AlarmList';

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
  selected: number[];
  onToggleItem: (id: number) => void;
  editMode: boolean;
  onChangeField?: (id: number, field: string, value: string | number) => void;
  onChangeAlarm?: (
    medicineId: number,
    alarmId: number,
    newTime: string,
    newType: AlarmItem['schedule_type']
  ) => void;
  onDeleteAlarm?: (medicineId: number, alarmId: number) => void;
  onAddAlarm?: (medicineId: number) => void;
  onDeleteMedicine?: (medicineId: number) => void;
  onAddMedicine?: () => void;
}

const TableList = ({
  medicines,
  selected,
  onToggleItem,
  editMode,
  onChangeField,
  onChangeAlarm,
  onDeleteAlarm,
  onAddAlarm,
  onDeleteMedicine,
  onAddMedicine,
}: TableListProps) => {
  if (!medicines.length) {
    return (
      <div className="w-full px-4 py-6 text-center text-sm text-gray-500">
        등록된 약물이 없습니다.
      </div>
    );
  }

  return (
    <div className="w-full">
      {medicines.map((item) => {
        const isChecked = selected.includes(Number(item.medicine_id));

        return (
          <div key={item.medicine_id} className="border-b border-gray-200 mb-1">
            <div className="flex items-center px-2 py-2 text-base text-gray-800 gap-2">
              {/* 체크박스 */}
              <input
                type="checkbox"
                className="accent-primary mr-2"
                checked={isChecked}
                onChange={() => onToggleItem(Number(item.medicine_id))}
                disabled={editMode}
              />

              {/* 약품명 */}
              {editMode ? (
                <input
                  type="text"
                  className="flex-[3] min-w-0 truncate font-semibold bg-transparent focus:outline-none border-b border-gray-300"
                  value={item.medicinename}
                  onChange={(e) =>
                    onChangeField?.(
                      Number(item.medicine_id),
                      'medicinename',
                      e.target.value
                    )
                  }
                />
              ) : (
                <span className="flex-[3] min-w-0 truncate font-semibold">
                  {item.medicinename}
                </span>
              )}

              <div className="flex flex-[2] justify-between text-center font-medium">
                {/* 투약량 */}
                {editMode ? (
                  <input
                    type="text"
                    inputMode="numeric"
                    className="w-1/3 border rounded text-center border-none focus:outline-none"
                    value={item.dosage}
                    onChange={(e) =>
                      onChangeField?.(
                        Number(item.medicine_id),
                        'dosage',
                        Number(e.target.value)
                      )
                    }
                  />
                ) : (
                  <span className="w-1/3">{item.dosage}</span>
                )}

                {/* 횟수 */}
                {editMode ? (
                  <input
                    type="text"
                    inputMode="numeric"
                    className="w-1/3 border rounded text-center border-none focus:outline-none"
                    value={item.number}
                    onChange={(e) =>
                      onChangeField?.(
                        Number(item.medicine_id),
                        'number',
                        Number(e.target.value)
                      )
                    }
                  />
                ) : (
                  <span className="w-1/3">{item.number}</span>
                )}

                {/* 일수 */}
                {editMode ? (
                  <input
                    type="text"
                    inputMode="numeric"
                    className="w-1/3 border rounded text-center border-none focus:outline-none"
                    value={item.days}
                    onChange={(e) =>
                      onChangeField?.(
                        Number(item.medicine_id),
                        'days',
                        Number(e.target.value)
                      )
                    }
                  />
                ) : (
                  <span className="w-1/3">{item.days}</span>
                )}
              </div>

              {editMode && onDeleteMedicine && (
                <button
                  type="button"
                  onClick={() => onDeleteMedicine(Number(item.medicine_id))}
                  className="ml-2 px-2 py-1 text-sm text-red-500 border border-red-200 rounded hover:bg-red-50"
                >
                  삭제
                </button>
              )}
            </div>

            {/* 알람 리스트 */}
            <div className="px-2 pb-3 pl-9">
              <AlarmList
                medicineId={Number(item.medicine_id)}
                alarms={item.alarms ?? []}
                editMode={editMode}
                onChangeAlarm={onChangeAlarm}
                onDeleteAlarm={onDeleteAlarm}
                onAddAlarm={onAddAlarm}
              />
            </div>
          </div>
        );
      })}
      {editMode && onAddMedicine && (
        <div className="flex justify-center py-4">
          <button
            type="button"
            onClick={onAddMedicine}
            className="flex items-center gap-2 px-5 py-2 rounded-full border border-primary text-primary font-semibold"
          >
            <span className="text-xl">+</span>
            <span>약 추가하기</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default TableList;
