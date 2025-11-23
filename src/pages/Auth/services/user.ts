import { apiClient } from '@/lib/api/apiClient';

/**
 * 사용자 정보 타입
 */
export interface UserInfo {
  id: number;
  name: string;
  phone: string;
  role: 'SENIOR' | 'CAREGIVER';
  code: number;
}

/**
 * 사용자 단건 조회
 * @param userId 사용자 ID
 */
export const getUser = async (userId: number): Promise<UserInfo> => {
  return apiClient.get<UserInfo>(`/api/users/${userId}`);
};

