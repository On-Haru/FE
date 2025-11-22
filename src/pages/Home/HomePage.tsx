import { useState, useEffect, useCallback } from 'react';
import type { CareRecipient } from '@/types/caregiver';
import {
  getCaregiverLinks,
  deleteCaregiverLink,
} from './services/caregiverLink';
import { getUser } from './services/user';
import { getApiErrorMessage } from '@/utils/apiErrorHandler';
import EmptyStateScreen from './components/EmptyStateScreen';
import CaregiverCard from './components/CaregiverCard';

// CareRecipient에 linkId 추가
interface RecipientWithLinkId extends CareRecipient {
  linkId: number;
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

      // 각 피보호자의 상세 정보(이름 등)를 User API로 가져오기
      const recipientsWithDetails = await Promise.all(
        links.map(async (link) => {
          try {
            // User API로 피보호자 정보 조회
            const userInfo = await getUser(link.seniorId);
            return {
              id: link.seniorId.toString(),
              linkId: link.id, // 연결 해제에 필요한 linkId 저장
              name: userInfo.name, // 실제 이름 사용
              todayStatus: {
                takenCount: 0, // TODO: 실제 데이터는 별도 API에서 가져와야 함
                totalCount: 0, // TODO: 실제 데이터는 별도 API에서 가져와야 함
              },
              missedMedications: [], // TODO: 실제 데이터는 별도 API에서 가져와야 함
              statusMessage: undefined, // TODO: 실제 데이터는 별도 API에서 가져와야 함
            };
          } catch (userError) {
            // User API 호출 실패 시 기본값 사용
            return {
              id: link.seniorId.toString(),
              linkId: link.id, // 연결 해제에 필요한 linkId 저장
              name: `피보호자 ${link.seniorId}`, // 폴백: User API 실패 시
              todayStatus: {
                takenCount: 0,
                totalCount: 0,
              },
              missedMedications: [],
              statusMessage: undefined,
            };
          }
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
