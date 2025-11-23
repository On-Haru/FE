# PWA Push Notification 개선 사항

## ✅ 완료된 개선 사항

### 1. JWT 기반 인증 전환 준비

**변경 전:**
```typescript
// URL path parameter로 userId 전달
POST /api/push/subscribe/{userId}
POST /api/push/notify/{userId}
```

**변경 후:**
```typescript
// JWT Bearer 토큰으로 인증 (userId는 선택적, 하위 호환성 유지)
POST /api/push/subscribe
POST /api/push/notify

// 또는 기존 방식도 지원 (하위 호환성)
POST /api/push/subscribe/{userId}
POST /api/push/notify/{userId}
```

**주요 변경 파일:**
- `src/pages/Detail/services/push.ts`
  - `subscribePush(request, userId?)` - userId를 선택적 파라미터로 변경
  - `sendNotification(request, userId?)` - userId를 선택적 파라미터로 변경
- `src/pages/Elder/hooks/usePushSubscription.ts`
  - JWT 토큰이 있으면 userId 없이 호출 (백엔드가 JWT에서 추출)
- `src/pages/Detail/components/ChecklistModal.tsx`
  - 새로운 API 시그니처에 맞게 수정

**장점:**
- 보안 강화: URL에 userId 노출 방지
- RESTful API 설계 개선
- 하위 호환성 유지 (기존 방식도 지원)

### 2. 서비스워커 개선

**추가된 기능:**
- `install` 이벤트: `skipWaiting()`으로 즉시 활성화
- `activate` 이벤트: `clients.claim()`으로 즉시 클라이언트 제어
- 상세한 로깅 추가

**파일:** `src/sw.ts`

### 3. 디버깅 로그 강화

**추가된 로그:**
- 서비스워커 등록 상태
- 브라우저 지원 여부 확인
- 구독 프로세스 각 단계별 로그
- 에러 발생 시 상세 정보

**파일:**
- `src/main.tsx`
- `src/pages/Elder/hooks/usePushSubscription.ts`
- `src/sw.ts`

---

## 🔄 백엔드 전환 가이드

### 현재 상태 (하위 호환성 유지)

프론트엔드는 두 가지 방식을 모두 지원:
1. **JWT 기반** (권장): `POST /api/push/subscribe`, `POST /api/push/notify`
2. **Path Parameter** (기존): `POST /api/push/subscribe/{userId}`, `POST /api/push/notify/{userId}`

### 백엔드 변경 사항

#### 1. 엔드포인트 변경

**변경 전:**
```java
@PostMapping("/api/push/subscribe/{userId}")
public ResponseEntity<?> subscribe(@PathVariable Long userId, @RequestBody SubscribeRequest request)

@PostMapping("/api/push/notify/{userId}")
public ResponseEntity<?> notify(@PathVariable Long userId, @RequestBody NotifyRequest request)
```

**변경 후:**
```java
@PostMapping("/api/push/subscribe")
public ResponseEntity<?> subscribe(@RequestBody SubscribeRequest request, Authentication authentication)

@PostMapping("/api/push/notify")
public ResponseEntity<?> notify(@RequestBody NotifyRequest request, Authentication authentication)
```

#### 2. JWT에서 userId 추출

```java
// Spring Security의 Authentication에서 userId 추출
Long userId = ((UserPrincipal) authentication.getPrincipal()).getId();

// 또는 JWT 토큰에서 직접 추출
String token = extractTokenFromRequest(request);
Long userId = jwtTokenProvider.getUserIdFromToken(token);
```

#### 3. 하위 호환성 유지 (선택적)

기존 엔드포인트를 유지하면서 새 엔드포인트 추가:

```java
// 새 엔드포인트 (JWT 기반)
@PostMapping("/api/push/subscribe")
public ResponseEntity<?> subscribe(@RequestBody SubscribeRequest request, Authentication auth) {
    Long userId = getUserIdFromAuth(auth);
    return pushService.subscribe(userId, request);
}

// 기존 엔드포인트 (하위 호환성)
@PostMapping("/api/push/subscribe/{userId}")
@Deprecated
public ResponseEntity<?> subscribeLegacy(@PathVariable Long userId, @RequestBody SubscribeRequest request) {
    return pushService.subscribe(userId, request);
}
```

---

## 📋 향후 개선 계획

### 1. 알림 히스토리 저장

**현재:** 메모리에만 저장 (새로고침 시 사라짐)

**개선 방안:**
- IndexedDB에 알림 히스토리 저장
- 서버에 알림 발송 기록 저장
- 알림 센터 UI 추가

### 2. 환경 변수 분리

**현재:**
```env
VITE_VAPID_PUBLIC_KEY=...
```

**개선 방안:**
```env
# 개발 환경
VITE_VAPID_PUBLIC_KEY_DEV=...

# 프로덕션 환경
VITE_VAPID_PUBLIC_KEY_PROD=...
```

### 3. API 클라이언트 계층 개선

**현재:** `apiClient`와 `axiosInstance` 혼용

**개선 방안:**
- 모든 API 호출을 `apiClient`로 통일
- 공통 에러 처리 강화
- 타입 안정성 개선

### 4. 알림 설정 UI

**추가 기능:**
- 알림 on/off 토글
- 알림 시간 설정
- 알림 소리 설정
- 알림 카테고리별 설정

---

## 🧪 테스트 방법

### 1. JWT 기반 인증 테스트

1. 로그인하여 JWT 토큰 획득
2. ElderHomePage 접속 (자동 구독)
3. 개발자 도구 → Network 탭에서 요청 확인
   - URL에 userId가 없어야 함
   - Authorization 헤더에 Bearer 토큰이 있어야 함

### 2. 하위 호환성 테스트

1. 기존 방식으로도 동작하는지 확인
2. ChecklistModal에서 수동 알림 발송 테스트

### 3. 서비스워커 테스트

1. 개발자 도구 → Application → Service Workers
2. 서비스워커가 활성화되어 있는지 확인
3. 콘솔에서 로그 확인

---

## 📝 마이그레이션 체크리스트

### 프론트엔드 ✅
- [x] API 함수 시그니처 변경 (userId 선택적)
- [x] JWT 토큰 자동 주입 확인
- [x] 하위 호환성 유지
- [x] 로깅 강화

### 백엔드 (예정)
- [ ] JWT 기반 엔드포인트 추가
- [ ] JWT에서 userId 추출 로직 구현
- [ ] 기존 엔드포인트 Deprecated 처리 (선택적)
- [ ] 테스트 및 검증

### 문서화
- [x] 개선 사항 문서 작성
- [ ] API 문서 업데이트
- [ ] 팀 공유

---

## 🔗 관련 문서

- [PWA_PUSH_FLOW.md](./PWA_PUSH_FLOW.md) - 전체 플로우 설명
- [Push Notification Guide](./PWA_PUSH_FLOW.md#5-사용-방법-요약) - 원본 가이드

