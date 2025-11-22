import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse, type AxiosError } from 'axios';
import { getAccessToken, clearTokens } from './storage';

/**
 * axios 인스턴스 생성
 */
const baseURL = import.meta.env.VITE_API_BASE_URL || '/api';
// baseURL 끝의 슬래시 제거
const normalizedBaseURL = baseURL.endsWith('/') ? baseURL.slice(0, -1) : baseURL;

const axiosInstance: AxiosInstance = axios.create({
  baseURL: normalizedBaseURL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});


/**
 * 요청 인터셉터: JWT 토큰 자동 주입 (토큰이 있을 때만)
 */
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();

    // 토큰이 있으면 자동으로 추가, 없어도 요청은 진행
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

/**
 * 응답 인터셉터: 에러 처리
 */
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // 401 Unauthorized 에러 시 토큰 삭제 (토큰이 있는 경우에만)
    if (error.response?.status === 401) {
      const token = getAccessToken();
      if (token) {
        clearTokens();
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

