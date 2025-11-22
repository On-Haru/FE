import { useState, useEffect } from 'react';
import { MinusCircle, Plus } from 'lucide-react';
import TimeTag, { type TimeLabel } from '@/components/TimeTag';

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
            let cursorPos = input.selectionStart || 0;
            
            // 현재 값을 HH:MM 형식으로 정규화
            let chars = inputValue.split('');
            if (chars.length !== 5 || chars[2] !== ':') {
              const digits = inputValue.replace(/[^\d]/g, '').padEnd(4, '0');
              chars = [digits[0] || '0', digits[1] || '8', ':', digits[2] || '0', digits[3] || '0'];
            }
            
            // 커서 위치에 따라 숫자 교체
            // 위치 0, 1 = 시간 (H, H)
            // 위치 2 = 콜론 (건너뛰기)
            // 위치 3, 4 = 분 (M, M)
            
            if (cursorPos <= 1) {
              // 시간 첫 번째 자리 (0) 또는 두 번째 자리 (1)
              const inputKey = e.key;
              
              if (cursorPos === 0) {
                // 첫 번째 자리: 0-2만 허용 (0X, 1X, 2X)
                if (inputKey >= '0' && inputKey <= '2') {
                  chars[0] = inputKey;
                  cursorPos = 1;
                }
              } else if (cursorPos === 1) {
                // 두 번째 자리: 첫 번째 숫자에 따라 제한
                const firstDigit = chars[0];
                if (firstDigit === '0' || firstDigit === '1') {
                  // 0X 또는 1X: 0-9 허용 (00-19)
                  if (inputKey >= '0' && inputKey <= '9') {
                    chars[1] = inputKey;
                    cursorPos = 3; // 콜론 건너뛰고 분 부분으로
                  }
                } else if (firstDigit === '2') {
                  // 2X: 0-3만 허용 (20-23)
                  if (inputKey >= '0' && inputKey <= '3') {
                    chars[1] = inputKey;
                    cursorPos = 3; // 콜론 건너뛰고 분 부분으로
                  }
                }
              }
            } else if (cursorPos === 2) {
              // 콜론 위치이면 분 첫 번째 자리로
              chars[3] = e.key;
              cursorPos = 4;
            } else if (cursorPos >= 3) {
              // 분 부분
              const minutePos = cursorPos - 3; // 3, 4 -> 0, 1
              if (minutePos < 2) {
                chars[3 + minutePos] = e.key;
                cursorPos = Math.min(cursorPos + 1, 5);
              }
            }
            
            // 시간 유효성 검사 (0-23 범위)
            const hourStr = chars.slice(0, 2).join('');
            const hour = Number(hourStr);
            
            // 시간 범위 검증 및 자동 수정
            if (hour > 23) {
              // 23 초과 시 23으로 고정
              chars[0] = '2';
              chars[1] = '3';
            } else if (hour < 0) {
              // 음수이면 00으로 변경
              chars[0] = '0';
              chars[1] = '0';
            }
            
            const result = chars.join('');
            setInputValue(result);
            
            // 커서 위치 업데이트 (콜론 위치는 건너뛰기)
            setTimeout(() => {
              if (cursorPos === 2) {
                cursorPos = 3;
              }
              input.setSelectionRange(cursorPos, cursorPos);
              
              // 완성된 형식일 때 업데이트
              if (result.length === 5) {
                const [hourStr, minuteStr] = result.split(':');
                const hour = Number(hourStr);
                
                if (hour >= 0 && hour <= 23 && minuteStr && minuteStr.length === 2) {
                  const minute = Number(minuteStr);
                  if (minute >= 0 && minute <= 59) {
                    const newType = getScheduleType(result);
                    
                    onChangeAlarm?.(
                      medicineId,
                      Number(item.id),
                      result, // 이미 24시간 형식
                      newType
                    );
                  }
                }
              }
            }, 0);
          }
        }}
        onChange={(e) => {
          // 백스페이스, Delete 등 키 처리
          let newValue = e.target.value.replace(/[^\d:]/g, '');
          
          if (newValue.length > 5) {
            newValue = newValue.slice(0, 5);
          }
          
          // 콜론 자동 추가
          if (newValue.length === 2 && !newValue.includes(':')) {
            newValue = newValue + ':';
          }
          
          // 콜론은 하나만
          const colonIndex = newValue.indexOf(':');
          if (colonIndex !== -1 && newValue.indexOf(':', colonIndex + 1) !== -1) {
            newValue = newValue.slice(0, colonIndex + 1) + newValue.slice(colonIndex + 1).replace(/:/g, '');
          }
          
          setInputValue(newValue);
        }}
        onBlur={(e) => {
          // 포커스가 벗어날 때 형식 검증 및 자동 완성
          const value = e.target.value.trim();
          
          if (!value) {
            // 빈 값이면 원래 값으로 복원
            setInputValue(formatTimeDisplay(item.notify_time));
            return;
          }
          
          const [hourStr, minuteStr] = value.split(':');
          
          if (hourStr) {
            let hour = Number(hourStr) || 0;
            const minute = (minuteStr?.padEnd(2, '0') || '00').padStart(2, '0');
            
            // 시간 범위로 제한 (0-23)
            if (hour < 0) hour = 0;
            if (hour > 23) hour = 23;
            
            // 분 범위 제한 (0-59)
            const minuteNum = Number(minute);
            const validMinute = minuteNum > 59 ? '59' : minute;
            
            const time24 = `${String(hour).padStart(2, '0')}:${validMinute}`;
            const newType = getScheduleType(time24);
            
            setInputValue(time24);
            onChangeAlarm?.(
              medicineId,
              Number(item.id),
              time24,
              newType
            );
          } else if (value && !value.includes(':')) {
            // "HHMM" 형식인 경우 콜론 추가
            if (value.length >= 1) {
              let hour = Number(value.slice(0, 2)) || 0;
              const minuteStr = value.slice(2, 4) || '00';
              
              if (hour < 0) hour = 0;
              if (hour > 23) hour = 23;
              
              const time24 = `${String(hour).padStart(2, '0')}:${minuteStr.padEnd(2, '0')}`;
              const newType = getScheduleType(time24);
              
              setInputValue(time24);
              onChangeAlarm?.(
                medicineId,
                Number(item.id),
                time24,
                newType
              );
            }
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
  const formatTime = (time: string) => {
    // 24시간 형태로 반환 (예: "14:30", "09:00")
    const [hour, minute] = time.split(':');
    return `${hour}:${minute}`;
  };

  const getScheduleType = (time: string): AlarmItem['schedule_type'] => {
    const [h] = time.split(':');
    const hour = Number(h);

    if (hour >= 5 && hour <= 10) return 'MORNING';
    if (hour >= 11 && hour <= 14) return 'LUNCH';
    return 'EVENING';
  };

  // 24시간 형식을 그대로 표시 (00:00 ~ 23:59)
  const formatTimeDisplay = (time24: string): string => {
    return time24; // 이미 24시간 형식이므로 그대로 반환
  };

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
