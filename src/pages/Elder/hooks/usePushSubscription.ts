import { useState, useEffect, useCallback } from 'react';
import { getUserIdFromToken } from '@/lib/jwt';
import { getAccessToken } from '@/lib/storage';
import { subscribePush } from '@/pages/Detail/services/push';
import type { SubscribeRequest } from '@/pages/Detail/types/push';

interface PushSubscriptionState {
  isSupported: boolean;
  isSubscribed: boolean;
  isSubscribing: boolean;
  error: string | null;
}

/**
 * Push 알림 구독 커스텀 훅
 */
export const usePushSubscription = () => {
  const [state, setState] = useState<PushSubscriptionState>({
    isSupported: false,
    isSubscribed: false,
    isSubscribing: false,
    error: null,
  });

  // 브라우저 지원 여부 확인
  useEffect(() => {
    const checkSupport = () => {
      const isSupported =
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window;

      setState((prev) => ({ ...prev, isSupported }));
    };

    checkSupport();
  }, []);

  // 현재 구독 상태 확인
  useEffect(() => {
    const checkSubscription = async () => {
      if (!state.isSupported) {
        return;
      }

      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setState((prev) => ({
          ...prev,
          isSubscribed: subscription !== null,
        }));
      } catch (error) {
        // 구독 상태 확인 실패는 조용히 처리
      }
    };

    if (state.isSupported) {
      checkSubscription();
    }
  }, [state.isSupported]);

  /**
   * Push 구독 등록
   */
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!state.isSupported) {
      setState((prev) => ({
        ...prev,
        error: '브라우저가 Push 알림을 지원하지 않습니다.',
      }));
      return false;
    }

    setState((prev) => ({ ...prev, isSubscribing: true, error: null }));

    try {
      // 1. 알림 권한 요청
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        setState((prev) => ({
          ...prev,
          isSubscribing: false,
          error: '알림 권한이 거부되었습니다.',
        }));
        return false;
      }

      // 2. Service Worker 등록 확인
      const registration = await navigator.serviceWorker.ready;

      // 3. VAPID 공개 키 가져오기 (환경 변수에서)
      const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        setState((prev) => ({
          ...prev,
          isSubscribing: false,
          error: 'VAPID 공개 키가 설정되지 않았습니다.',
        }));
        return false;
      }

      // 4. 기존 구독 확인
      let subscription = await registration.pushManager.getSubscription();

      // 5. 구독이 없으면 새로 생성
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });
      }

      // 6. 구독 정보를 서버에 전송
      const token = getAccessToken();
      if (!token) {
        setState((prev) => ({
          ...prev,
          isSubscribing: false,
          error: '로그인이 필요합니다.',
        }));
        return false;
      }

      const userId = getUserIdFromToken(token);
      if (!userId) {
        setState((prev) => ({
          ...prev,
          isSubscribing: false,
          error: '사용자 정보를 불러올 수 없습니다.',
        }));
        return false;
      }

      // 7. 구독 정보를 서버 형식으로 변환
      const subscriptionData: SubscribeRequest = {
        endpoint: subscription.endpoint,
        expirationTime: subscription.expirationTime,
        keys: {
          p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
          auth: arrayBufferToBase64(subscription.getKey('auth')!),
        },
      };

      console.log('[usePushSubscription] 구독 정보:', {
        endpoint: subscriptionData.endpoint,
        hasKeys: !!subscriptionData.keys,
        userId,
      });

      // 8. 서버에 구독 정보 전송
      await subscribePush(userId, subscriptionData);
      console.log('[usePushSubscription] 구독 등록 완료');

      setState((prev) => ({
        ...prev,
        isSubscribed: true,
        isSubscribing: false,
        error: null,
      }));

      return true;
    } catch (error: any) {
      setState((prev) => ({
        ...prev,
        isSubscribing: false,
        error: error.message || 'Push 구독에 실패했습니다.',
      }));
      return false;
    }
  }, [state.isSupported]);

  return {
    ...state,
    subscribe,
  };
};

/**
 * VAPID 공개 키를 Uint8Array로 변환
 * (base64url 형식의 VAPID 키를 변환)
 */
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * ArrayBuffer를 base64 문자열로 변환
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}
