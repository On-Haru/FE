// 피보호자 관련 타입 정의

/**
 * 오늘의 복용 현황 정보
 */
export interface TodayMedicationStatus {
  /** 오늘 복용한 약 개수 */
  takenCount: number;
  /** 오늘 복용해야 할 전체 약 개수 */
  totalCount: number;
}

/**
 * 미복용 약 정보
 */
export interface MissedMedication {
  /** 약 시간 (morning, lunch, evening) */
  time: 'morning' | 'lunch' | 'evening';
  /** 약 이름 */
  medicationName: string;
}

/**
 * 피보호자 기본 정보
 */
export interface CareRecipient {
  /** 피보호자 ID */
  id: string;
  /** 피보호자 이름 */
  name: string;
  /** 오늘의 복용 현황 */
  todayStatus: TodayMedicationStatus;
  /** 미복용 약 목록 (없으면 빈 배열) */
  missedMedications: MissedMedication[];
  /** 상태 메시지 (예: "저녁 약을 복용할 시간입니다.") */
  statusMessage?: string;
}
