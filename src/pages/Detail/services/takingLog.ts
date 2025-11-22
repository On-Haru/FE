import axiosInstance from '@/lib/axios';
import type {
    ApiResponse,
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
    const baseURL = axiosInstance.defaults.baseURL || '';
    const fullUrl = `${baseURL}/api/taking-logs/calendar?year=${year}&month=${month}&userId=${userId}`;
    console.log('📤 [API 요청]', fullUrl);

    try {
        const response = await axiosInstance.get<ApiResponse<CalendarResponse>>(
            '/api/taking-logs/calendar',
            {
                params: {
                    year,
                    month,
                    userId,
                },
            }
        );

        // 응답 구조 확인
        if (!response.data) {
            throw new Error('API 응답이 없습니다.');
        }

        if (!response.data.success) {
            throw new Error(response.data.message || 'API 요청이 실패했습니다.');
        }

        if (!response.data.data) {
            throw new Error('API 응답 데이터가 없습니다.');
        }

        console.log('📥 [API 응답]', {
            year: response.data.data.year,
            month: response.data.data.month,
            daysCount: response.data.data.days?.length || 0,
            data: response.data.data,
        });

        return response.data.data;
    } catch (error: any) {
        console.error('❌ [API 에러]', {
            url: fullUrl,
            status: error.response?.status,
            message: error.message,
            data: error.response?.data,
        });
        throw error;
    }
};

// 복약 기록 단건 조회
export const getTakingLog = async (logId: number): Promise<TakingLog> => {
    const response = await axiosInstance.get<ApiResponse<TakingLog>>(
        `/api/taking-logs/${logId}`
    );
    return response.data.data;
};

// 특정 스케줄의 복약 기록 목록 조회 
export const getTakingLogsBySchedule = async (
    scheduleId: number
): Promise<TakingLog[]> => {
    const response = await axiosInstance.get<ApiResponse<TakingLog[]>>(
        `/api/taking-logs/schedule/${scheduleId}`
    );
    return response.data.data;
};

//복약 기록 생성
export const createTakingLog = async (
    request: CreateTakingLogRequest
): Promise<TakingLog> => {
    const response = await axiosInstance.post<ApiResponse<TakingLog>>(
        '/api/taking-logs',
        request
    );
    return response.data.data;
};

//복약 여부 업데이트
export const updateTakenStatus = async (
    request: UpdateTakenRequest
): Promise<void> => {
    await axiosInstance.post<ApiResponse<null>>(
        '/api/taking-logs/has-taken',
        request
    );
};