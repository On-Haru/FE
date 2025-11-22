import { useState, useEffect } from 'react';
import type { CareRecipient } from '@/types/caregiver';
import EmptyStateScreen from './components/EmptyStateScreen';
import CaregiverCard from './components/CaregiverCard';

const HomePage = () => {
  const [recipients, setRecipients] = useState<CareRecipient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 피보호자 목록 조회
  useEffect(() => {
    const fetchRecipients = async () => {
      setIsLoading(true);
      try {
        // TODO: 실제 API 호출로 교체 (9단계에서 구현)
        // const response = await getRecipients();
        // setRecipients(response);

        // 임시 Mock 데이터
        const mockData: CareRecipient[] = [
          {
            id: '1',
            name: '김노인',
            todayStatus: { takenCount: 1, totalCount: 3 },
            missedMedications: [{ time: 'lunch', medicationName: '점심 약' }],
            statusMessage: '저녁 약을 복용할 시간입니다.',
          },
          {
            id: '2',
            name: '이노인',
            todayStatus: { takenCount: 3, totalCount: 3 },
            missedMedications: [],
            statusMessage: '오늘의 약을 다 복용하였습니다.',
          },
        ];

        setRecipients(mockData);
      } catch (error) {
        console.error('피보호자 목록 조회 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecipients();
  }, []);

  // 연결 해제 핸들러
  const handleDisconnect = (id: string) => {
    // TODO: API 호출 추가 (9단계에서 구현)
    // await disconnectRecipient(id);

    // 임시로 로컬 상태에서 제거
    setRecipients((prev) => prev.filter((r) => r.id !== id));
  };

  // 로딩 중
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">로딩 중...</p>
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
