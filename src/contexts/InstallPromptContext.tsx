import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

type BeforeInstallPromptEvent = {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    preventDefault(): void;
    prompt(): Promise<void>;
};

type Platform = 'ios' | 'android' | 'desktop';

interface InstallPromptContextType {
    showInstallPrompt: () => void;
    hideInstallPrompt: () => void;
    isVisible: boolean;
    deferredPrompt: BeforeInstallPromptEvent | null;
    setDeferredPrompt: (prompt: BeforeInstallPromptEvent | null) => void;
    platform: Platform;
}

const InstallPromptContext = createContext<InstallPromptContextType | undefined>(undefined);

export const useInstallPrompt = () => {
    const context = useContext(InstallPromptContext);
    if (!context) {
        throw new Error('useInstallPrompt must be used within InstallPromptProvider');
    }
    return context;
};

interface InstallPromptProviderProps {
    children: ReactNode;
}

const defaultBeforeInstallPromptEvent: BeforeInstallPromptEvent = {
    platforms: [],
    userChoice: Promise.resolve({ outcome: 'dismissed', platform: '' }),
    prompt: () => Promise.resolve(),
    preventDefault: () => { },
};

const isIOSPromptActive = () => {
    const isActive = JSON.parse(localStorage.getItem('iosInstalled') || 'true');
    if (isActive) {
        return defaultBeforeInstallPromptEvent;
    }
    return null;
};

// 플랫폼 감지 함수
const detectPlatform = (): Platform => {
    const userAgent = window.navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);

    if (isIOS) return 'ios';
    if (isAndroid) return 'android';
    return 'desktop'; // 데스크톱 (크롬, Edge 등)
};

export const InstallPromptProvider = ({ children }: InstallPromptProviderProps) => {
    const platform = detectPlatform();
    const isDeviceIOS = platform === 'ios';
    const [isVisible, setIsVisible] = useState(false);
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
        null
    );

    // iOS인 경우 초기 로드 시 자동으로 모달 표시 (localStorage 확인)
    useEffect(() => {
        if (isDeviceIOS) {
            const iosPrompt = isIOSPromptActive();
            if (iosPrompt) {
                setDeferredPrompt(iosPrompt);
                setIsVisible(true);
            }
        }
    }, [isDeviceIOS]);

    const showInstallPrompt = () => {
        console.log('showInstallPrompt called', { platform, isDeviceIOS, deferredPrompt });

        // iOS인 경우 - 사용자가 직접 클릭했으므로 localStorage 체크 무시하고 항상 표시
        if (isDeviceIOS) {
            console.log('iOS - forcing prompt display');
            setDeferredPrompt(defaultBeforeInstallPromptEvent);
            setIsVisible(true);
        } else {
            // Android/Desktop인 경우
            // deferredPrompt가 있으면 그대로 사용, 없으면 기본값 설정
            const promptToUse = deferredPrompt || defaultBeforeInstallPromptEvent;
            console.log('Setting prompt:', promptToUse);
            setDeferredPrompt(promptToUse);
            setIsVisible(true);
        }
    };

    const hideInstallPrompt = () => {
        setIsVisible(false);
        if (isDeviceIOS) {
            localStorage.setItem('iosInstalled', 'false');
            setDeferredPrompt(null);
        }
    };

    return (
        <InstallPromptContext.Provider
            value={{
                showInstallPrompt,
                hideInstallPrompt,
                isVisible,
                deferredPrompt,
                setDeferredPrompt,
                platform,
            }}
        >
            {children}
        </InstallPromptContext.Provider>
    );
};

