import type { CalendarDay, CalendarSlot } from '@/pages/Detail/types/takingLog';
import type {
  TodayMedicationStatus,
  MissedMedication,
} from '@/types/caregiver';

/**
 * 오늘 날짜를 YYYY-MM-DD 형식으로 반환
 */
export const getTodayDateString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * 캘린더 응답에서 오늘 날짜의 CalendarDay를 찾기
 */
export const findTodayCalendarDay = (
  calendarDays: CalendarDay[]
): CalendarDay | null => {
  const today = getTodayDateString();
  return calendarDays.find((day) => day.date === today) || null;
};

/**
 * CalendarDay에서 오늘의 복용 현황 계산
 */
export const calculateTodayStatus = (
  calendarDay: CalendarDay | null
): TodayMedicationStatus => {
  if (!calendarDay) {
    return {
      takenCount: 0,
      totalCount: 0,
    };
  }

  return {
    takenCount: calendarDay.takenCount,
    totalCount: calendarDay.requiredCount,
  };
};

/**
 * scheduleType을 MissedMedication의 time 형식으로 변환
 */
const mapScheduleTypeToTime = (
  scheduleType: CalendarSlot['scheduleType']
): MissedMedication['time'] => {
  switch (scheduleType) {
    case 'MORNING':
      return 'morning';
    case 'LUNCH':
      return 'lunch';
    case 'EVENING':
      return 'evening';
    case 'BEDTIME':
      // BEDTIME는 저녁으로 매핑
      return 'evening';
    default:
      return 'morning';
  }
};

/**
 * CalendarDay에서 미복용 약 목록 생성
 * taken: false이고 scheduledDateTime이 오늘인 슬롯만 필터링
 */
export const getMissedMedications = (
  calendarDay: CalendarDay | null
): MissedMedication[] => {
  if (!calendarDay) {
    return [];
  }

  const today = getTodayDateString();
  const now = new Date();

  return calendarDay.slots
    .filter((slot) => {
      // taken이 false이고, scheduledDateTime이 오늘인 것만
      if (slot.taken) {
        return false;
      }

      const scheduledDate = new Date(slot.scheduledDateTime);
      const scheduledDateString = scheduledDate.toISOString().split('T')[0];

      // 오늘 날짜인지 확인
      if (scheduledDateString !== today) {
        return false;
      }

      // 과거 시간인 것만 (미래 시간은 아직 복용할 시간이 안 된 것)
      return scheduledDate <= now;
    })
    .map((slot) => ({
      time: mapScheduleTypeToTime(slot.scheduleType),
      medicationName: slot.medicineName,
    }));
};

/**
 * 다음 복용 시간을 기반으로 statusMessage 생성
 */
export const generateStatusMessage = (
  calendarDay: CalendarDay | null
): string | undefined => {
  if (!calendarDay) {
    return undefined;
  }

  // 모든 약을 복용 완료한 경우
  if (calendarDay.status === 'COMPLETE') {
    return undefined;
  }

  const now = new Date();
  const today = getTodayDateString();

  // 미복용 약이 있는 경우
  const missedSlots = calendarDay.slots.filter((slot) => {
    if (slot.taken) {
      return false;
    }
    const scheduledDate = new Date(slot.scheduledDateTime);
    const scheduledDateString = scheduledDate.toISOString().split('T')[0];
    return scheduledDateString === today && scheduledDate <= now;
  });

  if (missedSlots.length > 0) {
    const timeLabels: Record<CalendarSlot['scheduleType'], string> = {
      MORNING: '아침',
      LUNCH: '점심',
      EVENING: '저녁',
      BEDTIME: '저녁',
    };

    const missedTimes = missedSlots.map(
      (slot) => timeLabels[slot.scheduleType]
    );
    const uniqueTimes = Array.from(new Set(missedTimes));
    return `${uniqueTimes.join(', ')} 약을 복용하지 않았습니다.`;
  }

  // 다음 복용 시간이 있는 경우
  const upcomingSlots = calendarDay.slots.filter((slot) => {
    if (slot.taken) {
      return false;
    }
    const scheduledDate = new Date(slot.scheduledDateTime);
    const scheduledDateString = scheduledDate.toISOString().split('T')[0];
    return scheduledDateString === today && scheduledDate > now;
  });

  if (upcomingSlots.length > 0) {
    // 가장 가까운 다음 복용 시간 찾기
    const nextSlot = upcomingSlots.sort(
      (a, b) =>
        new Date(a.scheduledDateTime).getTime() -
        new Date(b.scheduledDateTime).getTime()
    )[0];

    const timeLabels: Record<CalendarSlot['scheduleType'], string> = {
      MORNING: '아침',
      LUNCH: '점심',
      EVENING: '저녁',
      BEDTIME: '저녁',
    };

    return `${timeLabels[nextSlot.scheduleType]} 약을 복용할 시간입니다.`;
  }

  return undefined;
};
