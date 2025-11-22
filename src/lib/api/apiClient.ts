import axiosInstance from '../axios';
import type { AxiosResponse } from 'axios';

/**
 * 공통 API 응답 타입
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  errorCode: string | null;
  message: string | null;
}

/**
 * API 클라이언트 래퍼 클래스
 * 공통 응답 검증 및 에러 처리를 담당
 */
class ApiClient {
  /**
   * GET 요청
   */
  async get<T>(url: string, config?: any): Promise<T> {
    const response = await axiosInstance.get<ApiResponse<T>>(url, config);
    return this.handleResponse(response);
  }

  /**
   * POST 요청
   */
  async post<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await axiosInstance.post<ApiResponse<T>>(
      url,
      data,
      config
    );
    return this.handleResponse(response);
  }

  /**
   * PUT 요청
   */
  async put<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await axiosInstance.put<ApiResponse<T>>(url, data, config);
    return this.handleResponse(response);
  }

  /**
   * PATCH 요청
   */
  async patch<T>(url: string, data?: any, config?: any): Promise<T> {
    const response = await axiosInstance.patch<ApiResponse<T>>(
      url,
      data,
      config
    );
    return this.handleResponse(response);
  }

  /**
   * DELETE 요청
   */
  async delete<T>(url: string, config?: any): Promise<T> {
    const response = await axiosInstance.delete<ApiResponse<T>>(url, config);
    return this.handleResponse(response);
  }

  /**
   * 응답 검증 및 데이터 추출
   */
  private handleResponse<T>(response: AxiosResponse<ApiResponse<T>>): T {
    // 응답 구조 확인
    if (!response.data) {
      throw new Error('API 응답이 없습니다.');
    }

    if (!response.data.success) {
      throw new Error(response.data.message || 'API 요청이 실패했습니다.');
    }

    if (response.data.data === null || response.data.data === undefined) {
      throw new Error('API 응답 데이터가 없습니다.');
    }

    return response.data.data;
  }
}

// 싱글톤 인스턴스 export
export const apiClient = new ApiClient();
