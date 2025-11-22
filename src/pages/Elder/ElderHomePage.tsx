import { useState, useMemo, useEffect } from 'react';
import { updateTakenStatus } from '@/pages/Detail/services/takingLog';
import { getApiErrorMessage } from '@/utils/apiErrorHandler';
import { useUser } from './hooks/useUser';
import { useTodayMedications } from './hooks/useTodayMedications';
import { useGuardianConnection } from './hooks/useGuardianConnection';
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
  // 사용자 정보 조회
  const {
    userName,
    connectionCode,
    isLoading: isLoadingUser,
    error: userError,
  } = useUser();

  // 보호자 연결 여부 확인
  const { hasGuardian, setHasGuardian } = useGuardianConnection(isLoadingUser);

  // 오늘의 약 데이터 조회
  const {
    medications: todayMedications,
    isLoading: isLoadingMedications,
    error: medicationError,
    setMedications: setTodayMedications,
  } = useTodayMedications(hasGuardian, isLoadingUser);

  // 모달 상태 관리
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderMedication, setReminderMedication] = useState<Pick<
    Medication,
    'id' | 'time' | 'medicationName' | 'dosage'
  > | null>(null);

  // 약 복용 처리 함수
  const handleMedicationTaken = async (id: number) => {
    // 해당 약 찾기
    const medication = todayMedications.find((med) => med.id === id);
    if (!medication) {
      alert('약 정보를 찾을 수 없습니다.');
      return;
    }

    // 이미 복용한 경우
    if (medication.isTaken) {
      return;
    }

    // scheduleId와 scheduledDateTime이 없는 경우 (이론적으로는 발생하지 않아야 함)
    if (!medication.scheduleId || !medication.scheduledDateTime) {
      alert('약 정보가 올바르지 않습니다.');
      return;
    }

    try {
      // API 호출: 복용 여부 업데이트
      await updateTakenStatus({
        scheduleId: medication.scheduleId,
        scheduledDateTime: medication.scheduledDateTime,
        taken: true,
      });

      // 성공 시 로컬 상태 업데이트
      setTodayMedications((prev) =>
        prev.map((med) => (med.id === id ? { ...med, isTaken: true } : med))
      );
    } catch (error) {
      // 에러 발생 시 사용자에게 알림
      alert(getApiErrorMessage(error));
    }
  };

  // 모달에서 복용 버튼 클릭 시
  const handleModalTake = async () => {
    if (reminderMedication) {
      await handleMedicationTaken(reminderMedication.id);
      // 복용 완료 후 모달 닫기
      setShowReminderModal(false);
      setReminderMedication(null);
    }
  };

  // 복용 예정 약을 먼저, 복용된 약을 나중에 정렬
  const sortedMedications = useMemo(() => {
    return [...todayMedications].sort((a, b) => {
      if (a.isTaken === b.isTaken) return 0;
      return a.isTaken ? 1 : -1;
    });
  }, [todayMedications]);

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

  // 약이 없는 경우와 모두 복용한 경우 구분
  const hasNoMedication = todayMedications.length === 0; // 약이 없는 경우
  const allMedicationsTaken =
    todayMedications.length > 0 && todayMedications.every((med) => med.isTaken); // 약이 있고 모두 복용한 경우

  // 사용자 정보 로딩 중
  if (isLoadingUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  // 사용자 정보 조회 에러 발생 시
  if (userError) {
    return (
      <div className="flex flex-col items-center justify-center h-full px-4">
        <p className="text-red-500 text-center mb-4">{userError}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded-xl hover:opacity-90 transition-opacity"
        >
          다시 시도
        </button>
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
        {isLoadingMedications ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-500">약 정보를 불러오는 중...</p>
          </div>
        ) : medicationError ? (
          <div className="flex flex-col items-center justify-center py-8 px-4">
            <p className="text-red-500 text-center mb-4">{medicationError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-white rounded-xl hover:opacity-90 transition-opacity"
            >
              다시 시도
            </button>
          </div>
        ) : (
          <>
            <MissedMedicationAlert
              missedMedication={missedMedication}
              hasNoMedication={hasNoMedication}
              allMedicationsTaken={allMedicationsTaken}
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
          </>
        )}
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
