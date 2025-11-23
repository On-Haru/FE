import { apiClient } from '@/lib/api/apiClient';
import axiosInstance from '@/lib/axios';
import type { NotifyRequest, SubscribeRequest } from '../types/push';

/**
 * 즉시 알림 발송 (테스트/수동)
 */
export const sendNotification = async (
    userId: number,
    request: NotifyRequest
): Promise<void> => {
    console.log('[sendNotification] 요청 시작:', { userId, request });
    
    try {
        // null 응답을 허용하기 위해 직접 axios 호출
        const response = await axiosInstance.post(
            `/api/push/notify/${userId}`, 
            request
        );
        
        console.log('[sendNotification] 전체 응답:', response);
        console.log('[sendNotification] response.status:', response.status);
        console.log('[sendNotification] response.data:', response.data);
        console.log('[sendNotification] response.data 타입:', typeof response.data);
        
        // 200 OK면 성공으로 간주 (응답 본문이 없거나 빈 문자열이어도 정상)
        if (response.status === 200) {
            const responseData = response.data;
            
            // 응답이 없거나 빈 문자열이면 성공
            if (!responseData || responseData === '' || (typeof responseData === 'string' && responseData.trim() === '')) {
                console.log('[sendNotification] 성공 (응답 없음 또는 빈 문자열)');
                return;
            }
            
            // 객체인 경우 ApiResponse 구조 확인
            if (typeof responseData === 'object') {
                // ApiResponse 구조인지 확인
                if ('success' in responseData) {
                    // ApiResponse 구조
                    if (!responseData.success) {
                        const errorMessage = responseData.message || '알림 전송에 실패했습니다.';
                        console.error('[sendNotification] API 실패:', {
                            errorCode: responseData.errorCode,
                            message: errorMessage,
                        });
                        throw new Error(errorMessage);
                    }
                    // success가 true면 성공
                    console.log('[sendNotification] 성공 (ApiResponse 구조)');
                    return;
                }
            }
            
            // 그 외의 경우도 200이면 성공으로 간주
            console.log('[sendNotification] 성공 (200 OK)');
        } else {
            throw new Error(`알림 전송에 실패했습니다. (상태 코드: ${response.status})`);
        }
    } catch (error) {
        console.error('[sendNotification] 에러 발생:', error);
        // axios 에러인 경우 response 확인
        if ((error as any).response) {
            const errorResponse = (error as any).response;
            console.error('[sendNotification] 에러 응답 상태:', errorResponse.status);
            console.error('[sendNotification] 에러 응답 데이터:', errorResponse.data);
            
            // 에러 응답이 ApiResponse 구조인 경우
            if (errorResponse.data && typeof errorResponse.data === 'object' && 'message' in errorResponse.data) {
                throw new Error(errorResponse.data.message || '알림 전송에 실패했습니다.');
            }
        }
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
    console.log('[subscribePush] 구독 등록 시작:', { userId, endpoint: request.endpoint });
    
    try {
        await apiClient.post<null>(`/api/push/subscribe/${userId}`, request);
        console.log('[subscribePush] 구독 등록 성공');
    } catch (error) {
        console.error('[subscribePush] 구독 등록 실패:', error);
        throw error;
    }
};

