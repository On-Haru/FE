import { useState, useEffect } from 'react';
import { getAccessToken } from '@/lib/storage';
import { getUserIdFromToken } from '@/lib/jwt';
import { getUser } from '../services/user';

export const useUser = () => {
  const [userName, setUserName] = useState<string>('');
  const [connectionCode, setConnectionCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = getAccessToken();
        if (!token) {
          setError('로그인이 필요합니다.');
          return;
        }

        const userId = getUserIdFromToken(token);
        if (!userId) {
          setError('사용자 정보를 불러올 수 없습니다.');
          return;
        }

        // 사용자 정보 조회
        const userData = await getUser(userId);
        setUserName(userData.name);
        setConnectionCode(userData.code.toString());
      } catch (error: any) {
        // 에러 응답 처리
        if (error.response) {
          const status = error.response.status;
          const errorData = error.response.data;
          const errorCode = errorData?.errorCode;
          const errorMessage = errorData?.message;

          if (status === 404) {
            if (errorCode === 'US001') {
              setError('유저가 존재하지 않습니다.');
            } else {
              setError(errorMessage || '사용자 정보를 찾을 수 없습니다.');
            }
          } else if (status === 502) {
            setError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
          } else {
            setError(errorMessage || '사용자 정보를 불러오는데 실패했습니다.');
          }
        } else {
          // 네트워크 에러 또는 기타 에러
          setError(error.message || '사용자 정보를 불러오는데 실패했습니다.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, []);

  return { userName, connectionCode, isLoading, error };
};
