import ReportUserInfo from './components/ReportUserInfo';
import ReportAISummary from './components/ReportAISummary';
import ReportOverallStats from './components/ReportOverallStats';
import ReportTimePattern from './components/ReportTimePattern';
import ReportMedicinePattern from './components/ReportMedicinePattern';
import ReportRiskSignals from './components/ReportRiskSignals';

const ReportPage = () => {
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
    <div className="flex flex-col min-h-full gap-4">
      <ReportUserInfo name={mockData.name} birthYear={mockData.birthYear} />
      <ReportAISummary summary={mockData.aiSummary} />
      <ReportOverallStats statistics={mockData.statistics} />
      <ReportTimePattern timePattern={mockData.timePattern} />
      <ReportMedicinePattern
        medicinePattern={mockData.medicinePattern}
        averageDelayMinutes={mockData.statistics.averageDelayMinutes}
      />
      <ReportRiskSignals
        quickResponseRate={mockData.riskSignals.quickResponseRate}
        delayedResponseRate={mockData.riskSignals.delayedResponseRate}
        suggestion={mockData.riskSignals.suggestion}
      />
    </div>
  );
};

export default ReportPage;
