import { apiClient } from '@/lib/api/apiClient';
import type { ReportData } from '@/types/report';

/**
 * 리포트 조회
 * @param userId 사용자 ID (필수)
 * @param year 연도 (선택, 미지정 시 현재 월)
 * @param month 월 (선택, 미지정 시 현재 월)
 */
export const getReport = async (
    userId: number,
    year?: number,
    month?: number
): Promise<ReportData> => {
    const params: Record<string, string | number> = {
        userId,
    };

    if (year !== undefined) {
        params.year = year;
    }
    if (month !== undefined) {
        params.month = month;
    }

    console.log('[Report API] 요청 파라미터:', { userId, year, month, params });
    console.log('[Report API] 요청 URL: /api/reports');

    try {
        const data = await apiClient.get<ReportData>('/api/reports', {
            params,
        });
        console.log('[Report API] 응답 데이터:', data);
        return data;
    } catch (error) {
        console.error('[Report API] 에러 발생:', error);
        throw error;
    }
};
