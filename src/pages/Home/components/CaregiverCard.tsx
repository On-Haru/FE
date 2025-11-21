import type { CareRecipient } from '@/types/caregiver';
import MedicationProgressBar from './MedicationProgressBar';

interface CaregiverCardProps {
  /** 피보호자 정보 */
  recipient: CareRecipient;
  /** 연결 해제 핸들러 */
  onDisconnect: (id: string) => void;
}

const CaregiverCard = ({ recipient, onDisconnect }: CaregiverCardProps) => {
  const { id, name, todayStatus, missedMedications, statusMessage } = recipient;

  // 시간 라벨 매핑
  const timeLabels: Record<'morning' | 'lunch' | 'evening', string> = {
    morning: '아침',
    lunch: '점심',
    evening: '저녁',
  };

  // 연결 해제 핸들러
  const handleDisconnect = () => {
    // TODO: 확인 모달 추가 (10단계에서 구현)
    onDisconnect(id);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-4">
      {/* 상단: 이름 + 연결 해제하기 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">{name} 님</h2>
        <button
          onClick={handleDisconnect}
          className="text-sm text-red-500 underline hover:text-red-600 transition-colors"
        >
          연결 해제하기
        </button>
      </div>

      {/* 오늘의 복용 현황 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          오늘의 복용 현황
        </h3>
        <MedicationProgressBar status={todayStatus} />
        {/* 상태 메시지 */}
        {statusMessage && (
          <p className="text-sm text-gray-700 mt-3">&gt; {statusMessage}</p>
        )}
      </div>

      {/* 미복용 현황 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          미복용 현황
        </h3>
        {missedMedications.length > 0 ? (
          <ul className="space-y-1">
            {missedMedications.map((med, index) => (
              <li key={index} className="text-sm text-gray-700">
                &gt; {timeLabels[med.time]} 약을 복용하지 않았습니다.
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-700">
            &gt; 복용하지 않은 약이 없습니다.
          </p>
        )}
      </div>
    </div>
  );
};

export default CaregiverCard;
