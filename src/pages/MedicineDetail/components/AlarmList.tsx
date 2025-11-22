import { useState, useEffect, useCallback } from 'react';
import { MinusCircle, Plus } from 'lucide-react';
import TimeTag, { type TimeLabel } from '@/components/TimeTag';

const normalizeTimeFormat = (value: string): string => {
  const digits = value.replace(/[^\d]/g, '').padEnd(4, '0');
  return `${digits[0] || '0'}${digits[1] || '8'}:${digits[2] || '0'}${digits[3] || '0'}`;
};

const isValidHour = (hour: number): boolean => {
  return hour >= 0 && hour <= 23;
};

const isValidMinute = (minute: number): boolean => {
  return minute >= 0 && minute <= 59;
};

const clampHour = (hour: number): number => {
  return Math.max(0, Math.min(23, hour));
};

const clampMinute = (minute: number): number => {
  return Math.max(0, Math.min(59, minute));
};

const formatTimeString = (hour: number, minute: number): string => {
  return `${String(clampHour(hour)).padStart(2, '0')}:${String(clampMinute(minute)).padStart(2, '0')}`;
};

const parseTimeString = (timeStr: string): { hour: number; minute: number } | null => {
  const parts = timeStr.split(':');
  if (parts.length === 2) {
    const hour = Number(parts[0]);
    const minute = Number(parts[1]);
    if (!isNaN(hour) && !isNaN(minute)) {
      return { hour, minute };
    }
  }
  return null;
};

const parseCompactTime = (value: string): { hour: number; minute: number } | null => {
  if (value.length >= 2) {
    const hour = Number(value.slice(0, 2)) || 0;
    const minute = Number(value.slice(2, 4)) || 0;
    return { hour, minute };
  }
  return null;
};

const insertDigitAtPosition = (
  position: number,
  digit: string,
  currentValue: string
): { newValue: string; nextCursorPos: number } => {
  let chars = currentValue.split('');
  
  // 정규화 필요 시 정규화
  if (chars.length !== 5 || chars[2] !== ':') {
    chars = normalizeTimeFormat(currentValue).split('');
  }

  let nextCursorPos = position;

  if (position <= 1) {
    // 시간 부분
    if (position === 0 && digit >= '0' && digit <= '2') {
      chars[0] = digit;
      nextCursorPos = 1;
    } else if (position === 1) {
      const firstDigit = chars[0];
      if ((firstDigit === '0' || firstDigit === '1') && digit >= '0' && digit <= '9') {
        chars[1] = digit;
        nextCursorPos = 3; // 콜론 건너뛰기
      } else if (firstDigit === '2' && digit >= '0' && digit <= '3') {
        chars[1] = digit;
        nextCursorPos = 3; // 콜론 건너뛰기
      }
    }
  } else if (position === 2) {
    // 콜론 위치이면 분 첫 번째 자리로
    chars[3] = digit;
    nextCursorPos = 4;
  } else if (position >= 3) {
    // 분 부분
    const minutePos = position - 3;
    if (minutePos < 2) {
      chars[3 + minutePos] = digit;
      nextCursorPos = Math.min(position + 1, 5);
    }
  }

  // 시간 유효성 검사 및 자동 수정
  const hourStr = chars.slice(0, 2).join('');
  const hour = Number(hourStr);
  if (hour > 23) {
    chars[0] = '2';
    chars[1] = '3';
  } else if (hour < 0) {
    chars[0] = '0';
    chars[1] = '0';
  }

  const newValue = chars.join('');
  
  // 커서 위치 조정 (콜론 건너뛰기)
  if (nextCursorPos === 2) {
    nextCursorPos = 3;
  }

  return { newValue, nextCursorPos };
};

const sanitizeTimeInput = (value: string): string => {
  // 숫자와 콜론만 허용
  let sanitized = value.replace(/[^\d:]/g, '');

  // 최대 5글자 제한
  if (sanitized.length > 5) {
    sanitized = sanitized.slice(0, 5);
  }

  // 콜론 자동 추가
  if (sanitized.length === 2 && !sanitized.includes(':')) {
    sanitized = sanitized + ':';
  }

  // 콜론은 하나만 허용
  const colonIndex = sanitized.indexOf(':');
  if (colonIndex !== -1 && sanitized.indexOf(':', colonIndex + 1) !== -1) {
    sanitized = sanitized.slice(0, colonIndex + 1) + sanitized.slice(colonIndex + 1).replace(/:/g, '');
  }

  return sanitized;
};

const validateAndNormalizeTime = (value: string): string | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;

  // HH:MM 형식 파싱
  const parsed = parseTimeString(trimmed);
  if (parsed) {
    const { hour, minute } = parsed;
    return formatTimeString(hour, minute);
  }

  // HHMM 형식 파싱
  const compactParsed = parseCompactTime(trimmed);
  if (compactParsed) {
    const { hour, minute } = compactParsed;
    return formatTimeString(hour, minute);
  }

  return null;
};

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


// 개별 알람 항목 컴포넌트 (로컬 state로 입력 값 관리)
interface TimeInputItemProps {
  item: AlarmItem;
  medicineId: number;
  editMode: boolean;
  onDeleteAlarm?: (medicineId: number, alarmId: number) => void;
  onChangeAlarm?: (
    medicineId: number,
    alarmId: number,
    newTime: string,
    newType: AlarmItem['schedule_type']
  ) => void;
  formatTimeDisplay: (time24: string) => string;
  getScheduleType: (time: string) => AlarmItem['schedule_type'];
  formatTime: (time: string) => string;
}

