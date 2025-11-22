## 작업 내용 요약

피보호자 홈화면 UI 개선 - 모달 크기 및 요소 배치 최적화

## 변경 사항

### UI 개선

- **약 복용 알림 모달**: 모달 높이 증가 및 내부 요소 크기 확대
  - 모달 최소 높이 `min-h-[400px]`로 설정
  - 제목 텍스트 크기 확대 (`text-3xl` → `text-4xl`)
  - 약 정보 아이콘 크기 확대 (`w-16 h-16` → `w-24 h-24`)
  - 약 이름 텍스트 크기 확대 (`text-xl` → `text-2xl`)
  - 복용 완료 버튼 크기 확대 (`w-24 h-24` → `w-40 h-40`)
  - 버튼 텍스트 크기 확대 (`text-lg` → `text-3xl`)
  - 요소 간 간격 조정 (`mb-6` → `mb-8`, `gap-4` → `gap-6`)

- **날짜/시간 표시**: 날짜와 시간을 좌우 끝으로 배치
  - 날짜는 왼쪽 끝, 시간은 오른쪽 끝에 배치
  - `flex justify-between` 레이아웃 적용

### 스타일 통일

- **rounded 스타일 통일**: 여러 컴포넌트의 border-radius를 `rounded-2xl`에서 `rounded-xl`로 통일
  - `GreetingCard.tsx`
  - `MissedMedicationAlert.tsx`
  - `TodayMedicationCard.tsx`

### 코드 개선

- 모달을 프로젝트 패턴에 맞게 변경 (`fixed` → `absolute`)

## 스크린샷 (선택)

<!-- UI 변경이 있으면 첨부 -->

## 관련 이슈

closes #6
