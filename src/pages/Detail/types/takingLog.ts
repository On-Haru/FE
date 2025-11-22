//API 응답 래퍼 타입
export interface ApiResponse<T> {
    success: boolean;
    data: T;
    erroCode?: string;
    message?: string | null;
}

//복약 기록 타입
export interface TakingLog {
    id: number;
    scheduleId: number;
    scheduleType: 'MORNING' | 'LUNCH' | 'EVENING';
    scheduleDateTime: string;
    takenDateTime: string | null;
    take: boolean;
    delayMinutes: number | null;
}

// 캘린더 슬롯 타입
export interface CalendarSlot {
    slotId: number;
    scheduleId: number;
    medicineName: string;
    scheduleType: 'MORNING' | 'LUNCH' | 'EVENING';
    scheduledDateTime: string;
    taken: boolean;
    takenDateTime: string | null;
    delayMinutes: number | null;
}

// 캘린더 날짜 타입
export interface CalendarDay {
    date: string;
    requiredCount: number;
    takenCount: number;
    takenRatio: number;
    status: 'NONE' | 'PLANNED' | 'PARTIAL' | 'COMPLETE' | 'MISSED';
    // NONE	해당 날짜에 예정된 복약 없음
    // PLANNED	아직 복약 전(미래 슬롯 존재)
    // PARTIAL	일부만 복용 완료, 일부 슬롯은 미래
    // COMPLETE	예정된 모든 슬롯 복용 완료
    // MISSED	예정된 슬롯이 모두 과거이며 복용 안 함'
    slots: CalendarSlot[];
}

// 캘린더 응답 타입 
export interface CalendarResponse {
    year: number;
    month: number;
    timezone: string;
    days: CalendarDay[];
}

// 복약 기록 생성 요청 타입
export interface CreateTakingLogRequest {
    scheduleId: number;
    scheduledDateTime: string;
    takenDateTime?: string | null;
    take: boolean;
    delayMinutes?: number | null;
}

//복용 여부 업데이트 요청 타입
export interface UpdateTakingLogRequest {
    scheduleId: number;
    scheduledDateTime: string;
    take: boolean;
}