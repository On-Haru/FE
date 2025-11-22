/**
 * CaregiverLink 생성 요청 타입
 */
export interface CreateCaregiverLinkRequest {
  /** 피보호자 휴대폰 번호 (하이픈 없는 숫자 문자열) */
  phoneNumber: string;
  /** 피보호자 앱에서 생성한 인증 코드 */
  code: number;
}

/**
 * CaregiverLink 응답 데이터 타입
 */
export interface CaregiverLinkResponse {
  /** CaregiverLink ID */
  id: number;
  /** 보호자 ID */
  caregiverId: number;
  /** 피보호자 ID */
  seniorId: number;
}
