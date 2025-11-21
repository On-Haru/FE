import { useState, useMemo } from 'react';
import ConnectionCodeScreen from './components/ConnectionCodeScreen';
import DateTimeDisplay from './components/DateTimeDisplay';
import GreetingCard from './components/GreetingCard';
import MissedMedicationAlert from './components/MissedMedicationAlert';
import TodayMedicationList from './components/TodayMedicationList';
import { type MedicationTime } from './components/TodayMedicationCard';

const ElderHomePage = () => {
  // TODO: API 연동 시 실제 데이터로 교체
  const [hasGuardian] = useState<boolean>(true); // 임시: 보호자 연결 여부
  const connectionCode = '0837'; // 임시: 연결 코드
  const userName = '홍길동'; // 임시: 사용자 이름
  const missedMedication = '점심약 미복용'; // 임시: 미복용 약 정보

  // 임시: 오늘의 약 데이터 (state로 관리)
  const [todayMedications, setTodayMedications] = useState([
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

  // 약 복용 처리 함수
  const handleMedicationTaken = (id: number) => {
    setTodayMedications((prev) =>
      prev.map((med) => (med.id === id ? { ...med, isTaken: true } : med))
    );
  };

  // 복용 예정 약을 먼저, 복용된 약을 나중에 정렬
  const sortedMedications = useMemo(() => {
    return [...todayMedications].sort((a, b) => {
      if (a.isTaken === b.isTaken) return 0;
      return a.isTaken ? 1 : -1;
    });
  }, [todayMedications]);

  // 보호자가 연결되지 않은 경우
  if (!hasGuardian) {
    return <ConnectionCodeScreen connectionCode={connectionCode} />;
  }

  // 보호자가 연결된 경우 - 메인 홈화면
  return (
    <div className="flex flex-col pb-6">
      <DateTimeDisplay />
      <GreetingCard userName={userName} />
      <MissedMedicationAlert missedMedication={missedMedication} />
      <TodayMedicationList
        medications={sortedMedications}
        onMedicationTaken={handleMedicationTaken}
      />
    </div>
  );
};

export default ElderHomePage;
