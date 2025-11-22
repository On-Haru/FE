import { apiClient } from '@/lib/api/apiClient';
import type { NotifyRequest, SubscribeRequest } from '../types/push';

/**
 * 즉시 알림 발송 (테스트/수동)
 */
export const sendNotification = async (
    userId: number,
    request: NotifyRequest
): Promise<void> => {
    await apiClient.post<null>(`/api/push/notify/${userId}`, request);
};

/**
 * 브라우저 구독 등록
 */
export const subscribePush = async (
    userId: number,
    request: SubscribeRequest
): Promise<void> => {
    await apiClient.post<null>(`/api/push/subscribe/${userId}`, request);
};

