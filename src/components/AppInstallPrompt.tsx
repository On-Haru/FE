import { Fragment, useEffect } from 'react';
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
          deferredPrompt.userChoice.then(() => {
            setDeferredPrompt(null);
            hideInstallPrompt();
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

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    };
  }, [setDeferredPrompt, showInstallPrompt]);


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

