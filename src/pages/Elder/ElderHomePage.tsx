import { useState, useMemo, useEffect } from 'react';
import { getAccessToken } from '@/lib/storage';
import { getUserIdFromToken } from '@/lib/jwt';
import { getUser } from './services/user';
import ConnectionCodeScreen from './components/ConnectionCodeScreen';
import DateTimeDisplay from './components/DateTimeDisplay';
import GreetingCard from './components/GreetingCard';
import MissedMedicationAlert from './components/MissedMedicationAlert';
import TodayMedicationList from './components/TodayMedicationList';
import MedicationReminderModal from './components/MedicationReminderModal';
import {
  type Medication,
  type MedicationTime,
} from './components/TodayMedicationCard';

const ElderHomePage = () => {
  // TODO: API 연동 시 실제 데이터로 교체
  // 테스트: false로 변경하면 보호자 미연결 화면 확인 가능
  const [hasGuardian] = useState<boolean>(true); // 임시: 보호자 연결 여부
  const [userName, setUserName] = useState<string>(''); // 사용자 이름
  const [connectionCode, setConnectionCode] = useState<string>(''); // 연결 코드
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true); // 사용자 정보 로딩 상태

  // 임시: 오늘의 약 데이터 (state로 관리)
  const [todayMedications, setTodayMedications] = useState<Medication[]>([
    {
      id: 1,
      time: 'morning' as MedicationTime,
      medicationName: '혈압약',
      dosage: '1정',
      isTaken: true,
    },
    {
      id: 2,
      time: 'lunch' as MedicationTime,
      medicationName: '비타민 D',
      dosage: '1정',
      isTaken: false,
    },
    {
      id: 3,
      time: 'evening' as MedicationTime,
      medicationName: '혈압약',
      dosage: '1정',
      isTaken: false,
    },
  ]);

  // 모달 상태 관리
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderMedication, setReminderMedication] = useState<Pick<
    Medication,
    'id' | 'time' | 'medicationName' | 'dosage'
  > | null>(null);

  // 약 복용 처리 함수
  const handleMedicationTaken = (id: number) => {
    setTodayMedications((prev) =>
      prev.map((med) => (med.id === id ? { ...med, isTaken: true } : med))
    );
  };

  // 모달에서 복용 버튼 클릭 시
  const handleModalTake = () => {
    if (reminderMedication) {
      handleMedicationTaken(reminderMedication.id);
    }
  };

  // 복용 예정 약을 먼저, 복용된 약을 나중에 정렬
  const sortedMedications = useMemo(() => {
    return [...todayMedications].sort((a, b) => {
      if (a.isTaken === b.isTaken) return 0;
      return a.isTaken ? 1 : -1;
    });
  }, [todayMedications]);

  // 사용자 정보 조회
  useEffect(() => {
    const fetchUserInfo = async () => {
      setIsLoadingUser(true);
      try {
        const token = getAccessToken();
        if (!token) {
          // 토큰이 없으면 에러 처리 (로그인 페이지로 리다이렉트 가능)
          return;
        }

        const userId = getUserIdFromToken(token);
        if (!userId) {
          // userId를 추출할 수 없으면 에러 처리
          return;
        }

        const userData = await getUser(userId);
        setUserName(userData.name);
        setConnectionCode(userData.code.toString());
      } catch (error: any) {
        // 에러 응답 처리
        if (error.response) {
          const status = error.response.status;
          const errorData = error.response.data;
          const errorCode = errorData?.errorCode;

          if (status === 404) {
            if (errorCode === 'US001') {
              // 유저가 존재하지 않습니다
              // 로그인 페이지로 리다이렉트하거나 에러 메시지 표시
            }
          } else if (status === 502) {
            // 서버에 연결할 수 없습니다
          }
        }
        // 에러 발생 시 기본값 유지 또는 에러 처리
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUserInfo();
  }, []);

  // 약 복용 시간 체크 (임시: 실제로는 API나 설정에서 가져올 것)
  useEffect(() => {
    // TODO: 실제 복용 시간과 현재 시간을 비교하여 모달 표시
    // 예시: 점심약 복용 시간이 되면 모달 표시
    const checkMedicationTime = () => {
      // 점심약 복용 시간 (12시) 예시
      // 실제로는 각 약의 복용 시간을 확인해야 함
      const pendingMedication = sortedMedications.find(
        (med) => !med.isTaken && med.time === 'lunch'
      );

      // 임시: 테스트를 위해 항상 점심약이 있으면 모달 표시 (실제로는 시간 체크 필요)
      // const now = new Date();
      // const currentHour = now.getHours();
      // if (currentHour === 12 && pendingMedication) {
      if (pendingMedication && !showReminderModal) {
        setReminderMedication({
          id: pendingMedication.id,
          time: pendingMedication.time,
          medicationName: pendingMedication.medicationName,
          dosage: pendingMedication.dosage,
        });
        setShowReminderModal(true);
      }
    };

    // 초기 체크
    checkMedicationTime();

    // 1분마다 체크 (실제로는 더 정확한 타이밍 필요)
    const interval = setInterval(checkMedicationTime, 60000);

    return () => clearInterval(interval);
  }, [sortedMedications, showReminderModal]);

  // 복용 예정인 약 찾기
  const pendingMedications = sortedMedications.filter((med) => !med.isTaken);

  // 미복용 약 메시지 생성
  const getMissedMedicationMessage = () => {
    if (pendingMedications.length === 0) return undefined;

    const timeLabels: Record<MedicationTime, string> = {
      morning: '아침약',
      lunch: '점심약',
      evening: '저녁약',
    };

    const missedTimes = pendingMedications.map((med) => timeLabels[med.time]);
    return `${missedTimes.join(', ')} 미복용`;
  };

  const missedMedication = getMissedMedicationMessage();

  // 모든 약이 복용되었는지 확인
  const allMedicationsTaken = sortedMedications.every((med) => med.isTaken);

  // 사용자 정보 로딩 중
  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  // 보호자가 연결되지 않은 경우
  if (!hasGuardian) {
    return <ConnectionCodeScreen connectionCode={connectionCode} />;
  }

  // 보호자가 연결된 경우 - 메인 홈화면
  return (
    <>
      <div className="flex flex-col pb-6">
        <DateTimeDisplay />
        <GreetingCard userName={userName} />
        <MissedMedicationAlert
          missedMedication={missedMedication}
          hasNoMedication={allMedicationsTaken}
        />
        <TodayMedicationList
          medications={sortedMedications}
          onMedicationClick={(medication) => {
            if (!medication.isTaken) {
              setReminderMedication({
                id: medication.id,
                time: medication.time,
                medicationName: medication.medicationName,
                dosage: medication.dosage,
              });
              setShowReminderModal(true);
            }
          }}
        />
      </div>
      {showReminderModal && reminderMedication && (
        <MedicationReminderModal
          medication={reminderMedication}
          onTake={handleModalTake}
          onClose={() => {
            setShowReminderModal(false);
            setReminderMedication(null);
          }}
        />
      )}
    </>
  );
};

export default ElderHomePage;
