import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react'; // 뒤로가기 아이콘

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const footerPaths = ['/', '/calendar', '/medicine', '/mypage'];

  const isHomePage =
    location.pathname === '/' || location.pathname === '/elder';

  const isFooterPage =
    footerPaths.includes(location.pathname) ||
    location.pathname.startsWith('/medicine');

  const getTitle = () => {
    const path = location.pathname;

    if (path === '/calendar') return '복약 현황';
    if (path === '/medicine') return '처방전';
    if (path === '/medicine/:id') return '약 확인하기';
    if (path === '/medicine/register') return '약 등록하기';
    if (path === '/mypage') return '마이페이지';
    if (path === '/report') return '리포트';
    return '';
  };

  return (
    <header className="sticky top-0 z-10 flex items-center h-15 px-4 py-3 border-b border-gray-200 bg-white">
      {isHomePage ? (
        // 홈화면: 로고만 중앙에
        <div className="flex-1 flex justify-center">
          <img src="/logo.svg" alt="하루온" className="h-8" />
        </div>
      ) : isFooterPage ? (
        // Footer 페이지: 제목만 중앙에 (뒤로가기 버튼 없음))
        <h1 className="absolute left-1/2 -translate-x-1/2 text-center font-semibold whitespace-nowrap">
          {getTitle()}
        </h1>
      ) : (
        // 다른 페이지: 뒤로가기 + 제목
        <>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-start w-20 h-8 hover:opacity-70"
            style={{ paddingLeft: '8px' }}
          >
            <ChevronLeft className="w-6 h-6" style={{ marginLeft: '8px' }} />
          </button>
          <h1 className="absolute left-1/2 -translate-x-1/2 text-center font-semibold whitespace-nowrap">
            {getTitle()}
          </h1>
          <div className="w-20" /> {/* 오른쪽 공간 맞추기 */}
        </>
      )}
    </header>
  );
};

export default Header;
