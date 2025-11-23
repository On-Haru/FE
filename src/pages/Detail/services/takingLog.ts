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
  return apiClient.get<CalendarResponse>('/api/taking-logs/calendar', {
    params: {
      year,
      month,
      userId,
    },
  });
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
  const endpoint = '/api/taking-logs/has-taken';

  console.log('[updateTakenStatus] 요청 시작:', {
    scheduleId: request.scheduleId,
    scheduledDateTime: request.scheduledDateTime,
    taken: request.taken,
  });

  try {
    // 먼저 기존 기록 업데이트 시도
    const response = await axiosInstance.post(endpoint, request);

    // 성공 응답 처리
    const responseData = response.data;
    if (responseData && typeof responseData === 'object') {
      if ('success' in responseData && !responseData.success) {
        const errorMessage =
          responseData.message || '복용 여부 업데이트에 실패했습니다.';
        throw new Error(errorMessage);
      }
    }

    console.log('[updateTakenStatus] ✅ 성공 (기존 기록 업데이트)');
  } catch (error: any) {
    console.log('[updateTakenStatus] 에러 발생:', {
      status: error.response?.status,
      errorCode: error.response?.data?.errorCode,
      message: error.response?.data?.message || error.message,
      data: error.response?.data,
    });

    // 404 에러인 경우: 복약 기록이 없으므로 새로 생성
    if (error.response?.status === 404) {
      const errorData = error.response.data;
      const errorCode = errorData?.errorCode;
      const errorMessage = errorData?.message || '';

      // "복약 기록을 찾을 수 없습니다" 에러인 경우 새로 생성
      const isRecordNotFound =
        errorCode === 'TL001' ||
        errorMessage.includes('복약 기록을 찾을 수 없습니다') ||
        errorMessage.includes('복약 기록이 없습니다') ||
        errorMessage.includes('기록을 찾을 수 없습니다');

      if (isRecordNotFound) {
        console.log(
          '[updateTakenStatus] 복약 기록이 없어 새로 생성합니다:',
          request
        );

        try {
          // 복약 기록 생성
          const newRecord = await createTakingLog({
            scheduleId: request.scheduleId,
            scheduledDateTime: request.scheduledDateTime,
            taken: request.taken,
            takenDateTime: request.taken ? new Date().toISOString() : null,
            delayMinutes: null,
          });
          console.log('[updateTakenStatus] ✅ 성공 (새 기록 생성):', newRecord);
          return;
        } catch (createError: any) {
          console.error('[updateTakenStatus] ❌ 복약 기록 생성 실패:', {
            status: createError.response?.status,
            errorCode: createError.response?.data?.errorCode,
            message: createError.response?.data?.message || createError.message,
            data: createError.response?.data,
          });
          throw createError;
        }
      } else {
        // 404이지만 다른 이유인 경우
        console.warn(
          '[updateTakenStatus] 404 에러이지만 기록 없음 에러가 아닙니다:',
          {
            errorCode,
            message: errorMessage,
          }
        );
      }
    }

    // 다른 에러인 경우 백엔드 에러 메시지 추출
    if (error.response?.data) {
      const errorData = error.response.data;
      if (
        errorData &&
        typeof errorData === 'object' &&
        'message' in errorData
      ) {
        const backendMessage =
          errorData.message || '복용 여부 업데이트에 실패했습니다.';
        console.error('[updateTakenStatus] 백엔드 에러:', {
          errorCode: errorData.errorCode,
          message: backendMessage,
          status: error.response.status,
        });
        throw new Error(backendMessage);
      }
    }

    // 백엔드 에러 메시지가 없으면 기본 에러 메시지
    console.error('[updateTakenStatus] 알 수 없는 에러:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
};
