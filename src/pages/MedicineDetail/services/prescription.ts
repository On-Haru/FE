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
  note: string;
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
  [key: string]: unknown;
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

  const prescriptionInfo: PrescriptionInfo = {
    seniorId: ocrData.seniorId ?? 1001, // TODO: 실제 seniorId 가져오기
    hospitalName: ocrData.hospitalName ?? '',
    doctorName: ocrData.doctorName ?? '',
    issuedDate: ocrData.issuedDate ?? new Date().toISOString().split('T')[0],
    note: ocrData.note ?? '',
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
 */
export async function updatePrescription(
  _id: number,
  data: PrescriptionCreateRequest
): Promise<PrescriptionCreateResponse> {
  const res = await axiosInstance.post<{ data: PrescriptionCreateResponse }>(
    `/api/prescriptions`,
    data
  );
  return res.data.data;
}
