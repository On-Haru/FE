/**
 * 처방전 관련 공통 타입 정의
 */

export interface PrescriptionInfo {
  seniorId: number;
  hospitalName: string;
  doctorName: string;
  issuedDate: string;
  note: string;
}

export interface Schedule {
  id: number;
  notifyTime: string;
  timeTag: 'MORNING' | 'LUNCH' | 'EVENING';
}

export interface MedicineItem {
  id: number;
  name: string;
  dosage: number;
  totalCount: number;
  durationDays: number;
  memo?: string | null;
  aiDescription?: string | null;
  schedules: Schedule[];
}

export interface PrescriptionDetailResponse {
  id: number;
  seniorId: number;
  hospitalName: string;
  doctorName: string;
  issuedDate: string;
  note: string;
  medicines?: Array<{
    id: number;
    name: string;
    dosage: number;
    totalCount: number;
    durationDays: number;
    memo?: string | null;
    aiDescription?: string | null;
    schedules?: Array<{
      id: number;
      notifyTime: string;
      timeTag: 'MORNING' | 'LUNCH' | 'EVENING';
    }>;
  }>;
}

export interface PrescriptionCreateRequest {
  seniorId: number;
  hospitalName: string;
  doctorName: string;
  issuedDate: string;
  note: string | null;
  medicines: Array<{
    name: string;
    dosage: number;
    totalCount: number;
    durationDays: number;
    memo?: string | null;
    aiDescription?: string | null;
    schedules: Array<{
      notifyTime: string;
      timeTag: 'MORNING' | 'LUNCH' | 'EVENING';
    }>;
  }>;
}

export interface PrescriptionCreateResponse {
  id: number;
  seniorId: number;
  issuedDate: string;
  hospitalName: string;
  doctorName: string;
  note: string;
}

export interface PrescriptionUpdateResponse {
  success: boolean;
  data: {
    id: number;
    seniorId: number;
    hospitalName: string;
    doctorName: string;
    issuedDate: string;
    note: string;
    medicines: Array<{
      id: number;
      prescriptionId: number;
      name: string;
      dosage: number;
      totalCount: number;
      durationDays: number;
      memo: string | null;
      aiDescription: string | null;
      schedules: Array<{
        id: number;
        notifyTime: string;
        timeTag: 'MORNING' | 'LUNCH' | 'EVENING';
      }>;
    }>;
  };
  errorCode: string | null;
  message: string | null;
}

export interface PrescriptionDeleteResponse {
  success: boolean;
  data: {};
  errorCode: string | null;
  message: string | null;
}

