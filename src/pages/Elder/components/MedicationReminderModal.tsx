import { useState } from 'react';
import { Check, SunDim, Sun, Moon } from 'lucide-react';
import { type Medication } from './TodayMedicationCard';

// timeConfig는 컴포넌트 외부로 이동하여 렌더링마다 재생성되지 않도록 최적화
const timeConfig = {
  morning: {
    label: '아침 약',
    icon: SunDim,
    iconColor: 'var(--color-morning-primary)',
    iconBg: 'var(--color-morning-secondary)',
  },
  lunch: {
    label: '점심 약',
    icon: Sun,
    iconColor: 'var(--color-lunch-primary)',
    iconBg: 'var(--color-lunch-secondary)',
  },
  evening: {
    label: '저녁 약',
    icon: Moon,
    iconColor: 'var(--color-evening-primary)',
    iconBg: 'var(--color-evening-secondary)',
  },
} as const;

interface MedicationReminderModalProps {
  medication: Pick<Medication, 'id' | 'time' | 'medicationName' | 'dosage'>;
  onTake: () => void;
  onClose: () => void;
}

const MedicationReminderModal = ({
  medication,
  onTake,
  onClose,
}: MedicationReminderModalProps) => {
  const [isConfirmed, setIsConfirmed] = useState(false);

  const config = timeConfig[medication.time];
  const Icon = config.icon;

  const handleTakeClick = () => {
    if (isConfirmed) {
      return;
    }
    setIsConfirmed(true);
    onTake();
    setTimeout(() => {
      onClose();
    }, 800);
  };

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        className="bg-white rounded-xl w-[90%] max-w-md min-h-[400px] px-6 pt-8 pb-6 flex flex-col items-center justify-start"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 메시지 */}
        <p
          className="text-4xl font-bold mb-8"
          style={{ color: 'var(--color-primary)' }}
        >
          약 드실 시간입니다!
        </p>

        {/* 약 정보 */}
        <div className="w-full flex items-center gap-6 mb-10">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: config.iconBg }}
          >
            <Icon className="w-16 h-16" style={{ color: config.iconColor }} />
          </div>
          <div className="flex-1">
            <p className="text-2xl font-bold text-black mb-2">{config.label}</p>
            <p className="text-xl text-gray-600">
              {medication.medicationName} {medication.dosage}
            </p>
          </div>
        </div>

        {/* 복용 버튼 */}
        <button
          onClick={handleTakeClick}
          className={`w-40 h-40 rounded-full flex items-center justify-center shadow-lg hover:opacity-90 transition-opacity border-primary border-2 ${isConfirmed ? 'bg-primary' : 'bg-white'}`}
        >
          {isConfirmed ? (
            <Check className="w-20 h-20 text-white" />
          ) : (
            <span className="text-3xl font-semibold text-primary">
              복용 완료
            </span>
          )}
        </button>
      </div>
    </div>
  );
};

export default MedicationReminderModal;
