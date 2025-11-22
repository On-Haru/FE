import { apiClient } from '@/lib/api/apiClient';
import type {
  CreateCaregiverLinkRequest,
  CaregiverLinkResponse,
} from '../types/caregiverLink';

/**
 * CaregiverLink 생성 (보호자가 피보호자 연결)
 */
export const createCaregiverLink = async (
  request: CreateCaregiverLinkRequest
): Promise<CaregiverLinkResponse> => {
  return apiClient.post<CaregiverLinkResponse>('/api/caregiver-links', request);
};

/**
 * 보호자별 피보호자 목록 조회
 */
export const getCaregiverLinks = async (): Promise<CaregiverLinkResponse[]> => {
  return apiClient.get<CaregiverLinkResponse[]>('/api/caregiver-links');
};

/**
 * CaregiverLink 삭제 (연결 해제)
 * @param linkId 삭제할 연결 ID
 */
export const deleteCaregiverLink = async (linkId: number): Promise<null> => {
  return apiClient.delete<null>(`/api/caregiver-links/${linkId}`);
};
