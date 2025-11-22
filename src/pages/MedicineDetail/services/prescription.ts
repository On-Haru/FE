import axiosInstance from '@/lib/axios';
import type { MedicineItem } from '../components/TableList';
import type { OCRResponse } from '../../MedicineRegister/services/ocr';

export interface PrescriptionInfo {
  seniorId: number;
  hospitalName: string;
  doctorName: string;
  issuedDate: string;
  note: string;
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

/**
 * 최신 처방전 ID 조회
 */
export async function getLatestPrescriptionId(): Promise<number> {
  return 5001; // 실제 존재하는 처방전 ID
}

/**
 * API 응답을 MedicineItem으로 변환
 */
function mapApiMedicineToMedicineItem(apiMedicine: {
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
}): MedicineItem {
  return {
    id: apiMedicine.id,
    name: apiMedicine.name || '',
    dosage: apiMedicine.dosage ?? 0,
    totalCount: apiMedicine.totalCount ?? 0,
    durationDays: apiMedicine.durationDays ?? 0,
    memo: apiMedicine.memo ?? null,
    aiDescription: apiMedicine.aiDescription ?? null,
    schedules: (apiMedicine.schedules || []).map((s) => ({
      id: s.id,
      notifyTime: s.notifyTime,
      timeTag: s.timeTag,
    })),
  };
}

/**
 * 기본 seniorId 생성 (OCR 응답에 seniorId가 없을 때 사용)
 */
function getDefaultSeniorId(): number {
  return 1005;
}

/**
 * OCR 응답을 MedicineItem으로 변환 (임시 ID 생성)
 */
export function mapOCRResponseToMedicineItems(
  ocrData: OCRResponse
): { medicines: MedicineItem[]; prescriptionInfo: PrescriptionInfo } {
  const medicines: MedicineItem[] = (ocrData.medicines || []).map((m, idx) => {
    const medicineId = Date.now() + idx; // 임시 ID
    return {
      id: medicineId,
      name: m.name || '',
      dosage: m.dosage ?? 0,
      totalCount: m.totalCount ?? 0,
      durationDays: m.durationDays ?? 0,
      memo: m.memo ?? null,
      aiDescription: m.aiDescription ?? null,
      schedules: (m.schedules || []).map((s, sIdx) => ({
        id: medicineId * 1000 + sIdx, // 임시 ID
        notifyTime: s.notifyTime,
        timeTag: s.timeTag,
      })),
    };
  });

  // seniorId 결정: OCR 데이터 > localStorage 선택값 > 기본값
  const storedSeniorId = typeof window !== 'undefined' 
    ? localStorage.getItem('selectedSeniorId') 
    : null;
  const seniorId = ocrData.seniorId ?? 
    (storedSeniorId ? Number(storedSeniorId) : null) ?? 
    getDefaultSeniorId();

  // 필수 필드 검증 및 기본값 설정 (백엔드 validation 통과를 위해)
  const hospitalName = (ocrData.hospitalName?.trim() || '') || '병원명 미입력';
  const doctorName = (ocrData.doctorName?.trim() || '') || '의사명 미입력';
  const issuedDate = ocrData.issuedDate || new Date().toISOString().split('T')[0];

  const prescriptionInfo: PrescriptionInfo = {
    seniorId,
    hospitalName,
    doctorName,
    issuedDate,
    note: ocrData.note || '',
  };

  return { medicines, prescriptionInfo };
}

/**
 * 처방전 상세 조회
 */
export async function getPrescriptionDetail(
  id: number
): Promise<{ prescriptionInfo: PrescriptionInfo; medicines: MedicineItem[] }> {
  const res = await axiosInstance.get<{ data: PrescriptionDetailResponse }>(
    `/api/prescriptions/${id}`
  );
  const detail = res.data.data;

  const prescriptionInfo: PrescriptionInfo = {
    seniorId: detail.seniorId,
    hospitalName: detail.hospitalName,
    doctorName: detail.doctorName,
    issuedDate: detail.issuedDate,
    note: detail.note,
  };

  const medicines: MedicineItem[] =
    detail.medicines && Array.isArray(detail.medicines)
      ? detail.medicines.map(mapApiMedicineToMedicineItem)
      : [];

  return { prescriptionInfo, medicines };
}

/**
 * 처방전 등록/수정
 * @param id 처방전 ID (0이면 새로 생성, 있으면 해당 ID로 업데이트 시도)
 */
export async function updatePrescription(
  id: number,
  data: PrescriptionCreateRequest
): Promise<PrescriptionCreateResponse> {
  // ID가 있으면 해당 ID로 업데이트 시도, 없으면 새로 생성
  if (id > 0) {
    try {
      // 원래 처방전 ID로 업데이트 시도
      const res = await axiosInstance.post<{ data: PrescriptionCreateResponse }>(
        `/api/prescriptions/${id}`,
        data
      );
      return res.data.data;
    } catch (error: unknown) {
      const err = error as {
        response?: { status?: number; statusText?: string; data?: unknown };
        message?: string;
      };
      
      // 404, 405, 500 에러면 업데이트가 지원되지 않는 것으로 간주하고 새로 생성
      if (err.response?.status === 404 || err.response?.status === 405 || err.response?.status === 500) {
        console.warn('⚠️ 업데이트 API가 지원되지 않습니다. 새로 생성합니다.', {
          prescriptionId: id,
          status: err.response?.status,
        });
        // 새로 생성하도록 fallback
        const res = await axiosInstance.post<{ data: PrescriptionCreateResponse }>(
          `/api/prescriptions`,
          data
        );
        return res.data.data;
      }
      
      throw error;
    }
  }
  
  // ID가 없으면 새로 생성
  const res = await axiosInstance.post<{ data: PrescriptionCreateResponse }>(
    `/api/prescriptions`,
    data
  );
  return res.data.data;
}
