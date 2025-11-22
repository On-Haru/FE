import { Sunrise, Sun, Moon, Check } from 'lucide-react';

export type MedicationTime = 'morning' | 'lunch' | 'evening';

export interface Medication {
  id: number;
  time: MedicationTime;
  medicationName: string;
  dosage: string;
  isTaken: boolean;
  scheduleId?: number; // API 호출에 필요 (복용 여부 업데이트)
  scheduledDateTime?: string; // API 호출에 필요 (복용 여부 업데이트)
}

// timeConfig는 컴포넌트 외부로 이동하여 렌더링마다 재생성되지 않도록 최적화
const timeConfig = {
  morning: {
    label: '아침 약',
    bgColor: 'var(--color-morning-secondary)',
    iconColor: 'var(--color-morning-primary)',
    badgeBg: 'var(--color-morning-primary)',
    icon: Sunrise,
  },
  lunch: {
    label: '점심 약',
    bgColor: 'var(--color-lunch-secondary)',
    iconColor: 'var(--color-lunch-primary)',
    badgeBg: 'var(--color-lunch-primary)',
    icon: Sun,
  },
  evening: {
    label: '저녁 약',
    bgColor: 'var(--color-evening-secondary)',
    iconColor: 'var(--color-evening-primary)',
    badgeBg: 'var(--color-evening-primary)',
    icon: Moon,
  },
} as const;

interface TodayMedicationCardProps {
  time: MedicationTime;
  medicationName: string;
  dosage: string;
  isTaken: boolean;
  onClick?: () => void;
}

const TodayMedicationCard = ({
  time,
  medicationName,
  dosage,
  isTaken,
  onClick,
}: TodayMedicationCardProps) => {
  const config = timeConfig[time];
  const Icon = config.icon;

  // 복용된 경우 회색으로 변경
  const cardBgColor = isTaken ? '#E5E5E5' : config.bgColor;
  const iconColor = isTaken ? '#9CA3AF' : config.iconColor;
  const textColor = isTaken ? '#9CA3AF' : undefined;

  return (
    <div className="mb-3">
      <div
        className={`rounded-xl px-6 py-4 flex items-center justify-between ${
          !isTaken ? 'hover:opacity-90 transition-opacity cursor-pointer' : ''
        }`}
        style={{ backgroundColor: cardBgColor }}
        onClick={!isTaken ? onClick : undefined}
      >
        <div className="flex items-center gap-3 flex-1">
          <Icon
            className="w-10 h-10 flex-shrink-0"
            style={{ color: iconColor }}
          />
          <div className="flex-1">
            <p
              className="text-xl font-medium mb-2"
              style={{ color: textColor || '#1F2937' }}
            >
              {config.label}
            </p>
            <p className="text-lg" style={{ color: textColor || '#4B5563' }}>
              {medicationName} {dosage}
            </p>
          </div>
        </div>
        <div className="flex-shrink-0">
          {isTaken ? (
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: '#9CA3AF' }}
            >
              <Check className="w-7 h-7 text-white" />
            </div>
          ) : (
            <div
              className="px-5 py-3 text-white text-base font-semibold rounded-full"
              style={{ backgroundColor: config.badgeBg }}
            >
              복용 예정
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodayMedicationCard;
