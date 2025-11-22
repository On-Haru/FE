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
