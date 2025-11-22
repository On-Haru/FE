import { createPortal } from 'react-dom';
import { X, Download, Share2 } from 'lucide-react';

interface MobileInstallPromptProps {
  handleInstallClick: () => void;
  handleCancelClick: () => void;
  platform: 'ios' | 'android' | 'desktop';
  hasRealPrompt?: boolean; // 실제 beforeinstallprompt 이벤트가 있는지
}

const MobileInstallPrompt = ({
  handleInstallClick,
  handleCancelClick,
  platform,
  hasRealPrompt = false,
}: MobileInstallPromptProps) => {
  const isIOS = platform === 'ios';
  const isDesktop = platform === 'desktop';

  const modalContent = (
    <div
      className="absolute inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={handleCancelClick}
    >
      <div
        className="bg-white rounded-2xl w-[90%] max-w-md p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={handleCancelClick}
          className="absolute cursor-pointer top-4 right-4 text-gray-600 hover:text-gray-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* 제목 */}
        <h2 className="text-xl font-bold text-gray-900 mb-2 pr-8">
          앱 설치하기
        </h2>

        {/* 설명 */}
        <p className="text-base text-gray-700 mb-6">
          {isIOS
            ? '홈 화면에 추가하여 더 빠르고 편리하게 이용하세요.'
            : isDesktop
            ? '앱을 설치하여 더 빠르고 편리하게 이용하세요.'
            : '앱을 설치하여 더 빠르고 편리하게 이용하세요.'}
        </p>

        {/* 데스크톱 설치 방법 안내 */}
        {isDesktop && (
          <div className="bg-primary/5 border border-primary/30 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <Download className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  설치 방법
                </p>
                {hasRealPrompt ? (
                  <p className="text-sm text-gray-700">
                    아래 "설치하기" 버튼을 클릭하거나, 브라우저 주소창 오른쪽의 <strong>설치 아이콘</strong>을 클릭하세요.
                  </p>
                ) : (
                  <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                    <li>브라우저 주소창 오른쪽에 있는 <strong>설치 아이콘</strong>을 클릭하세요</li>
                    <li>설치 아이콘이 보이지 않으면, 페이지를 새로고침하거나 잠시 후 다시 시도해주세요</li>
                    <li>Chrome 또는 Edge 브라우저를 사용하고 있는지 확인해주세요</li>
                  </ol>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 설치 방법 안내 (iOS인 경우) */}
        {isIOS && (
          <div className="bg-primary/5 border border-primary/30 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <Share2 className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  설치 방법
                </p>
                <ol className="text-sm text-gray-700 space-y-1 list-decimal list-inside">
                  <li>하단 공유 버튼을 누르세요</li>
                  <li>"홈 화면에 추가"를 선택하세요</li>
                  <li>추가 버튼을 눌러 완료하세요</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* 버튼들 */}
        <div className="flex gap-3">
          {isIOS ? (
            <button
              onClick={handleCancelClick}
              className="flex-1 px-4 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/80 transition-colors flex items-center justify-center gap-2"
            >
              <Share2 className="w-5 h-5" />
              공유 메뉴 열기
            </button>
          ) : (
            <button
              onClick={handleInstallClick}
              disabled={isDesktop && !hasRealPrompt}
              className={`flex-1 px-4 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                isDesktop && !hasRealPrompt
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary text-white hover:bg-primary/80'
              }`}
            >
              <Download className="w-5 h-5" />
              {isDesktop && !hasRealPrompt ? '주소창 아이콘 사용' : '설치하기'}
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // mobile-content 요소 찾기
  const mobileContent = document.querySelector('.mobile-content');
  if (mobileContent) {
    return createPortal(modalContent, mobileContent);
  }

  return modalContent;
};

export default MobileInstallPrompt;

