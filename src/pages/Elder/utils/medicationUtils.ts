import type { CalendarSlot } from '@/pages/Detail/types/takingLog';
import type {
  Medication,
  MedicationTime,
} from '../components/TodayMedicationCard';

/**
 * scheduleType을 MedicationTime으로 변환
 */
const mapScheduleTypeToMedicationTime = (
  scheduleType: CalendarSlot['scheduleType']
): MedicationTime => {
  switch (scheduleType) {
    case 'MORNING':
      return 'morning';
    case 'LUNCH':
      return 'lunch';
    case 'EVENING':
    case 'BEDTIME':
      return 'evening';
    default:
      return 'morning';
  }
};

/**
 * CalendarSlot을 Medication 타입으로 변환
 * dosage는 API에 없으므로 기본값 "1정" 사용
 */
export const convertSlotToMedication = (slot: CalendarSlot): Medication => {
  return {
    id: slot.slotId,
    time: mapScheduleTypeToMedicationTime(slot.scheduleType),
    medicationName: slot.medicineName,
    dosage: '1정', // API에 dosage 정보가 없으므로 기본값 사용
    isTaken: slot.taken,
    scheduleId: slot.scheduleId, // API 호출에 필요
    scheduledDateTime: slot.scheduledDateTime, // API 호출에 필요
  };
};

/**
 * 오늘 날짜의 슬롯들을 Medication 배열로 변환
 * scheduledDateTime이 오늘 날짜인 슬롯만 필터링
 */
export const convertTodaySlotsToMedications = (
  slots: CalendarSlot[]
): Medication[] => {
  const today = new Date();
  const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD

  return slots
    .filter((slot) => {
      const scheduledDate = new Date(slot.scheduledDateTime);
      const scheduledDateString = scheduledDate.toISOString().split('T')[0];
      return scheduledDateString === todayString;
    })
    .map(convertSlotToMedication);
};
