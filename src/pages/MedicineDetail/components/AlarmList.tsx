import { useState, useEffect, useCallback } from 'react';
import { MinusCircle, Plus } from 'lucide-react';
import TimeTag, { type TimeLabel } from '@/components/TimeTag';

const sanitizeTimeInput = (v: string) => {
  let s = v.replace(/[^\d:]/g, '');
  if (s.length > 5) s = s.slice(0, 5);
  if (s.length === 2 && !s.includes(':')) s += ':';
  return s;
};

const parseTimeString = (str: string) => {
  const [h, m] = str.split(':');
  if (!h || !m) return null;
  return { hour: Number(h), minute: Number(m) };
};

const clamp = (num: number, min: number, max: number) =>
  Math.min(max, Math.max(min, num));

const formatTime = (h: number, m: number) =>
  `${String(clamp(h, 0, 23)).padStart(2, '0')}:${String(
    clamp(m, 0, 59)
  ).padStart(2, '0')}`;

const validateAndNormalizeTime = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const parsed = parseTimeString(trimmed);
  if (parsed) return formatTime(parsed.hour, parsed.minute);

  if (/^\d{3,4}$/.test(trimmed)) {
    const padded = trimmed.padEnd(4, '0');
    return formatTime(Number(padded.slice(0, 2)), Number(padded.slice(2)));
  }

  return null;
};

export interface AlarmItem {
  id: number;
  notifyTime: string;
  timeTag: 'MORNING' | 'LUNCH' | 'EVENING';
}

interface AlarmListProps {
  medicineId: number;
  alarms: AlarmItem[];
  editMode: boolean;
  onDeleteAlarm?: (medicineId: number, alarmId: number) => void;
  onChangeAlarm?: (
    medId: number,
    alarmId: number,
    time: string,
    type: AlarmItem['timeTag']
  ) => void;
  onAddAlarm?: (medicineId: number) => void;
}

const TimeInputItem = ({
  item,
  medicineId,
  editMode,
  onDeleteAlarm,
  onChangeAlarm,
  getScheduleType,
}: {
  item: AlarmItem;
  medicineId: number;
  editMode: boolean;
  onDeleteAlarm?: (medicineId: number, alarmId: number) => void;
  onChangeAlarm?: (
    medId: number,
    alarmId: number,
    time: string,
    type: AlarmItem['timeTag']
  ) => void;
  getScheduleType: (time: string) => AlarmItem['timeTag'];
}) => {
  const [inputValue, setInputValue] = useState(item.notifyTime);

  useEffect(() => {
    setInputValue(item.notifyTime);
  }, [item.notifyTime]);

  if (!editMode) {
    const getLabel = (tag: AlarmItem['timeTag']): TimeLabel =>
      tag === 'MORNING' ? '아침' : tag === 'LUNCH' ? '점심' : '저녁';

    return (
      <div className="flex items-center gap-2">
        <span className="px-3 py-1 rounded-full bg-gray-200 text-gray-700 font-medium">
          {item.notifyTime}
        </span>
        <TimeTag label={getLabel(item.timeTag)} />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {onDeleteAlarm && (
        <button
          type="button"
          onClick={() => onDeleteAlarm(medicineId, item.id)}
          className="w-6 h-6 flex items-center justify-center rounded-full bg-red-500 text-white"
        >
          <MinusCircle className="w-4 h-4" />
        </button>
      )}

      <input
        type="text"
        value={inputValue}
        maxLength={5}
        onChange={(e) => setInputValue(sanitizeTimeInput(e.target.value))}
        onBlur={() => {
          const normalized = validateAndNormalizeTime(inputValue);
          if (normalized) {
            setInputValue(normalized);
            onChangeAlarm?.(
              medicineId,
              item.id,
              normalized,
              getScheduleType(normalized)
            );
          } else {
            setInputValue(item.notifyTime);
          }
        }}
        className="
          px-3 py-1 w-20 text-center text-base
          rounded-full bg-gray-100 border border-gray-200
          focus:outline-none focus:ring-2 focus:ring-primary
        "
        placeholder="08:00"
      />
    </div>
  );
};

const AlarmList = ({
  medicineId,
  alarms,
  editMode,
  onDeleteAlarm,
  onChangeAlarm,
  onAddAlarm,
}: AlarmListProps) => {
  const getScheduleType = useCallback((time: string): AlarmItem['timeTag'] => {
    const hour = Number(time.split(':')[0]);
    if (hour >= 5 && hour <= 10) return 'MORNING';
    if (hour >= 11 && hour <= 14) return 'LUNCH';
    return 'EVENING';
  }, []);

  return (
    <div className="flex flex-col gap-2">
      {alarms.map((item) => (
        <TimeInputItem
          key={item.id}
          item={item}
          medicineId={medicineId}
          editMode={editMode}
          onDeleteAlarm={onDeleteAlarm}
          onChangeAlarm={onChangeAlarm}
          getScheduleType={getScheduleType}
        />
      ))}

      {editMode && onAddAlarm && (
        <button
          className="flex items-center gap-1 text-primary font-medium"
          onClick={() => onAddAlarm(medicineId)}
        >
          <Plus className="w-5 h-5" /> 시간 추가
        </button>
      )}
    </div>
  );
};

export default AlarmList;
