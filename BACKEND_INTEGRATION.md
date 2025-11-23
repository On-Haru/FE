# 백엔드 통합 가이드

*마지막 업데이트: 2025-11-20*

## 📋 백엔드 구현 사항 요약

백엔드에서 다음 사항들이 구현되어 있습니다:

1. **CORS 처리**: 전역 `CorsFilter`로 모든 오리진/헤더/메서드 허용
2. **구독 중복 처리**: 동일 `endpoint`로 재구독 시 자동 upsert (UPDATE)
3. **JWT 기반 인증**: (진행 중) URL path parameter 대신 JWT에서 userId 추출
4. **전역 예외 처리**: `{success, errorCode, message}` 형식 유지

## 🔄 프론트엔드-백엔드 통합 상태

### ✅ 완료된 통합

#### 1. 구독 API (`/api/push/subscribe`)

**현재 상태:**
- 프론트엔드는 JWT 기반과 Path Parameter 방식 모두 지원
- 백엔드에서 중복 구독 자동 처리 (upsert)

**프론트엔드 코드:**
```typescript
// JWT 기반 (권장)
await subscribePush(subscriptionData); // userId 없음

// Path Parameter (하위 호환성)
await subscribePush(subscriptionData, userId);
```

**백엔드 동작:**
- 동일 `endpoint`로 재구독 시 기존 레코드 업데이트
- `findByEndpoint` → `refresh` 메서드로 필드 갱신
- `@Transactional`로 안전하게 처리

**에러 처리:**
- 백엔드에서 자동 처리되므로 프론트엔드는 성공으로 간주
- 500 에러 발생 시 다른 원인일 가능성 (로그 확인 필요)

#### 2. 알림 발송 API (`/api/push/notify`)

**현재 상태:**
- JWT 기반과 Path Parameter 방식 모두 지원

**프론트엔드 코드:**
```typescript
// JWT 기반 (권장)
await sendNotification({ title, body, scheduleId });

// Path Parameter (하위 호환성)
await sendNotification({ title, body, scheduleId }, userId);
```

**백엔드 동작:**
- 사용자별 구독 목록 조회
- `web-push` 라이브러리로 알림 전송
- Gson으로 JSON payload 생성

#### 3. CORS 처리

**백엔드:**
- `WebConfig`에 `addCorsMappings` 설정
- 전역 `CorsFilter` Bean 등록
- Credentials 허용

**프론트엔드:**
- axios 인터셉터에서 JWT 토큰 자동 주입
- CORS 에러 발생 시 백엔드 로그 확인

### 🔄 진행 중인 통합

#### JWT 기반 인증 전환

**목표:**
- URL에서 `userId` 제거
- JWT Bearer 토큰에서 userId 추출

**프론트엔드 준비 상태:**
- ✅ API 함수 시그니처 변경 완료 (userId 선택적)
- ✅ JWT 토큰 자동 주입 (axios 인터셉터)
- ✅ 하위 호환성 유지

**백엔드 전환 필요 사항:**
```java
// 변경 전
@PostMapping("/api/push/subscribe/{userId}")
public ResponseEntity<?> subscribe(@PathVariable Long userId, ...)

// 변경 후
@PostMapping("/api/push/subscribe")
public ResponseEntity<?> subscribe(@RequestBody SubscribeRequest request, Authentication auth) {
    Long userId = getUserIdFromAuth(auth);
    // ...
}
```

## 🐛 트러블슈팅 가이드

### 1. 구독 중복 에러 (해결됨)

**증상:**
- `/api/push/subscribe` 호출 시 500 에러
- `Duplicate entry` 에러 메시지

**원인:**
- 동일 디바이스에서 재구독 시 `endpoint`가 동일
- DB `unique` 제약과 충돌

**해결:**
- 백엔드에서 `findByEndpoint` + `refresh` 로직으로 upsert 처리
- 프론트엔드는 추가 처리 불필요

**확인 방법:**
- 콘솔 로그: `[subscribePush] 구독 등록 성공 (또는 기존 구독 갱신)`
- 백엔드 로그에서 UPDATE 쿼리 확인

### 2. CORS 에러

**증상:**
- 브라우저에서 CORS 에러 표시
- 실제 에러 메시지 확인 불가

