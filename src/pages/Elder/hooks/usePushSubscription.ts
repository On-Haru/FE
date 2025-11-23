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

  // 알림 권한 상태 확인
  useEffect(() => {
    if (!state.isSupported) {
      return;
    }

    const checkPermission = () => {
      if ('Notification' in window) {
        const permission = Notification.permission;
        console.log('[usePushSubscription] 알림 권한 상태:', permission);

        if (permission === 'denied') {
          setState((prev) => ({
            ...prev,
            error:
              '알림 권한이 차단되었습니다. 브라우저 설정에서 알림 권한을 허용해주세요.',
          }));
        }
      }
    };

    checkPermission();
  }, [state.isSupported]);

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
      // 1. 알림 권한 확인 및 요청
      let permission = Notification.permission;

      // 권한이 차단된 경우
      if (permission === 'denied') {
        setState((prev) => ({
          ...prev,
          isSubscribing: false,
          error:
            '알림 권한이 차단되었습니다. 브라우저 주소창 옆의 자물쇠 아이콘을 클릭하여 알림 권한을 허용해주세요.',
        }));
        return false;
      }

      // 권한이 없으면 요청
      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }

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
        const keyArray = urlBase64ToUint8Array(vapidPublicKey);
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: keyArray as BufferSource,
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

      // 8. 서버에 구독 정보 전송
      await subscribePush(userId, subscriptionData);

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
