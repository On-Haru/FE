import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Profile from '@/pages/MyPage/components/Profile';
import { getAccessToken } from '@/lib/storage';
import { getUserIdFromToken } from '@/lib/jwt';
import { getUser } from '@/pages/Home/services/user';
import { clearTokens } from '@/lib/storage';

const MyPagePage = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const token = getAccessToken();
        if (!token) {
          // 토큰이 없으면 로그인 페이지로 이동
          navigate('/');
          return;
        }

        const userId = getUserIdFromToken(token);
        if (!userId) {
          // userId를 추출할 수 없으면 로그인 페이지로 이동
          navigate('/');
          return;
        }

        // 사용자 정보 조회 (JWT 토큰에서 추출한 userId 사용)
        const userData = await getUser(userId);
        setUserName(userData.name);
      } catch (error: unknown) {
        const err = error as { response?: { status?: number } };
        console.error('사용자 정보 조회 실패:', error);
        
        // 401 에러면 토큰이 만료된 것이므로 로그인 페이지로 이동
        if (err.response?.status === 401) {
          clearTokens();
          navigate('/');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserInfo();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      // 로그아웃 API 호출 (선택사항 - 백엔드에서 로그아웃 엔드포인트가 있다면)
      // 현재는 토큰 삭제만 수행
      // await apiClient.post('/api/auth/logout');
    } catch (error) {
      // 로그아웃 API 실패해도 토큰은 삭제하고 진행
      console.error('로그아웃 API 호출 실패:', error);
    } finally {
      // 토큰 삭제
      clearTokens();
      
      // 로그인 페이지로 이동
      navigate('/');
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex flex-col bg-white items-center justify-center">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col bg-white">
      <Profile name={userName} onLogout={handleLogout} />
      <div className="flex-1" />
    </div>
  );
};

export default MyPagePage;