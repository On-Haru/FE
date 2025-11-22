import { useState, useEffect, useRef } from 'react';
import { ChevronDown, BarChart3, Clock, Pill, AlertTriangle } from 'lucide-react';
import { gsap } from 'gsap';
import ReportUserInfo from './components/ReportUserInfo';
import ReportAISummary from './components/ReportAISummary';
import ReportOverallStats from './components/ReportOverallStats';
import ReportTimePattern from './components/ReportTimePattern';
import ReportMedicinePattern from './components/ReportMedicinePattern';
import ReportRiskSignals from './components/ReportRiskSignals';
import ReportLoading from './components/ReportLoading';

// 토글 가능한 섹션 컴포넌트
interface CollapsibleSectionProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  subtitle?: string;
}

const CollapsibleSection = ({
  title,
  icon,
  children,
  isOpen,
  onToggle,
  subtitle,
}: CollapsibleSectionProps) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const chevronRef = useRef<HTMLDivElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const content = contentRef.current;
    const chevron = chevronRef.current;

    if (!content) return;

    // 첫 렌더링 시 애니메이션 없이 초기 상태 설정
    if (isFirstRender.current) {
      isFirstRender.current = false;
      if (isOpen) {
        gsap.set(content, { height: 'auto', opacity: 1, y: 0 });
        if (chevron) {
          gsap.set(chevron, { rotation: 180 });
        }
      } else {
        gsap.set(content, { height: 0, opacity: 0, y: -10 });
        if (chevron) {
          gsap.set(chevron, { rotation: 0 });
        }
      }
      return;
    }

    if (isOpen) {
      // 열릴 때: 높이 자동 계산 후 슬라이드 다운 + 페이드 인
      gsap.set(content, { height: 'auto', opacity: 0, y: -10 });
      const height = content.offsetHeight;
      gsap.set(content, { height: 0, opacity: 0, y: -10 });

      gsap.to(content, {
        height: height,
        opacity: 1,
        y: 0,
        duration: 0.4,
        ease: 'power2.out',
      });

      // Chevron 회전
      if (chevron) {
        gsap.to(chevron, {
          rotation: 180,
          duration: 0.3,
          ease: 'power2.out',
        });
      }
    } else {
      // 닫힐 때: 슬라이드 업 + 페이드 아웃
      gsap.to(content, {
        height: 0,
        opacity: 0,
        y: -10,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          gsap.set(content, { height: 0 });
        },
      });

      // Chevron 회전
      if (chevron) {
        gsap.to(chevron, {
          rotation: 0,
          duration: 0.3,
          ease: 'power2.out',
        });
      }
    }
  }, [isOpen]);

  return (
    <div className="mb-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-2 rounded-lg bg-white hover:bg-primary/5 transition-colors cursor-pointer focus:outline-none"
      >
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-lg font-semibold text-black">{title}</h2>
          {subtitle && (
            <span className="text-sm text-gray-600 font-normal" style={{ transform: 'translateY(2px)' }}>{subtitle}</span>
          )}
        </div>
        <div ref={chevronRef}>
          <ChevronDown
            className="w-5 h-5 text-primary"
          />
        </div>
      </button>
      <div
        ref={contentRef}
        className="overflow-hidden"
        style={{ height: isOpen ? 'auto' : 0 }}
      >
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
};

