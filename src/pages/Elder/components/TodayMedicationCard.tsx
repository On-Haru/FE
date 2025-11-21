import { Sun, Moon, Check } from 'lucide-react';

export type MedicationTime = 'morning' | 'lunch' | 'evening';

interface TodayMedicationCardProps {
  time: MedicationTime;
  medicationName: string;
  dosage: string;
  isTaken: boolean;
}

const TodayMedicationCard = ({
  time,
  medicationName,
  dosage,
  isTaken,
}: TodayMedicationCardProps) => {
  const timeConfig = {
    morning: {
      label: '아침 약',
      bgColor: 'var(--color-morning-secondary)',
      iconColor: 'var(--color-morning-primary)',
      icon: Sun,
    },
    lunch: {
      label: '점심 약',
      bgColor: 'var(--color-lunch-secondary)',
      iconColor: 'var(--color-lunch-primary)',
      icon: Sun,
    },
    evening: {
      label: '저녁 약',
      bgColor: 'var(--color-evening-secondary)',
      iconColor: 'var(--color-evening-primary)',
      icon: Moon,
    },
  };

  const config = timeConfig[time];
  const Icon = config.icon;

  return (
    <div className="mb-3">
      <div
        className="rounded-2xl px-6 py-4 flex items-center justify-between"
        style={{ backgroundColor: config.bgColor }}
      >
        <div className="flex items-center gap-3 flex-1">
          <Icon
            className="w-6 h-6 flex-shrink-0"
            style={{ color: config.iconColor }}
          />
          <div className="flex-1">
            <p className="text-base font-medium text-gray-800 mb-1">
              {config.label}
            </p>
            <p className="text-sm text-gray-600">
              {medicationName} {dosage}
            </p>
          </div>
        </div>
        <div className="flex-shrink-0">
          {isTaken ? (
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-morning-primary)' }}
            >
              <Check className="w-5 h-5 text-white" />
            </div>
          ) : (
            <button
              className="px-4 py-2 text-white text-sm font-medium rounded-lg"
              style={{ backgroundColor: 'var(--color-lunch-primary)' }}
            >
              복용 예정
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TodayMedicationCard;
