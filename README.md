# 프로젝트 개요

React + TypeScript + Vite 기반 프론트엔드 프로젝트입니다.

## 기술 스택

- React 19.2.0
- TypeScript 5.9.3
- Vite 7.2.2
- TailwindCSS 4.1.17
- React Router 7.9.6
- Axios 1.13.2
- PWA (vite-plugin-pwa)

## 시작하기

### 설치

```bash
pnpm install
```

### 개발 서버 실행

```bash
pnpm dev
```

### 빌드

```bash
pnpm build
```

### 미리보기

```bash
pnpm preview
```

## 프로젝트 구조

```
src/
├── lib/              # 유틸리티 및 라이브러리
│   ├── axios.ts      # Axios 인스턴스 (JWT 인터셉터)
│   └── storage.ts    # 토큰 저장/조회 유틸
├── pages/            # 페이지 컴포넌트
│   ├── Calendar/
│   ├── Elder/
│   ├── Home/
│   ├── Login/
│   ├── MedicineDetail/
│   ├── MedicineList/
│   ├── MedicineRegister/
│   ├── MyPage/
│   └── Report/
└── App.tsx           # 라우터 설정
```

## 주요 설정

### Path Alias

`@/` 별칭으로 `src/` 디렉토리를 참조할 수 있습니다.

```typescript
import { getAccessToken } from '@/lib/storage'
```

### TailwindCSS

- Primary 색상: `#36C8B7`
- Secondary 색상: `#FF9090`

CSS 변수로 사용 가능:
```css
color: var(--color-primary);
color: var(--color-secondary);
```

### Axios 설정

`src/lib/axios.ts`에서 JWT 토큰이 자동으로 요청 헤더에 추가됩니다.

- Access Token은 `localStorage`에 저장됩니다
- 401 에러 발생 시 토큰이 자동으로 삭제됩니다

### 환경 변수

`.env` 파일에 다음 변수를 설정하세요:

```
VITE_API_BASE_URL=your_api_url
```

## 라우팅

- `/` - HomePage
- `/login` - LoginPage
- `/calendar` - CalendarPage
- `/elder` - ElderPage
- `/medicine` - MedicineListPage
- `/medicine/:id` - MedicineDetailPage
- `/medicine/register` - MedicineRegisterPage
- `/mypage` - MyPagePage
- `/report` - ReportPage

## 코드 스타일

- Prettier 설정 파일: `.prettierrc`
- ESLint 설정: `eslint.config.js`

## 배포

Vercel 배포 설정이 포함되어 있습니다. `vercel.json` 파일을 확인하세요.