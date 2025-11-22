import { useState, useEffect } from 'react';
import { getAccessToken } from '@/lib/storage';
import { getUserIdFromToken } from '@/lib/jwt';
import { getCalendar } from '@/pages/Detail/services/takingLog';
import { findTodayCalendarDay } from '@/pages/Home/utils/takingLogUtils';
import { convertTodaySlotsToMedications } from '../utils/medicationUtils';
import type { Medication } from '../components/TodayMedicationCard';

export const useTodayMedications = (
  hasGuardian: boolean,
  isLoadingUser: boolean
) => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasGuardian || isLoadingUser) {
      return;
    }

    const fetchTodayMedications = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = getAccessToken();
        if (!token) {
          setError('로그인이 필요합니다.');
          return;
        }

        const userId = getUserIdFromToken(token);
        if (!userId) {
          setError('사용자 정보를 불러올 수 없습니다.');
          return;
        }

        // 오늘 날짜 정보
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth() + 1; // 0-based이므로 +1

        // 캘린더 API 호출
        const calendarData = await getCalendar(year, month, userId);

        // 오늘 날짜의 CalendarDay 찾기
        const todayCalendarDay = findTodayCalendarDay(calendarData.days);

        if (todayCalendarDay) {
          // 오늘 날짜의 슬롯들을 Medication 배열로 변환
          const medications = convertTodaySlotsToMedications(
            todayCalendarDay.slots
          );
          setMedications(medications);
        } else {
          // 오늘 날짜에 약이 없는 경우
          setMedications([]);
        }
      } catch (error: any) {
        // 에러 응답 처리
        if (error.response) {
          const status = error.response.status;
          const errorData = error.response.data;
          const errorCode = errorData?.errorCode;
          const errorMessage = errorData?.message;

          if (status === 404) {
            if (errorCode === 'US001') {
              setError('유저가 존재하지 않습니다.');
            } else {
              setError(errorMessage || '약 정보를 찾을 수 없습니다.');
            }
          } else if (status === 502) {
            setError('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
          } else {
            setError(errorMessage || '약 정보를 불러오는데 실패했습니다.');
          }
        } else {
          // 네트워크 에러 또는 기타 에러
          setError(error.message || '약 정보를 불러오는데 실패했습니다.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchTodayMedications();
  }, [hasGuardian, isLoadingUser]);

  return { medications, isLoading, error, setMedications };
};
