import { MinusCircle, Plus } from 'lucide-react';

export interface AlarmItem {
  id: string | number;
  schedule_type: 'MORNING' | 'LUNCH' | 'EVENING';
  notify_time: string;
  repeated_time: 'DAILY' | 'WEEKLY';
}

interface AlarmListProps {
  medicineId: number;
  alarms: AlarmItem[];
  editMode: boolean;
  onDeleteAlarm?: (medicineId: number, alarmId: number) => void;
  onChangeAlarm?: (
    medicineId: number,
    alarmId: number,
    newTime: string,
    newType: AlarmItem['schedule_type']
  ) => void;
  onAddAlarm?: (medicineId: number) => void;
}

const AlarmList = ({
  medicineId,
  alarms,
  editMode,
  onDeleteAlarm,
  onChangeAlarm,
  onAddAlarm,
}: AlarmListProps) => {
  const formatTime = (time: string) => {
    const [hourStr, minute] = time.split(':');
    let hour = Number(hourStr);

    const meridiem = hour < 12 ? '오전' : '오후';

    let displayHour = hour % 12;
    if (displayHour === 0) displayHour = 12;

    return `${meridiem} ${displayHour}:${minute}`;
  };

  const getScheduleType = (time: string): AlarmItem['schedule_type'] => {
    const [h] = time.split(':');
    const hour = Number(h);

    if (hour >= 5 && hour <= 10) return 'MORNING';
    if (hour >= 11 && hour <= 14) return 'LUNCH';
    return 'EVENING';
  };

  const getColorClass = (type: AlarmItem['schedule_type']) => {
    switch (type) {
      case 'MORNING':
        return 'text-morning-primary bg-morning-secondary';
      case 'LUNCH':
        return 'text-lunch-primary bg-lunch-secondary';
      case 'EVENING':
        return 'text-evening-primary bg-evening-secondary';
    }
  };

  const containerClass = editMode
    ? 'flex flex-col gap-2 items-start'
    : 'flex gap-2 flex-wrap items-center';

  return (
    <div className={containerClass}>
      {alarms.map((item) => (
        <div key={item.id}>
          {editMode ? (
            <div className="flex items-center gap-2">
              {onDeleteAlarm && (
                <button
                  type="button"
                  onClick={() =>
                    onDeleteAlarm?.(medicineId, Number(item.id))
                  }
                  className="w-6 h-6 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-700"
                >
                  <MinusCircle className="w-4 h-4" />
                </button>
              )}

              <input
                type="time"
                value={item.notify_time}
                onChange={(e) => {
                  const newTime = e.target.value;
                  const newType = getScheduleType(newTime);
                  onChangeAlarm?.(
                    medicineId,
                    Number(item.id),
                    newTime,
                    newType
                  );
                }}
                className="
                  px-3 py-1 rounded-full border border-gray-300 
                  text-base font-medium bg-white text-gray-700
                  focus:outline-none focus:ring-0
                "
              />
            </div>
          ) : (
            <span
              className={`
                px-3 py-1 rounded-full text-base font-medium
                ${getColorClass(item.schedule_type)}
              `}
            >
              {formatTime(item.notify_time)}
            </span>
          )}
        </div>
      ))}
      {editMode && onAddAlarm && (
        <button
          type="button"
          onClick={() => onAddAlarm(medicineId)}
          className="flex items-center gap-1 text-primary text-bold mt-1"
        >
          <Plus className="w-5 h-5" /> 시간 추가
        </button>
      )}
    </div>
  );
};

export default AlarmList;