**원인:**
- 매핑 실패 시 MVC CORS 체인이 실행되지 않음
- CORS 헤더 누락

**해결:**
- 백엔드에 전역 `CorsFilter` 추가 완료
- 프론트엔드는 추가 처리 불필요

**확인 방법:**
- Network 탭에서 `Access-Control-Allow-*` 헤더 확인
- 실제 에러 메시지 확인 가능

### 3. Bouncy Castle 프로바이더 에러

**증상:**
- 알림 발송 시 `no such provider: BC` 에러
- GL001 에러 코드

**원인:**
- `web-push` 라이브러리가 Bouncy Castle 프로바이더 필요
- JVM에 등록되지 않음

**해결:**
- 백엔드에서 `CryptoConfig` 추가 예정
- `Security.addProvider(new BouncyCastleProvider())` 등록

**프론트엔드 영향:**
- 없음 (백엔드 이슈)

### 4. 알림이 안 뜨는 경우

**확인 사항:**

1. **구독 상태 확인**
   ```javascript
   // 개발자 도구 콘솔에서
   navigator.serviceWorker.ready.then(reg => {
     reg.pushManager.getSubscription().then(sub => {
       console.log('구독 정보:', sub);
     });
   });
   ```

2. **서비스워커 상태 확인**
   - 개발자 도구 → Application → Service Workers
   - 활성화 상태 확인

3. **알림 권한 확인**
   ```javascript
   console.log('알림 권한:', Notification.permission);
   ```

4. **백엔드 로그 확인**
   - 구독 정보가 DB에 저장되었는지
   - 알림 발송 시 에러가 없는지

5. **VAPID 키 확인**
   - 환경 변수 `VITE_VAPID_PUBLIC_KEY` 설정 확인
   - 백엔드와 프론트엔드의 공개 키 일치 확인

## 📝 API 명세

### 구독 등록

**엔드포인트:**
- `POST /api/push/subscribe` (JWT 기반, 권장)
- `POST /api/push/subscribe/{userId}` (Path Parameter, 하위 호환성)

**요청:**
```typescript
{
  endpoint: string;
  expirationTime: number | null;
  keys: {
    p256dh: string;  // base64
    auth: string;    // base64
  };
}
```

**응답:**
- 성공: `{ success: true, data: null }`
- 실패: `{ success: false, errorCode: string, message: string }`

**특이사항:**
- 동일 `endpoint`로 재구독 시 자동으로 UPDATE 처리
- 프론트엔드는 성공으로 처리

### 알림 발송

**엔드포인트:**
- `POST /api/push/notify` (JWT 기반, 권장)
- `POST /api/push/notify/{userId}` (Path Parameter, 하위 호환성)

**요청:**
```typescript
{
  scheduleId?: number;
  title: string;
  body: string;
}
```

**응답:**
- 성공: `{ success: true, data: null }` 또는 빈 응답
- 실패: `{ success: false, errorCode: string, message: string }`

## 🔍 디버깅 체크리스트

### 구독이 안 되는 경우

- [ ] 브라우저가 Push 알림을 지원하는지 확인
- [ ] 알림 권한이 'granted'인지 확인
- [ ] 서비스워커가 등록되어 있는지 확인
- [ ] VAPID 공개 키가 설정되어 있는지 확인
- [ ] JWT 토큰이 유효한지 확인
- [ ] 네트워크 요청이 성공하는지 확인 (Network 탭)
- [ ] 백엔드 로그에서 에러 확인

### 알림이 안 뜨는 경우

- [ ] 구독이 성공했는지 확인
- [ ] 백엔드에서 알림 발송이 성공했는지 확인
- [ ] 서비스워커가 활성화되어 있는지 확인
- [ ] 브라우저 알림 설정 확인
- [ ] HTTPS 환경인지 확인 (localhost 제외)
- [ ] 서비스워커 콘솔 로그 확인

## 🔗 관련 문서

- [PWA_PUSH_FLOW.md](./PWA_PUSH_FLOW.md) - 전체 플로우 설명
- [PWA_PUSH_IMPROVEMENTS.md](./PWA_PUSH_IMPROVEMENTS.md) - 개선 사항
- 백엔드: Push Notification Implementation & Troubleshooting 문서

