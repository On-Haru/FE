import { Fragment, useEffect, useCallback } from 'react';
import MobileInstallPrompt from './MobileInstallPrompt';
import { useInstallPrompt } from '@/contexts/InstallPromptContext';

type BeforeInstallPromptEvent = {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  preventDefault(): void;
  prompt(): Promise<void>;
};

export default function AppInstallPrompt() {
  const {
    isVisible,
    deferredPrompt,
    setDeferredPrompt,
    platform,
    hideInstallPrompt,
    showInstallPrompt,
  } = useInstallPrompt();

  const handleInstallClick = () => {
    if (deferredPrompt) {
      // 실제 beforeinstallprompt 이벤트인지 확인 (platforms가 비어있지 않으면 실제 이벤트)
      if (deferredPrompt.platforms.length > 0) {
        // 실제 이벤트인 경우 prompt() 호출
        try {
          deferredPrompt.prompt();
          deferredPrompt.userChoice.then((choiceResult) => {
            setDeferredPrompt(null);
            hideInstallPrompt();

            // 설치가 완료되면 푸시 알림 권한 요청
            if (choiceResult.outcome === 'accepted') {
              console.log('[AppInstallPrompt] PWA 설치 완료, 푸시 알림 권한 요청');
              // 짧은 딜레이 후 푸시 알림 권한 요청 (설치 완료 후 안정화 시간)
              setTimeout(() => {
                requestPushPermission();
              }, 1000);
            }
          });
        } catch (error) {
          // 에러 발생 시 모달 닫고 사용자에게 안내
          hideInstallPrompt();
        }
      } else {
        // 기본값인 경우 (iOS 또는 이벤트가 아직 발생하지 않은 경우)
        // 데스크톱인 경우 주소창 안내, 모바일은 모달 닫기
        if (platform === 'desktop') {
          // 데스크톱에서는 주소창의 설치 아이콘을 클릭하라는 안내를 이미 모달에 표시했으므로 모달만 닫기
          hideInstallPrompt();
        } else {
          hideInstallPrompt();
        }
      }
    }
  };

  // 푸시 알림 권한 요청 함수
  const requestPushPermission = useCallback(async () => {
    try {
      // 브라우저 지원 여부 확인
      if (!('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
        console.log('[AppInstallPrompt] 푸시 알림을 지원하지 않는 브라우저입니다.');
        return;
      }

      // 이미 권한이 있으면 구독 시도
      const permission = Notification.permission;
      if (permission === 'granted') {
        console.log('[AppInstallPrompt] 이미 알림 권한이 있습니다.');
        // Service Worker가 준비되면 구독 시도
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          if (!subscription) {
            console.log('[AppInstallPrompt] 푸시 구독이 없습니다. 페이지 새로고침 후 자동으로 구독됩니다.');
          }
        } catch (error) {
          console.error('[AppInstallPrompt] 푸시 구독 확인 실패:', error);
        }
        return;
      }

      // 권한 요청
      const newPermission = await Notification.requestPermission();
      if (newPermission === 'granted') {
        console.log('[AppInstallPrompt] 푸시 알림 권한이 허용되었습니다.');
        // 페이지 새로고침을 권장하거나 자동으로 구독 시도
        console.log('[AppInstallPrompt] 페이지를 새로고침하면 자동으로 푸시 알림이 활성화됩니다.');
      } else {
        console.log('[AppInstallPrompt] 푸시 알림 권한이 거부되었습니다.');
      }
    } catch (error) {
      console.error('[AppInstallPrompt] 푸시 알림 권한 요청 실패:', error);
    }
  }, []);

  const handleBeforeInstallPrompt = (event: Event) => {
    const installEvent = event as unknown as BeforeInstallPromptEvent;
    installEvent.preventDefault();
    setDeferredPrompt(installEvent);
    // Android에서 이벤트가 발생하면 자동으로 모달 표시
    showInstallPrompt();
  };

  useEffect(() => {
    // beforeinstallprompt 이벤트 리스너 추가
    // 이 이벤트는 브라우저가 자동으로 발생시킵니다 (PWA 조건 만족 시)
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);

    // appinstalled 이벤트 리스너 추가 (PWA 설치 완료 감지)
    const handleAppInstalled = () => {
      console.log('[AppInstallPrompt] PWA 설치 완료 감지');
      hideInstallPrompt();

      // 설치 완료 후 푸시 알림 권한 요청
      setTimeout(() => {
        requestPushPermission();
      }, 1000);
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [setDeferredPrompt, showInstallPrompt, hideInstallPrompt, requestPushPermission]);


  // 모달이 표시되어야 하는지 확인
  const shouldShowModal = isVisible && deferredPrompt;

  // 실제 beforeinstallprompt 이벤트가 있는지 확인
  const hasRealPrompt = deferredPrompt ? deferredPrompt.platforms.length > 0 : false;

  return (
    <Fragment>
      {shouldShowModal && (
        <MobileInstallPrompt
          handleInstallClick={handleInstallClick}
          handleCancelClick={hideInstallPrompt}
          platform={platform}
          hasRealPrompt={hasRealPrompt}
        />
      )}
    </Fragment>
  );
}

