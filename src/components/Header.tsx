import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, Share2 } from 'lucide-react'; // 뒤로가기 아이콘
import { getAccessToken } from '@/lib/storage';
import { getUserIdFromToken } from '@/lib/jwt';
import { getUser } from '@/pages/Elder/services/user';
import {
  isHomePage,
  isFooterPage,
  getPageTitle,
  ROUTES,
} from '@/constants/routes';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const homePage = isHomePage(location.pathname);
  const footerPage = isFooterPage(location.pathname);
  const title = getPageTitle(location.pathname);
  const isElderHome = location.pathname === ROUTES.ELDER_HOME;
  const isReportPage = location.pathname.startsWith(ROUTES.REPORT);

  // TODO: 보호자 연결 여부는 CaregiverLink API 연동 시 실제 데이터로 교체 필요
  const [hasGuardian] = useState<boolean>(true); // 임시: 보호자 연결 여부
  const [connectionCode, setConnectionCode] = useState<string>(''); // 연결 코드 (User API에서 가져옴)

  // 어르신 홈화면일 때만 사용자 정보 조회
  useEffect(() => {
    if (!isElderHome) {
      return;
    }

    const fetchUserInfo = async () => {
      try {
        const token = getAccessToken();
        if (!token) {
          return;
        }

        const userId = getUserIdFromToken(token);
        if (!userId) {
          return;
        }

        const userData = await getUser(userId);
        setConnectionCode(userData.code.toString());
      } catch (error: any) {
        // 에러 발생 시 기본값 유지 (Header에서는 에러를 조용히 처리)
        // 에러가 발생해도 연결 코드가 표시되지 않을 뿐, 페이지는 정상 작동
        if (error.response) {
          const status = error.response.status;
          if (status === 404 || status === 502) {
            // US001 또는 네트워크 에러는 조용히 처리
          }
        }
      }
    };

    fetchUserInfo();
  }, [isElderHome]);

  return (
    <header className="sticky top-0 z-10 flex items-center min-h-[60px] h-[60px] px-4 py-3 border-b border-gray-200 bg-white flex-shrink-0 pr-6 pl-6">
      {homePage ? (
        // 홈화면: 로고 왼쪽, Elder 홈화면이고 보호자 연결 시 오른쪽에 연결 코드
        // 보호자 홈화면(/home)일 때 오른쪽에 "피보호자 연결 추가하기" 버튼
        <div className="w-full flex items-center">
          <div>
            <img src="/logo.svg" alt="하루온" className="h-8" />
          </div>
          {isElderHome && hasGuardian ? (
            <div className="flex-1 flex justify-end text-lg text-primary">
              연결 코드:
              <span className="font-bold">&nbsp;{connectionCode}</span>
            </div>
          ) : !isElderHome ? (
            // 보호자 홈화면일 때 오른쪽에 연결 추가 버튼
            <div className="flex-1 flex justify-end">
              <button
                onClick={() => navigate('/home/connect')}
                className="cursor-pointer bg-primary text-white text-sm font-semibold rounded-xl py-2 px-4 hover:opacity-90 transition-opacity whitespace-nowrap"
              >
                피보호자 연결 추가하기
              </button>
            </div>
          ) : null}
        </div>
      ) : footerPage ? (
        // Footer 페이지: 제목만 중앙에 (뒤로가기 버튼 없음)
        <h1 className="absolute left-1/2 -translate-x-1/2 text-center font-semibold whitespace-nowrap">
          {title}
        </h1>
      ) : (
        // 다른 페이지: 뒤로가기 + 제목
        <>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-start w-20 h-8 hover:opacity-70"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="absolute left-1/2 -translate-x-1/2 text-center font-semibold whitespace-nowrap">
            {title}
          </h1>
          {isReportPage ? (
            <div className="flex-1 flex justify-end">
              <button
                onClick={() => {
                  // 커스텀 이벤트 발생
                  window.dispatchEvent(new CustomEvent('shareReport'));
                }}
                className="flex items-center justify-center w-8 h-8 hover:opacity-70 cursor-pointer"
                aria-label="리포트 공유하기"
              >
                <Share2 className="w-6 h-6 text-primary" />
              </button>
            </div>
          ) : (
            <div className="w-20" /> // 오른쪽 공간 맞추기
          )}
        </>
      )}
    </header>
  );
};

export default Header;
