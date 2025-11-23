import { apiClient } from '@/lib/api/apiClient';
import axiosInstance from '@/lib/axios';
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
    try {
        // null 응답을 허용하기 위해 직접 axios 호출
        const response = await axiosInstance.post(
            '/api/taking-logs/has-taken', 
            request
        );
        
        // 응답 구조 확인
        const responseData = response.data;
        
        // responseData가 객체인지 확인
        if (responseData && typeof responseData === 'object') {
            // ApiResponse 구조인지 확인
            if ('success' in responseData) {
                // ApiResponse 구조
                if (!responseData.success) {
                    const errorMessage = responseData.message || '복용 여부 업데이트에 실패했습니다.';
                    throw new Error(errorMessage);
                }
            }
        }
    } catch (error) {
        throw error;
    }
};