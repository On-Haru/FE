// 경로 상수
export const ROUTES = {
  HOME: '/',
  ELDER_HOME: '/elder',
  CALENDAR: '/calendar',
  MEDICINE: '/medicine',
  MEDICINE_REGISTER: '/medicine/register',
  MEDICINE_DETAIL: '/medicine/:id',
  MYPAGE: '/mypage',
  REPORT: '/report',
} as const;

// Footer에 표시되는 경로들
export const FOOTER_ROUTES = [
  ROUTES.HOME,
  ROUTES.CALENDAR,
  ROUTES.MEDICINE_REGISTER,
  ROUTES.MYPAGE,
] as const;

// 페이지 제목 매핑
export const PAGE_TITLES: Record<string, string> = {
  [ROUTES.CALENDAR]: '복약 현황',
  [ROUTES.MEDICINE]: '처방전',
  [ROUTES.MEDICINE_REGISTER]: '약 등록하기',
  [ROUTES.MYPAGE]: '마이페이지',
  [ROUTES.REPORT]: '리포트',
};

// 페이지 제목 가져오기 함수
export const getPageTitle = (pathname: string): string => {
  // 정확한 경로 매칭
  if (PAGE_TITLES[pathname]) {
    return PAGE_TITLES[pathname];
  }

  // 동적 경로 처리 (/medicine/:id 같은 경우)
  if (pathname.startsWith('/medicine/')) {
    return '약 확인하기';
  }

  return '';
};

// Footer 페이지인지 확인
export const isFooterPage = (pathname: string): boolean => {
  // FOOTER_ROUTES에 명시적으로 포함된 경로만 Footer 페이지
  return (FOOTER_ROUTES as readonly string[]).includes(pathname);
};

// 홈 페이지인지 확인
export const isHomePage = (pathname: string): boolean => {
  return pathname === ROUTES.HOME || pathname === ROUTES.ELDER_HOME;
};
