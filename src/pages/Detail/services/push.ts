import axiosInstance from '@/lib/axios';
import type { ApiResponse } from '../types/takingLog';
import type { NotifyRequest, SubscribeRequest } from '../types/push';

/**
 * 즉시 알림 발송 (테스트/수동)
 */
export const sendNotification = async (
    userId: number,
    request: NotifyRequest
): Promise<void> => {
    const fullUrl = `${axiosInstance.defaults.baseURL || ''}/api/push/notify/${userId}`;
    console.log('📤 [Push 알림 요청]', fullUrl, request);

    // 토큰 확인 (디버깅용)
    const token = localStorage.getItem('accessToken');
    if (!token) {
        console.warn('⚠️ [Push 알림] 인증 토큰이 없습니다. 로그인이 필요할 수 있습니다.');
    }

    try {
        await axiosInstance.post<ApiResponse<null>>(
            `/api/push/notify/${userId}`,
            request
        );
        console.log('✅ [Push 알림 성공]', { userId, title: request.title });
    } catch (error: any) {
        console.error('❌ [Push 알림 에러]', {
            url: fullUrl,
            status: error.response?.status,
            message: error.message,
            data: error.response?.data,
            hasToken: !!token,
        });
        throw error;
    }
};

/**
 * 브라우저 구독 등록
 */
export const subscribePush = async (
    userId: number,
    request: SubscribeRequest
): Promise<void> => {
    await axiosInstance.post<ApiResponse<null>>(
        `/api/push/subscribe/${userId}`,
        request
    );
};