const ReportPage = () => {
  // 로딩 상태 관리
  const [isLoading, setIsLoading] = useState(true);

  // 각 섹션의 열림/닫힘 상태 관리 (기본값: 모두 열림)
  const [isOverallStatsOpen, setIsOverallStatsOpen] = useState(true);
  const [isTimePatternOpen, setIsTimePatternOpen] = useState(true);
  const [isMedicinePatternOpen, setIsMedicinePatternOpen] = useState(true);
  const [isRiskSignalsOpen, setIsRiskSignalsOpen] = useState(true);

  // 로딩 시뮬레이션 (실제로는 API 호출로 대체)
  useEffect(() => {
    // 3초 후 로딩 완료 (실제로는 API 응답을 기다림)
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);
  // 임시 mock 데이터
  const mockData = {
    name: '김노인',
    birthYear: 1954,
    aiSummary: '지난 30일 동안 김노인 님의 전체 복약률은 82%로 비교적 안정적이지만, 특히 저녁 시간대와 주말에 복약 누락이 자주 발생합니다. 관절약은 금요일 저녁에 복약률이 크게 떨어지는 패턴이 반복되고 있어, 해당 시간대에 보호자 알림을 강화하거나 복약 시간을 앞당기는 것을 추천합니다.',
    statistics: {
      overallRate: 82,
      comparisonRate: {
        diff: 6,
        direction: 'UP' as const,
      },
      averageDelayMinutes: 22,
      missedCount: 14,
    },
    timePattern: [
      { label: '아침', rate: 94, status: 'GOOD' as const },
      { label: '점심', rate: 82, status: 'WARN' as const },
      { label: '저녁', rate: 38, status: 'BAD' as const },
    ],
    medicinePattern: [
      {
        medicineName: '혈압약',
        rate: 92,
        aiComment: '전반적으로 안정적인 복약 패턴입니다. 중요한 혈압약은 대부분 제때 복용하고 있습니다.',
      },
      {
        medicineName: '타이레놀',
        rate: 92,
        aiComment: '전반적으로 안정적인 복약 패턴입니다. 중요한 혈압약은 대부분 제때 복용하고 있습니다.',
      },
      {
        medicineName: '관절약',
        rate: 92,
        aiComment: '전반적으로 안정적인 복약 패턴입니다. 중요한 혈압약은 대부분 제때 복용하고 있습니다.',
      },
    ],
    riskSignals: {
      quickResponseRate: 42,
      delayedResponseRate: 18,
      suggestion: '저녁 시간대에는 TV 시청 전으로 알림 시간을 조정하거나, 보호자가 전화/메시지로 한 번 더 확인해 주면 좋습니다.',
    },
  };

  return (
    <div className="relative min-h-full">
      <ReportLoading isLoading={isLoading} />

      {!isLoading && (
        <div className="flex flex-col min-h-full gap-2">
          <ReportUserInfo name={mockData.name} birthYear={mockData.birthYear} />

          <ReportAISummary summary={mockData.aiSummary} />

          <CollapsibleSection
            title="전체 복약 통계"
            icon={<BarChart3 className="w-5 h-5 text-primary" />}
            isOpen={isOverallStatsOpen}
            onToggle={() => setIsOverallStatsOpen(!isOverallStatsOpen)}
          >
            <ReportOverallStats statistics={mockData.statistics} />
          </CollapsibleSection>

          <CollapsibleSection
            title="시간대별 복약 패턴"
            icon={<Clock className="w-5 h-5 text-primary" />}
            isOpen={isTimePatternOpen}
            onToggle={() => setIsTimePatternOpen(!isTimePatternOpen)}
          >
            <ReportTimePattern timePattern={mockData.timePattern} />
          </CollapsibleSection>

          <CollapsibleSection
            title="약별 복용 패턴"
            icon={<Pill className="w-5 h-5 text-primary" />}
            isOpen={isMedicinePatternOpen}
            onToggle={() => setIsMedicinePatternOpen(!isMedicinePatternOpen)}
            subtitle={`현재 총 복용 중인 약 · ${mockData.medicinePattern.length}개`}
          >
            <ReportMedicinePattern
              medicinePattern={mockData.medicinePattern}
              averageDelayMinutes={mockData.statistics.averageDelayMinutes}
            />
          </CollapsibleSection>

          <CollapsibleSection
            title="위험 신호 & 행동 제안"
            icon={<AlertTriangle className="w-5 h-5 text-primary" />}
            isOpen={isRiskSignalsOpen}
            onToggle={() => setIsRiskSignalsOpen(!isRiskSignalsOpen)}
          >
            <ReportRiskSignals
              quickResponseRate={mockData.riskSignals.quickResponseRate}
              delayedResponseRate={mockData.riskSignals.delayedResponseRate}
              suggestion={mockData.riskSignals.suggestion}
            />
          </CollapsibleSection>
        </div>
      )}
    </div>
  );
};

export default ReportPage;