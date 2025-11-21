// 경로 상수
export const ROUTES = {
  HOME: '/',
  ELDER_HOME: '/elder',
  DETAIL: '/detail/:id',
  MEDICINE: '/medicine',
  MEDICINE_REGISTER: '/medicine/register',
  MEDICINE_DETAIL: '/medicine/:id',
  MYPAGE: '/mypage',
  REPORT: '/report',
  ROLE_SELECT: '/role-select',
  ELDER_AUTH_SELECT: '/elder/auth-select',
  CAREGIVER_AUTH_SELECT: '/caregiver/auth-select',
} as const;

// Footer에 표시되는 경로들
export const FOOTER_ROUTES = [
  ROUTES.HOME,
  ROUTES.DETAIL,
  ROUTES.MEDICINE_REGISTER,
  ROUTES.MYPAGE,
] as const;

// 페이지 제목 매핑
export const PAGE_TITLES: Record<string, string> = {
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

  // 동적 경로 처리 (/detail/:id 같은 경우)
  if (pathname.startsWith('/detail/')) {
    return '노인 상세';
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
  return pathname === '/home' || pathname === ROUTES.ELDER_HOME;
};

export const isAuthPage = (pathname: string): boolean => {
  return (
    pathname === ROUTES.ROLE_SELECT ||
    pathname === ROUTES.ELDER_AUTH_SELECT ||
    pathname === ROUTES.CAREGIVER_AUTH_SELECT ||
    pathname.startsWith('/signup') ||
    pathname.startsWith('/login') ||
    pathname.includes('/auth-select')
  );
};
