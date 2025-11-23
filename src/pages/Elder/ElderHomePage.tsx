import { useState, useMemo, useEffect } from 'react';
import { updateTakenStatus } from '@/pages/Detail/services/takingLog';
import { getApiErrorMessage } from '@/utils/apiErrorHandler';
import { useToast } from '@/contexts/ToastContext';
import { useUser } from './hooks/useUser';
import { useTodayMedications } from './hooks/useTodayMedications';
import { useGuardianConnection } from './hooks/useGuardianConnection';
import { usePushSubscription } from './hooks/usePushSubscription';
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
  console.log('[ElderHomePage] 🏠 어르신 홈 페이지 렌더링 시작');
  
  const { showError } = useToast();
  // 사용자 정보 조회
  const {
    userName,
    connectionCode,
    isLoading: isLoadingUser,
    error: userError,
  } = useUser();

  // 보호자 연결 여부 확인
  const { hasGuardian } = useGuardianConnection(isLoadingUser);

  // Push 구독
  const { isSupported, isSubscribed, subscribe } = usePushSubscription();

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
      showError('약 정보를 찾을 수 없습니다.');
      return;
    }

    // 이미 복용한 경우
    if (medication.isTaken) {
      return;
    }

    // scheduleId와 scheduledDateTime이 없는 경우 (이론적으로는 발생하지 않아야 함)
    if (!medication.scheduleId || !medication.scheduledDateTime) {
      showError('약 정보가 올바르지 않습니다.');
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
      showError(getApiErrorMessage(error), () => {
        handleMedicationTaken(id);
      });
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

  // 보호자가 연결되고 사용자 정보가 로드되면 자동으로 Push 구독 시도
  useEffect(() => {
    // 사용자 정보 로딩 중이거나 보호자가 연결되지 않았으면 구독하지 않음
    if (isLoadingUser || !hasGuardian) {
      return;
    }

    // 브라우저가 Push를 지원하지 않으면 구독하지 않음
    if (!isSupported) {
      return;
    }

    // 구독이 이미 되어 있어도 서버에 구독 정보를 전송하도록 subscribe 호출
    // (브라우저에 구독이 있어도 서버에 없을 수 있으므로)
    // 자동으로 Push 구독 시도 (에러는 조용히 처리)
    subscribe().catch((error) => {
      // 구독 실패는 조용히 처리하되, 디버깅을 위해 로그 출력
      console.error('[ElderHomePage] 푸시 구독 실패:', error);
    });
  }, [isLoadingUser, hasGuardian, isSubscribed, isSupported, subscribe]);

  // Service Worker로부터 Push 알림 메시지 수신
  useEffect(() => {
    console.log('[ElderHomePage] 메시지 리스너 useEffect 실행');

    // Service Worker 지원 여부 확인
    if (!('serviceWorker' in navigator)) {
      console.warn('[ElderHomePage] ⚠️ Service Worker를 지원하지 않습니다.');
      console.warn('[ElderHomePage] 환경 정보:', {
        protocol: window.location.protocol,
        hostname: window.location.hostname,
        userAgent: navigator.userAgent.substring(0, 50) + '...',
      });
      return;
    }

    console.log('[ElderHomePage] ✅ Service Worker 지원됨');
    console.log('[ElderHomePage] 메시지 리스너 설정 시작, hasGuardian:', hasGuardian);

    // Service Worker 등록 상태 확인 (비동기)
    navigator.serviceWorker.getRegistration()
      .then((registration) => {
        if (registration) {
          console.log('[ElderHomePage] ✅ Service Worker 등록됨:', registration.scope);
          console.log('[ElderHomePage] Service Worker 상태:', registration.active?.state || '없음');
        } else {
          console.warn('[ElderHomePage] ⚠️ Service Worker가 아직 등록되지 않았습니다. 등록 대기 중...');
          // Service Worker 등록 대기
          navigator.serviceWorker.ready.then((registration) => {
            console.log('[ElderHomePage] ✅ Service Worker 등록 완료:', registration.scope);
          });
        }
      })
      .catch((error) => {
        console.error('[ElderHomePage] Service Worker 등록 확인 실패:', error);
      });

    const handleMessage = (event: MessageEvent) => {
      console.log('[ElderHomePage] 📨 메시지 수신:', event);
      console.log('[ElderHomePage] 메시지 데이터:', event.data);
      console.log('[ElderHomePage] 메시지 소스:', event.source);
      
      if (!event.data || typeof event.data !== 'object' || !event.data.type) {
        console.log('[ElderHomePage] 메시지 형식이 올바르지 않습니다:', event.data);
        return;
      }

      // Push 알림 수신 처리
      if (event.data.type === 'PUSH_RECEIVED') {
        console.log('[ElderHomePage] ✅ PUSH_RECEIVED 메시지 수신:', event.data.payload);
        
        const payload = event.data.payload as {
          title?: string;
          body?: string;
          scheduleId?: number;
          scheduledDateTime?: string;
          receivedAt?: number;
        };

        if (!payload?.title || !payload?.body) {
          console.warn('[ElderHomePage] 푸시 알림에 title 또는 body가 없습니다.');
          return;
        }

        console.log('[ElderHomePage] todayMedications:', todayMedications);
        console.log('[ElderHomePage] todayMedications 길이:', todayMedications.length);
        
        // scheduleId가 있으면 해당 약 정보 찾기
        let medication = null;
        if (payload.scheduleId) {
          medication = todayMedications.find(
            (med) => med.scheduleId === payload.scheduleId
          );

          console.log('[ElderHomePage] 약 정보 찾기:', {
            scheduleId: payload.scheduleId,
            found: !!medication,
            isTaken: medication?.isTaken,
            medicationName: medication?.medicationName,
            allScheduleIds: todayMedications.map(m => m.scheduleId),
          });
        }

        // 약 정보가 있고 아직 복용하지 않았으면 모달 표시
        if (medication && !medication.isTaken) {
          setReminderMedication({
            id: medication.id,
            time: medication.time,
            medicationName: medication.medicationName,
            dosage: medication.dosage,
          });
          setShowReminderModal(true);
          console.log('[ElderHomePage] ✅ 모달 표시 (약 정보 찾음):', {
            id: medication.id,
            medicationName: medication.medicationName,
          });
        } else if (medication && medication.isTaken) {
          // 이미 복용한 약은 모달 표시하지 않음
          console.log('[ElderHomePage] 이미 복용한 약이므로 모달을 표시하지 않습니다.');
        } else {
          // 약 정보를 찾지 못했어도 푸시 알림을 받았으면 모달 표시
          // body에서 약 이름 추출 시도
          const bodyText = payload.body || '';
          const bodyMatch = bodyText.match(/(.+?)\s*(\d+정|\d+개|복용)/);
          const medicationName = bodyMatch ? bodyMatch[1].trim() : bodyText.split(' ')[0] || bodyText || '약';
          const dosage = bodyMatch ? bodyMatch[2] : '1정';
          
          // scheduledDateTime에서 시간 추출하여 time 결정
          let time: MedicationTime = 'morning';
          if (payload.scheduledDateTime) {
            const hour = new Date(payload.scheduledDateTime).getHours();
            if (hour >= 5 && hour < 12) time = 'morning';
            else if (hour >= 12 && hour < 17) time = 'lunch';
            else time = 'evening';
          }
          
          console.log('[ElderHomePage] 약 정보를 찾지 못했지만 모달 표시:', {
            medicationName,
            dosage,
            time,
            body: payload.body,
          });
          
          setReminderMedication({
            id: Date.now(), // 임시 ID
            time,
            medicationName,
            dosage,
          });
          setShowReminderModal(true);
          console.log('[ElderHomePage] ✅ 모달 표시 (약 정보 없음, body에서 추출)');
        }
      }

      // 알림 클릭 이벤트 처리
      if (event.data.type === 'NOTIFICATION_CLICK') {
        const payload = event.data.payload as {
          scheduleId?: number;
          scheduledDateTime?: string;
          title?: string;
          body?: string;
        };

        if (payload?.scheduleId) {
          const medication = todayMedications.find(
            (med) => med.scheduleId === payload.scheduleId
          );

          if (medication && !medication.isTaken) {
            setReminderMedication({
              id: medication.id,
              time: medication.time,
              medicationName: medication.medicationName,
              dosage: medication.dosage,
            });
            setShowReminderModal(true);
          }
        }
      }
    };

    // BroadcastChannel 리스너 등록 (가장 확실한 방법)
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel('push-notification');
      channel.addEventListener('message', (event) => {
        console.log('[ElderHomePage] 📢 BroadcastChannel 메시지 수신:', event.data);
        // BroadcastChannel 이벤트를 MessageEvent처럼 변환
        const messageEvent = {
          ...event,
          data: event.data,
        } as MessageEvent;
        handleMessage(messageEvent);
      });
      console.log('[ElderHomePage] ✅ BroadcastChannel 리스너 등록 완료');
    } catch (error) {
      console.error('[ElderHomePage] BroadcastChannel 생성 실패:', error);
    }

    // Service Worker 메시지 리스너 등록
    const setupServiceWorkerListener = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        console.log('[ElderHomePage] Service Worker ready, 메시지 리스너 등록');
        
        // Service Worker 메시지 리스너 등록
        navigator.serviceWorker.addEventListener('message', handleMessage);
        console.log('[ElderHomePage] navigator.serviceWorker 리스너 등록 완료');
        
        // controller가 있으면 controller에도 리스너 등록
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.addEventListener('message', handleMessage);
          console.log('[ElderHomePage] controller 리스너 등록 완료');
        } else {
          console.warn('[ElderHomePage] Service Worker controller가 없습니다.');
        }
        
        console.log('[ElderHomePage] ✅ 모든 메시지 리스너 등록 완료');
      } catch (error) {
        console.error('[ElderHomePage] Service Worker 메시지 리스너 등록 실패:', error);
      }
    };

    setupServiceWorkerListener();
    
    return () => {
      if (channel) {
        channel.close();
      }
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleMessage);
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.removeEventListener('message', handleMessage);
        }
      }
    };
  }, [hasGuardian, todayMedications]);

  // 복용 예정 약을 먼저, 복용된 약을 나중에 정렬
  const sortedMedications = useMemo(() => {
    return [...todayMedications].sort((a, b) => {
      if (a.isTaken === b.isTaken) return 0;
      return a.isTaken ? 1 : -1;
    });
  }, [todayMedications]);

  // 약 복용 시간 체크 (scheduledDateTime 기반)
  useEffect(() => {
    if (!hasGuardian || todayMedications.length === 0) {
      return;
    }

    const checkMedicationTime = () => {
      const now = new Date();

      // 아직 복용하지 않은 약 중에서 복용 시간이 된 약 찾기
      const dueMedication = sortedMedications.find((med) => {
        // 이미 복용한 약은 제외
        if (med.isTaken) {
          return false;
        }

        // scheduledDateTime이 없으면 체크하지 않음
        if (!med.scheduledDateTime) {
          return false;
        }

        // scheduledDateTime 파싱
        const scheduledTime = new Date(med.scheduledDateTime);

        // 현재 시간이 복용 시간 이후이고, 30분 이내인 약만 표시
        // (30분이 지나면 Push 알림으로 처리되므로 여기서는 표시하지 않음)
        const timeDiff = now.getTime() - scheduledTime.getTime();
        const thirtyMinutes = 30 * 60 * 1000; // 30분을 밀리초로 변환

        // 복용 시간이 되었고, 30분 이내인 경우
        return timeDiff >= 0 && timeDiff <= thirtyMinutes;
      });

      // 복용 시간이 된 약이 있고 모달이 열려있지 않으면 모달 표시
      if (dueMedication && !showReminderModal) {
        setReminderMedication({
          id: dueMedication.id,
          time: dueMedication.time,
          medicationName: dueMedication.medicationName,
          dosage: dueMedication.dosage,
        });
        setShowReminderModal(true);
      }
    };

    // 초기 체크
    checkMedicationTime();

    // 1분마다 체크
    const interval = setInterval(checkMedicationTime, 60000);

    return () => clearInterval(interval);
  }, [
    hasGuardian,
    sortedMedications,
    showReminderModal,
    todayMedications.length,
  ]);

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
