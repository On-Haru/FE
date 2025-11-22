
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronDown, BarChart3, Clock, Pill, AlertTriangle } from 'lucide-react';
import { gsap } from 'gsap';
import ReportUserInfo from './components/ReportUserInfo';
import ReportAISummary from './components/ReportAISummary';
import ReportOverallStats from './components/ReportOverallStats';
import ReportTimePattern from './components/ReportTimePattern';
import ReportMedicinePattern from './components/ReportMedicinePattern';
import ReportRiskSignals from './components/ReportRiskSignals';
import ReportLoading from './components/ReportLoading';
import { getReport } from './services/report';
import type { ReportData } from '@/types/report';

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

  const [searchParams] = useSearchParams();


  // 각 섹션의 열림/닫힘 상태 관리 (기본값: 모두 열림)
  const [isOverallStatsOpen, setIsOverallStatsOpen] = useState(true);
  const [isTimePatternOpen, setIsTimePatternOpen] = useState(true);
  const [isMedicinePatternOpen, setIsMedicinePatternOpen] = useState(true);
  const [isRiskSignalsOpen, setIsRiskSignalsOpen] = useState(true);


  // API 데이터 상태 관리
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // URL에서 파라미터 추출
  const elderId = searchParams.get('elderId');
  const yearParam = searchParams.get('year');
  const monthParam = searchParams.get('month');

  // 현재 날짜 기준으로 year, month 설정
  const now = new Date();
  const year = yearParam ? parseInt(yearParam, 10) : now.getFullYear();
  const month = monthParam ? parseInt(monthParam, 10) : now.getMonth() + 1;

  // 리포트 제목에서 사용자 이름 추출 (예: "김노인 2025년 11월 복약 리포트" → "김노인")
  const extractNameFromTitle = (title: string): string => {
    const match = title.match(/^(.+?)\s+\d{4}년/);
    return match ? match[1] : '사용자';
  };

  useEffect(() => {
    const fetchReport = async () => {
      if (!elderId) {
        setError('사용자 ID가 필요합니다.');
        setIsLoading(false);
        return;
      }

      const startTime = Date.now();
      const MIN_LOADING_TIME = 2000; // 최소 2초 로딩 시간

      try {
        setIsLoading(true);
        setError(null);
        const userId = parseInt(elderId, 10);

        console.log('[ReportPage] 리포트 조회 시작:', { elderId, userId, year, month });

        if (isNaN(userId)) {
          setError('유효하지 않은 사용자 ID입니다.');
          setIsLoading(false);
          return;
        }

        const data = await getReport(userId, year, month);
        console.log('[ReportPage] 리포트 데이터 수신:', data);

        // 최소 로딩 시간 보장
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);

        if (remainingTime > 0) {
          await new Promise(resolve => setTimeout(resolve, remainingTime));
        }

        setReportData(data);
      } catch (err: any) {
        // 최소 로딩 시간 보장 (에러 발생 시에도)
        const elapsedTime = Date.now() - startTime;
        const remainingTime = Math.max(0, MIN_LOADING_TIME - elapsedTime);

        if (remainingTime > 0) {
          await new Promise(resolve => setTimeout(resolve, remainingTime));
        }

        // 401 에러인 경우 특별 처리
        if (err.response?.status === 401) {
          setError('인증이 필요합니다. 다시 로그인해주세요.');
        } else if (err.response?.status) {
          const errorMessage = err.response?.data?.message || `리포트를 불러오는 중 오류가 발생했습니다. (${err.response.status})`;
          setError(errorMessage);
        } else {
          setError(err.message || '리포트를 불러오는 중 오류가 발생했습니다.');
        }
        console.error('Failed to fetch report:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [elderId, year, month]);

  // 로딩 상태
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">리포트를 불러오는 중...</p>
      </div>
    );
  }

  // 에러 상태
  if (error || !reportData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-red-500">{error || '리포트 데이터를 불러올 수 없습니다.'}</p>
      </div>
    );
  }

  // 사용자 이름 추출
  const userName = extractNameFromTitle(reportData.reportMeta.title);
  const birthYear = 1954; // API에 없으므로 mock 데이터 유지
return (
    <div className="relative min-h-full">
      <ReportLoading isLoading={isLoading} />

      {!isLoading && reportData && (
        <div className="flex flex-col min-h-full gap-2">
          <ReportUserInfo name={userName} birthYear={birthYear} />

          <ReportAISummary summary={reportData.aiAnalysis.summary} />

          <CollapsibleSection
            title="전체 복약 통계"
            icon={<BarChart3 className="w-5 h-5 text-primary" />}
            isOpen={isOverallStatsOpen}
            onToggle={() => setIsOverallStatsOpen(!isOverallStatsOpen)}
          >
            <ReportOverallStats statistics={reportData.statistics} />
          </CollapsibleSection>

          <CollapsibleSection
            title="시간대별 복약 패턴"
            icon={<Clock className="w-5 h-5 text-primary" />}
            isOpen={isTimePatternOpen}
            onToggle={() => setIsTimePatternOpen(!isTimePatternOpen)}
          >
            <ReportTimePattern timePattern={reportData.chartData.timePattern} />
          </CollapsibleSection>

          <CollapsibleSection
            title="약별 복용 패턴"
            icon={<Pill className="w-5 h-5 text-primary" />}
            isOpen={isMedicinePatternOpen}
            onToggle={() => setIsMedicinePatternOpen(!isMedicinePatternOpen)}
            subtitle={`현재 총 복용 중인 약 · ${reportData.chartData.medicinePattern.length}개`}
          >
            <ReportMedicinePattern
              medicinePattern={reportData.chartData.medicinePattern}
              averageDelayMinutes={reportData.statistics.averageDelayMinutes}
            />
          </CollapsibleSection>

          <CollapsibleSection
            title="복약 지연 통계"
            icon={<AlertTriangle className="w-5 h-5 text-primary" />}
            isOpen={isRiskSignalsOpen}
            onToggle={() => setIsRiskSignalsOpen(!isRiskSignalsOpen)}
          >
            <ReportRiskSignals
              quickResponseRate={42}
              delayedResponseRate={18}
            />
          </CollapsibleSection>
        </div>
      )}
    </div>
  );
};

export default ReportPage;