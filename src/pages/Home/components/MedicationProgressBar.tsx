import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import type { TodayMedicationStatus } from '@/types/caregiver';

interface MedicationProgressBarProps {
  /** 오늘의 복용 현황 */
  status: TodayMedicationStatus;
}

const MedicationProgressBar = ({ status }: MedicationProgressBarProps) => {
  const { takenCount, totalCount } = status;
  const progressBarRef = useRef<HTMLDivElement>(null);
  const countTextRef = useRef<HTMLParagraphElement>(null);
  const [animatedTakenCount, setAnimatedTakenCount] = useState(0);

  // 0으로 나누기 방지 및 진행률 계산
  const progressPercentage =
    totalCount > 0 ? (takenCount / totalCount) * 100 : 0;

  useEffect(() => {
    const progressBar = progressBarRef.current;
    const countText = countTextRef.current;

    if (!progressBar || !countText) return;

    // 초기 상태 설정
    gsap.set(progressBar, { width: 0 });
    setAnimatedTakenCount(0);

    // 프로그레스 바 애니메이션
    gsap.to(progressBar, {
      width: `${progressPercentage}%`,
      duration: 0.8,
      ease: 'power2.out',
    });

    // 숫자 카운트업 애니메이션
    const countObj = { value: 0 };
    gsap.to(countObj, {
      value: takenCount,
      duration: 0.8,
      ease: 'power2.out',
      onUpdate: () => {
        setAnimatedTakenCount(Math.round(countObj.value));
      },
    });
  }, [takenCount, totalCount, progressPercentage]);

  return (
    <div className="w-full space-y-2">
      {/* 진행바 */}
      <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
        <div
          ref={progressBarRef}
          className="h-full bg-primary rounded-full"
          style={{ width: 0 }}
        />
      </div>

      {/* 분수 텍스트 (예: "1/3") */}
      <p ref={countTextRef} className="text-sm text-gray-600 text-right">
        {animatedTakenCount}/{totalCount}
      </p>
    </div>
  );
};

export default MedicationProgressBar;
