import { useState } from 'react';
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

  // 임시: 오늘의 약 데이터
  const todayMedications = [
    {
      time: 'morning' as MedicationTime,
      medicationName: '혈압약',
      dosage: '1정',
      isTaken: true,
    },
    {
      time: 'lunch' as MedicationTime,
      medicationName: '비타민 D',
      dosage: '1정',
      isTaken: false,
    },
    {
      time: 'evening' as MedicationTime,
      medicationName: '혈압약',
      dosage: '1정',
      isTaken: false,
    },
  ];

  // 보호자가 연결되지 않은 경우
  if (!hasGuardian) {
    return <ConnectionCodeScreen connectionCode={connectionCode} />;
  }

  // 보호자가 연결된 경우 - 메인 홈화면
  return (
    <div className="flex flex-col pb-4">
      <DateTimeDisplay />
      <GreetingCard userName={userName} />
      <MissedMedicationAlert missedMedication={missedMedication} />
      <TodayMedicationList medications={todayMedications} />
    </div>
  );
};

export default ElderHomePage;
