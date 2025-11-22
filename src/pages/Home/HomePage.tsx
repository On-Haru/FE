import { useState, useEffect, useCallback } from 'react';
import type { CareRecipient } from '@/types/caregiver';
import {
  getCaregiverLinks,
  deleteCaregiverLink,
} from './services/caregiverLink';
import { getUser } from './services/user';
import { getCalendar } from '@/pages/Detail/services/takingLog';
import type { CalendarResponse } from '@/pages/Detail/types/takingLog';
import {
  findTodayCalendarDay,
  calculateTodayStatus,
  getMissedMedications,
  generateStatusMessage,
} from './utils/takingLogUtils';
import { getApiErrorMessage } from '@/utils/apiErrorHandler';
import EmptyStateScreen from './components/EmptyStateScreen';
import CaregiverCard from './components/CaregiverCard';

// CareRecipient에 linkId와 캘린더 데이터 추가
interface RecipientWithLinkId extends CareRecipient {
  linkId: number;
  calendarData: CalendarResponse | null;
}

const HomePage = () => {
  const [recipients, setRecipients] = useState<RecipientWithLinkId[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 피보호자 목록 조회
  const fetchRecipients = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const links = await getCaregiverLinks();

      // 오늘 날짜 정보
      const today = new Date();
      const year = today.getFullYear();
      const month = today.getMonth() + 1; // 0-based이므로 +1

      // 각 피보호자의 상세 정보(이름, 캘린더 데이터)를 가져오기
      const recipientsWithDetails = await Promise.all(
        links.map(async (link) => {
          let userInfo;
          let calendarData: CalendarResponse | null = null;

          // User API로 피보호자 정보 조회
          try {
            userInfo = await getUser(link.seniorId);
          } catch (userError) {
            // User API 호출 실패 시 기본값 사용
            userInfo = {
              id: link.seniorId,
              name: `피보호자 ${link.seniorId}`,
              phone: '',
              role: 'SENIOR' as const,
              code: 0,
            };
          }

          // 캘린더 API로 오늘의 복약 기록 조회
          try {
            calendarData = await getCalendar(year, month, link.seniorId);
          } catch (calendarError) {
            // 캘린더 API 호출 실패 시 null로 처리
            calendarData = null;
          }

          // 오늘 날짜의 CalendarDay 찾기
          const todayCalendarDay = calendarData
            ? findTodayCalendarDay(calendarData.days)
            : null;

          // 오늘의 복용 현황 계산
          const todayStatus = calculateTodayStatus(todayCalendarDay);

          // 미복용 약 목록 생성
          const missedMedications = getMissedMedications(todayCalendarDay);

          // 상태 메시지 생성
          const statusMessage = generateStatusMessage(todayCalendarDay);

          return {
            id: link.seniorId.toString(),
            linkId: link.id, // 연결 해제에 필요한 linkId 저장
            name: userInfo.name, // 실제 이름 사용
            calendarData, // 캘린더 데이터 저장
            todayStatus, // 계산된 복용 현황
            missedMedications, // 계산된 미복용 약 목록
            statusMessage, // 생성된 상태 메시지
          };
        })
      );

      setRecipients(recipientsWithDetails);
    } catch (error) {
      setError(getApiErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecipients();
  }, [fetchRecipients]);

  // 연결 해제 핸들러
  const handleDisconnect = async (id: string) => {
    // 해당 피보호자의 linkId 찾기
    const recipient = recipients.find((r) => r.id === id);
    if (!recipient) {
      alert('피보호자를 찾을 수 없습니다.');
      return;
    }

    try {
      // 연결 해제 API 호출
      await deleteCaregiverLink(recipient.linkId);

      // 성공 시 로컬 상태에서 제거
      setRecipients((prev) => prev.filter((r) => r.id !== id));
    } catch (error) {
      // 에러 발생 시 사용자에게 알림
      alert(getApiErrorMessage(error));
    }
  };

  // 로딩 중
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  // 에러 발생 시
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4">
        <p className="text-red-500 text-center mb-4">{error}</p>
        <button
          onClick={fetchRecipients}
          className="px-4 py-2 bg-primary text-white rounded-xl hover:opacity-90 transition-opacity"
        >
          다시 시도
        </button>
      </div>
    );
  }

  // 피보호자가 없는 경우
  if (recipients.length === 0) {
    return <EmptyStateScreen />;
  }

  // 피보호자가 있는 경우 - 리스트 렌더링
  return (
    <div className="cursor-pointer">
      {recipients.map((recipient) => (
        <CaregiverCard
          key={recipient.id}
          recipient={recipient}
          onDisconnect={handleDisconnect}
        />
      ))}
    </div>
  );
};

export default HomePage;
