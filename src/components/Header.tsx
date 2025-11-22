import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react'; // 뒤로가기 아이콘
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

  // TODO: API 연동 시 실제 보호자 연결 여부 및 연결 코드로 교체
  const hasGuardian = true; // 임시: 보호자 연결 여부
  const connectionCode = '0837'; // 임시: 연결 코드

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
          <div className="w-20" /> {/* 오른쪽 공간 맞추기 */}
        </>
      )}
    </header>
  );
};

export default Header;
