import axios from 'axios';

/**
 * API 에러 코드별 사용자 메시지 매핑
 */
const API_ERROR_MESSAGES: Record<string, string> = {
  US003: '피보호자 정보가 일치하지 않습니다.',
  CG001: '이미 등록된 보호자입니다.',
  CG002: '연결 해제 권한이 없습니다.',
  AU001: '인증 토큰이 필요합니다. 다시 로그인해주세요.',
  AU002: '유효하지 않은 토큰입니다. 다시 로그인해주세요.',
  US004: '피보호자를 찾을 수 없습니다.',
  US001: '유저가 존재하지 않습니다.',
};

/**
 * API 에러를 사용자 친화적인 메시지로 변환
 * @param error 에러 객체
 * @returns 사용자에게 표시할 에러 메시지
 */
export const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error) && error.response) {
    const { status, data } = error.response;
    const { errorCode, message } = data || {};

    // 에러 코드가 있고 매핑된 메시지가 있으면 반환
    if (errorCode && API_ERROR_MESSAGES[errorCode]) {
      return API_ERROR_MESSAGES[errorCode];
    }

    // API에서 제공한 메시지가 있으면 반환
    if (message) {
      return message;
    }

    // 특정 상태 코드에 대한 기본 메시지
    if (status === 502) {
      return '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.';
    }

    // 일반적인 HTTP 에러 메시지
    return `요청에 실패했습니다. (오류 코드: ${status})`;
  }

  // 일반 Error 객체인 경우
  if (error instanceof Error) {
    return error.message || '알 수 없는 오류가 발생했습니다.';
  }

  // 기타 에러
  return '알 수 없는 오류가 발생했습니다.';
};
