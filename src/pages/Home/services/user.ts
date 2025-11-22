import { apiClient } from '@/lib/api/apiClient';
import type { UserResponse } from '../types/user';

/**
 * 사용자 단건 조회
 * @param userId 사용자 PK
 */
export const getUser = async (userId: number): Promise<UserResponse> => {
  return apiClient.get<UserResponse>(`/api/users/${userId}`);
};
