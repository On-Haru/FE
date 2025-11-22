import axiosInstance from '@/lib/axios';
import type { ApiResponse, CreateTakingLogRequest, UpdateTakingLogRequest } from '@/types/takingLog';


// 월간 복약 현황 캘린더 조회
export const getCalendar = async (
    year: number,
    month: number,
    userId: number
): Promise<CalendarResponse> => {
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
    return response.data.data;
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
        `api/taking-logs/schedule/${scheduleId}`
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
    await axiosInstance.post<ApiResponse<void>>(
        '/api/taking-logs/has-taken',
        request
    );
};