const TimeInputItem = ({
  item,
  medicineId,
  editMode,
  onDeleteAlarm,
  onChangeAlarm,
  formatTimeDisplay,
  getScheduleType,
  formatTime,
}: TimeInputItemProps) => {
  const [inputValue, setInputValue] = useState(formatTimeDisplay(item.notify_time));

  // item.notify_time이 변경되면 inputValue도 업데이트
  useEffect(() => {
    setInputValue(formatTimeDisplay(item.notify_time));
  }, [item.notify_time, formatTimeDisplay]);

  if (!editMode) {
    // schedule_type을 TimeLabel로 변환
    const getTimeLabel = (type: AlarmItem['schedule_type']): TimeLabel => {
      switch (type) {
        case 'MORNING':
          return '아침';
        case 'LUNCH':
          return '점심';
        case 'EVENING':
          return '저녁';
      }
    };

    return (
      <div className="flex items-center gap-2">
        <span
          className="
            px-3 py-1 rounded-full text-sm font-medium
            bg-gray-200 text-gray-600
          "
        >
          {formatTime(item.notify_time)}
        </span>
        <TimeTag label={getTimeLabel(item.schedule_type)} />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {onDeleteAlarm && (
        <button
          type="button"
          onClick={() => onDeleteAlarm?.(medicineId, Number(item.id))}
          className="w-6 h-6 flex items-center justify-center rounded-full bg-red-500 text-white hover:bg-red-700"
        >
          <MinusCircle className="w-4 h-4" />
        </button>
      )}

      {/* 시간 입력 필드 (24시간 형식: 00:00 ~ 23:59) */}
      <input
        type="text"
        value={inputValue}
        onKeyDown={(e) => {
          // 숫자 키 입력 시 커서 위치에서 숫자 교체
          if (e.key >= '0' && e.key <= '9') {
            e.preventDefault();
            
            const input = e.currentTarget;
            const cursorPos = input.selectionStart || 0;
            
            const { newValue, nextCursorPos } = insertDigitAtPosition(
              cursorPos,
              e.key,
              inputValue
            );
            
            setInputValue(newValue);
            
            // 커서 위치 업데이트
            setTimeout(() => {
              input.setSelectionRange(nextCursorPos, nextCursorPos);
              
              // 완성된 형식일 때 업데이트
              if (newValue.length === 5) {
                const parsed = parseTimeString(newValue);
                if (parsed && isValidHour(parsed.hour) && isValidMinute(parsed.minute)) {
                  const newType = getScheduleType(newValue);
                  onChangeAlarm?.(
                    medicineId,
                    Number(item.id),
                    newValue,
                    newType
                  );
                }
              }
            }, 0);
          }
        }}
        onChange={(e) => {
          // 백스페이스, Delete 등 키 처리
          const sanitized = sanitizeTimeInput(e.target.value);
          setInputValue(sanitized);
        }}
        onBlur={(e) => {
          // 포커스가 벗어날 때 형식 검증 및 자동 완성
          const validated = validateAndNormalizeTime(e.target.value);
          
          if (validated) {
            setInputValue(validated);
            const newType = getScheduleType(validated);
            onChangeAlarm?.(
              medicineId,
              Number(item.id),
              validated,
              newType
            );
          } else {
            // 형식이 올바르지 않으면 원래 값으로 복원
            setInputValue(formatTimeDisplay(item.notify_time));
          }
        }}
        placeholder="23:00"
        maxLength={5}
        className="
          px-3 py-1 rounded-full border border-gray-300 
          text-base font-medium bg-white text-gray-700
          focus:outline-none focus:ring-0
          w-20 text-center
        "
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
  // 24시간 형태로 반환 (예: "14:30", "09:00")
  const formatTime = useCallback((time: string) => {
    const [hour, minute] = time.split(':');
    return `${hour}:${minute}`;
  }, []);

  const getScheduleType = useCallback((time: string): AlarmItem['schedule_type'] => {
    const [h] = time.split(':');
    const hour = Number(h);

    if (hour >= 5 && hour <= 10) return 'MORNING';
    if (hour >= 11 && hour <= 14) return 'LUNCH';
    return 'EVENING';
  }, []);

  // 24시간 형식을 그대로 표시 (00:00 ~ 23:59)
  const formatTimeDisplay = useCallback((time24: string): string => {
    return time24; // 이미 24시간 형식이므로 그대로 반환
  }, []);

  const containerClass = editMode
    ? 'flex flex-col gap-2 items-start'
    : 'flex flex-col gap-2 items-start';

  return (
    <div className={containerClass}>
      {alarms.map((item) => {
        return (
          <TimeInputItem
            key={item.id}
            item={item}
            medicineId={medicineId}
            editMode={editMode}
            onDeleteAlarm={onDeleteAlarm}
            onChangeAlarm={onChangeAlarm}
            formatTimeDisplay={formatTimeDisplay}
            getScheduleType={getScheduleType}
            formatTime={formatTime}
          />
        );
      })}
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
