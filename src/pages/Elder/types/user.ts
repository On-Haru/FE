/**
 * User API 응답 데이터 타입
 */
export interface UserResponse {
  /** 사용자 PK */
  id: number;
  /** 사용자 이름 */
  name: string;
  /** 휴대폰 번호 (숫자 문자열) */
  phone: string;
  /** 사용자 역할 (SENIOR 또는 CAREGIVER) */
  role: 'SENIOR' | 'CAREGIVER';
  /** 피보호자 인증 코드 (케어링크 생성에 사용) */
  code: number;
}
