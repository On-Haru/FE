import { useState, useMemo, useEffect } from 'react';
import { getAccessToken } from '@/lib/storage';
import { getUserIdFromToken } from '@/lib/jwt';
import { getUser } from './services/user';
import { hasCaregiverLink } from '@/pages/Home/services/caregiverLink';
import {
  getCalendar,
  updateTakenStatus,
} from '@/pages/Detail/services/takingLog';
import { findTodayCalendarDay } from '@/pages/Home/utils/takingLogUtils';
import { convertTodaySlotsToMedications } from './utils/medicationUtils';
import { getApiErrorMessage } from '@/utils/apiErrorHandler';
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
  const [hasGuardian, setHasGuardian] = useState<boolean>(false); // 보호자 연결 여부
  const [userName, setUserName] = useState<string>(''); // 사용자 이름 (User API에서 가져옴)
  const [connectionCode, setConnectionCode] = useState<string>(''); // 연결 코드 (User API에서 가져옴)
  const [isLoadingUser, setIsLoadingUser] = useState<boolean>(true); // 사용자 정보 로딩 상태
  const [userError, setUserError] = useState<string | null>(null); // 사용자 정보 조회 에러
  const [todayMedications, setTodayMedications] = useState<Medication[]>([]); // 오늘의 약 데이터 (API에서 가져옴)
  const [isLoadingMedications, setIsLoadingMedications] =
    useState<boolean>(false); // 약 데이터 로딩 상태
  const [medicationError, setMedicationError] = useState<string | null>(null); // 약 데이터 조회 에러

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

  // 사용자 정보 및 보호자 연결 여부 조회
  useEffect(() => {
    const fetchUserInfo = async () => {
      setIsLoadingUser(true);
      setUserError(null);
      try {
        const token = getAccessToken();
        if (!token) {
          setUserError('로그인이 필요합니다.');
          return;
        }

        const userId = getUserIdFromToken(token);
        if (!userId) {
          setUserError('사용자 정보를 불러올 수 없습니다.');
          return;
        }

        // 사용자 정보 조회
        const userData = await getUser(userId);
        setUserName(userData.name);
        setConnectionCode(userData.code.toString());

        // 보호자 연결 여부 확인
        // has-link API를 사용하여 연결 여부를 boolean 값으로 확인
        // 어르신이 호출해도 자신에게 연결된 보호자가 있는지 확인 가능한지 테스트
        try {
          const hasLink = await hasCaregiverLink();
          console.log(
            '[ElderHomePage] 초기 로드 - hasLink:',
            hasLink,
            'type:',
            typeof hasLink
          );
          setHasGuardian(hasLink);
        } catch (linkError: any) {
          // 연결 여부 확인 실패 시 보호자 미연결로 처리
          console.error(
            '[ElderHomePage] 초기 로드 - 연결 여부 확인 실패:',
            linkError
          );
          if (linkError.response) {
            console.error(
              '[ElderHomePage] 응답 데이터:',
              linkError.response.data
            );
            console.error(
              '[ElderHomePage] 응답 상태:',
              linkError.response.status
            );
          }
          setHasGuardian(false);
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
              setUserError('유저가 존재하지 않습니다.');
            } else {
              setUserError(errorMessage || '사용자 정보를 찾을 수 없습니다.');
            }
          } else if (status === 502) {
            setUserError(
              '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.'
            );
          } else {
            setUserError(
              errorMessage || '사용자 정보를 불러오는데 실패했습니다.'
            );
          }
        } else {
          // 네트워크 에러 또는 기타 에러
          setUserError(
            error.message || '사용자 정보를 불러오는데 실패했습니다.'
          );
        }
      } finally {
        setIsLoadingUser(false);
      }
    };

    fetchUserInfo();
  }, []);

  // 오늘의 약 데이터 조회 (보호자가 연결된 경우에만)
  useEffect(() => {
    if (!hasGuardian || isLoadingUser) {
      return;
    }

    const fetchTodayMedications = async () => {
      setIsLoadingMedications(true);
      setMedicationError(null);
      try {
        const token = getAccessToken();
        if (!token) {
          setMedicationError('로그인이 필요합니다.');
          return;
        }

        const userId = getUserIdFromToken(token);
        if (!userId) {
          setMedicationError('사용자 정보를 불러올 수 없습니다.');
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
          setTodayMedications(medications);
        } else {
          // 오늘 날짜에 약이 없는 경우
          setTodayMedications([]);
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
              setMedicationError('유저가 존재하지 않습니다.');
            } else {
              setMedicationError(errorMessage || '약 정보를 찾을 수 없습니다.');
            }
          } else if (status === 502) {
            setMedicationError(
              '서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.'
            );
          } else {
            setMedicationError(
              errorMessage || '약 정보를 불러오는데 실패했습니다.'
            );
          }
        } else {
          // 네트워크 에러 또는 기타 에러
          setMedicationError(
            error.message || '약 정보를 불러오는데 실패했습니다.'
          );
        }
      } finally {
        setIsLoadingMedications(false);
      }
    };

    fetchTodayMedications();
  }, [hasGuardian, isLoadingUser]);

  // 보호자 미연결 상태일 때 주기적으로 연결 여부 확인 (폴링)
  useEffect(() => {
    // 보호자가 이미 연결되어 있으면 폴링 불필요
    if (hasGuardian || isLoadingUser) {
      return;
    }

    const checkGuardianConnection = async () => {
      try {
        const token = getAccessToken();
        if (!token) {
          console.log('[ElderHomePage] 폴링 - 토큰 없음');
          return;
        }

        const hasLink = await hasCaregiverLink();
        console.log(
          '[ElderHomePage] 폴링 - hasLink:',
          hasLink,
          'type:',
          typeof hasLink
        );

        if (hasLink) {
          console.log('[ElderHomePage] 보호자 연결 감지! 화면 전환');
          setHasGuardian(true);
        }
      } catch (error: any) {
        // 에러 발생 시 조용히 처리 (다음 폴링에서 다시 시도)
        console.error('[ElderHomePage] 폴링 에러:', error);
        if (error.response) {
          console.error(
            '[ElderHomePage] 폴링 응답 데이터:',
            error.response.data
          );
          console.error(
            '[ElderHomePage] 폴링 응답 상태:',
            error.response.status
          );
        }
      }
    };

    // 초기 확인
    checkGuardianConnection();

    // 5초마다 연결 여부 확인
    const interval = setInterval(checkGuardianConnection, 5000);

    return () => clearInterval(interval);
  }, [hasGuardian, isLoadingUser]);

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
