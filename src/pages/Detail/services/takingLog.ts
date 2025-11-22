import { apiClient } from '@/lib/api/apiClient';
import type {
    CalendarResponse,
    TakingLog,
    CreateTakingLogRequest,
    UpdateTakenRequest,
} from '../types/takingLog';

// 월간 복약 현황 캘린더 조회
export const getCalendar = async (
    year: number,
    month: number,
    userId: number
): Promise<CalendarResponse> => {
    return apiClient.get<CalendarResponse>(
        '/api/taking-logs/calendar',
        {
            params: {
                year,
                month,
                userId,
            },
        }
    );
};

// 복약 기록 단건 조회
export const getTakingLog = async (logId: number): Promise<TakingLog> => {
    return apiClient.get<TakingLog>(`/api/taking-logs/${logId}`);
};

// 특정 스케줄의 복약 기록 목록 조회 
export const getTakingLogsBySchedule = async (
    scheduleId: number
): Promise<TakingLog[]> => {
    return apiClient.get<TakingLog[]>(`/api/taking-logs/schedule/${scheduleId}`);
};

//복약 기록 생성
export const createTakingLog = async (
    request: CreateTakingLogRequest
): Promise<TakingLog> => {
    return apiClient.post<TakingLog>('/api/taking-logs', request);
};

//복약 여부 업데이트
export const updateTakenStatus = async (
    request: UpdateTakenRequest
): Promise<void> => {
    await apiClient.post<null>('/api/taking-logs/has-taken', request);
};