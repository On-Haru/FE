// Report API 응답 타입 정의

export type PeriodType = 'ONBOARDING' | 'MONTHLY';
export type ComparisonDirection = 'UP' | 'DOWN';
export type TimePatternStatus = 'GOOD' | 'WARN' | 'BAD' | 'NONE';

export interface ComparisonRate {
  diff: number;
  direction: ComparisonDirection;
}

export interface ReportMeta {
  reportId: number | null;
  title: string;
  periodType: PeriodType;
  dateRange: string;
}

export interface AIAnalysis {
  summary: string;
  suggestion: string | null;
  riskTags: string[];
}

export interface Statistics {
  overallRate: number;
  comparisonRate: ComparisonRate | null;
  averageDelayMinutes: number | null;
  missedCount: number | null;
}

export interface TimePattern {
  label: string; // '아침', '점심', '저녁'
  rate: number;
  status: TimePatternStatus;
}

export interface MedicinePattern {
  medicineName: string;
  rate: number;
  aiComment: string | null;
}

export interface ChartData {
  timePattern: TimePattern[];
  medicinePattern: MedicinePattern[];
}

export interface ReportData {
  reportMeta: ReportMeta;
  aiAnalysis: AIAnalysis;
  statistics: Statistics;
  chartData: ChartData;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  errorCode: string | null;
  message: string | null;
}

