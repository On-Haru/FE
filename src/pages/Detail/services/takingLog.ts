import { apiClient } from '@/lib/api/apiClient';
import axiosInstance from '@/lib/axios';
import type {
    CalendarResponse,
    TakingLog,
    CreateTakingLogRequest,
    UpdateTakenRequest,
} from '../types/takingLog';
import type { ApiResponse } from '@/lib/api/apiClient';

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
    console.log('[updateTakenStatus] 요청 시작:', request);
    
    try {
        // null 응답을 허용하기 위해 직접 axios 호출
        const response = await axiosInstance.post(
            '/api/taking-logs/has-taken', 
            request
        );
        
        console.log('[updateTakenStatus] 전체 응답:', response);
        console.log('[updateTakenStatus] response.data:', response.data);
        
        // 응답 구조 확인
        const responseData = response.data;
        
        // responseData가 객체인지 확인
        if (responseData && typeof responseData === 'object') {
            // ApiResponse 구조인지 확인
            if ('success' in responseData) {
                // ApiResponse 구조
                if (!responseData.success) {
                    const errorMessage = responseData.message || '복용 여부 업데이트에 실패했습니다.';
                    console.error('[updateTakenStatus] API 실패:', {
                        errorCode: responseData.errorCode,
                        message: errorMessage,
                    });
                    throw new Error(errorMessage);
                }
                // success가 true면 성공
                console.log('[updateTakenStatus] 성공 (ApiResponse 구조)');
            } else {
                // 다른 응답 구조일 수 있음
                console.log('[updateTakenStatus] 성공 (다른 응답 구조)');
            }
        } else {
            // responseData가 없거나 다른 형식이어도 성공으로 간주 (void 반환)
            console.log('[updateTakenStatus] 성공 (응답 없음)');
        }
    } catch (error) {
        console.error('[updateTakenStatus] 에러 발생:', error);
        // axios 에러인 경우 response 확인
        if ((error as any).response) {
            console.error('[updateTakenStatus] 에러 응답:', (error as any).response.data);
        }
        throw error;
    }
};