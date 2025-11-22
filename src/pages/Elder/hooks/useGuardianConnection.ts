import { useState, useEffect } from 'react';
import { getAccessToken } from '@/lib/storage';
import { hasCaregiverLink } from '@/pages/Home/services/caregiverLink';

export const useGuardianConnection = (isLoadingUser: boolean) => {
  const [hasGuardian, setHasGuardian] = useState<boolean>(false);

  // 초기 보호자 연결 여부 확인
  useEffect(() => {
    if (isLoadingUser) {
      return;
    }

    const checkInitialConnection = async () => {
      try {
        const hasLink = await hasCaregiverLink();
        setHasGuardian(hasLink);
      } catch (linkError: any) {
        // 연결 여부 확인 실패 시 보호자 미연결로 처리
        setHasGuardian(false);
      }
    };

    checkInitialConnection();
  }, [isLoadingUser]);

  // 보호자 미연결 상태일 때 주기적으로 연결 여부 확인 (폴링)
  useEffect(() => {
    // 보호자가 이미 연결되어 있으면 폴링 불필요
    if (hasGuardian || isLoadingUser) {
      return;
    }

    const checkGuardianConnection = async () => {
      try {
        const token = getAccessToken();
        if (!token) {
          return;
        }

        const hasLink = await hasCaregiverLink();

        if (hasLink) {
          setHasGuardian(true);
        }
      } catch (error: any) {
        // 에러 발생 시 조용히 처리 (다음 폴링에서 다시 시도)
      }
    };

    // 초기 확인
    checkGuardianConnection();

    // 5초마다 연결 여부 확인
    const interval = setInterval(checkGuardianConnection, 5000);

    return () => clearInterval(interval);
  }, [hasGuardian, isLoadingUser]);

  return { hasGuardian, setHasGuardian };
};
