/**
 * JWT 토큰 디코딩 유틸리티
 */

/**
 * JWT 토큰의 payload 디코딩
 */
export const decodeJWT = (token: string): any | null => {
  try {
    // JWT는 header.payload.signature 형식
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // payload 부분 디코딩 (base64url)
    const payload = parts[1];
    // base64url을 base64로 변환 (필요한 경우)
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(base64);
    return JSON.parse(decoded);
  } catch (error) {
    console.error('Failed to decode JWT:', error);
    return null;
  }
};

/**
 * JWT 토큰에서 사용자 역할 추출
 * @returns 'SENIOR' | 'CAREGIVER' | null
 */
export const getRoleFromToken = (
  token: string
): 'SENIOR' | 'CAREGIVER' | null => {
  const decoded = decodeJWT(token);
  if (!decoded) {
    return null;
  }

  // role 필드 확인 (대소문자 구분 없이)
  const role = decoded.role || decoded.ROLE || decoded.Role;
  if (role === 'SENIOR' || role === 'CAREGIVER') {
    return role;
  }

  return null;
};

/**
 * JWT 토큰에서 사용자 ID 추출
 */
export const getUserIdFromToken = (token: string): number | null => {
  const decoded = decodeJWT(token);
  if (!decoded) {
    return null;
  }

  // userId, user_id, sub 등 다양한 필드명 확인
  const userId = decoded.userId || decoded.user_id || decoded.sub || decoded.id;
  return userId ? Number(userId) : null;
};
