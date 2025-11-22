// 회원가입 요청 타입
export interface SignupRequest {
  name: string;
  phone: string; // 하이픈 없는 전화번호
  year: string; // 출생년도 문자열
  password: string;
  role: 'SENIOR' | 'CAREGIVER';
}

// 회원가입 응답 데이터 타입
export interface SignupResponse {
  userId: number;
  token: null;
}

// 로그인 요청 타입
export interface LoginRequest {
  phone: string; // 하이픈 없는 전화번호
  password: string;
}

// 로그인 응답 데이터 타입
export interface LoginResponse {
  userId: number;
  token: string;
}
