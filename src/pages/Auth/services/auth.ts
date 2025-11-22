import { apiClient } from '@/lib/api/apiClient';
import type {
  SignupRequest,
  SignupResponse,
  LoginRequest,
  LoginResponse,
} from '../types/auth';

/**
 * 회원가입
 */
export const signup = async (
  request: SignupRequest
): Promise<SignupResponse> => {
  return apiClient.post<SignupResponse>('/api/auth/signup', request);
};

/**
 * 로그인
 */
export const login = async (request: LoginRequest): Promise<LoginResponse> => {
  return apiClient.post<LoginResponse>('/api/auth/login', request);
};
