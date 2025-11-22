import axiosInstance from '@/lib/axios';
import type { MedicineItem } from '../components/TableList';

export interface Prescription {
  id: number;
  seniorId: number;
  issuedDate: string;
  hospitalName: string;
  doctorName: string;
  note: string;
  medicines: MedicineItem[];
}

interface ApiPrescriptionResponse {
  id: number;
  seniorId: number;
  issuedDate: string;
  hospitalName: string;
  doctorName: string;
  note: string;
  medicines: Array<{
    id: number;
    prescriptionId: number;
    name: string;
    dosage?: number;
    dailyDoseCount?: number;
    administrationMethod: string | null;
    memo: string | null;
    totalCount: number | null;
    durationDays: number | null;
    aiDescription: string | null;
  }>;
}

/**
 * API 응답을 UI 모델로 변환
 */
function mapApiResponseToPrescription(
  apiResponse: ApiPrescriptionResponse
): Prescription {
  return {
    id: apiResponse.id,
    seniorId: apiResponse.seniorId,
    issuedDate: apiResponse.issuedDate,
    hospitalName: apiResponse.hospitalName || '',
    doctorName: apiResponse.doctorName || '',
    note: apiResponse.note || '',
    medicines: (apiResponse.medicines || []).map((m) => ({
      id: m.id,
      prescriptionId: m.prescriptionId,
      name: m.name || '',
      dailyDoseCount: m.dosage ?? m.dailyDoseCount ?? null,
      administrationMethod: m.administrationMethod ?? null,
      memo: m.memo ?? null,
      totalCount: m.totalCount ?? null,
      durationDays: m.durationDays ?? null,
      aiDescription: m.aiDescription ?? null,
    })),
  };
}

/**
 * 시니어별 이전 처방전 목록 조회
 * @param seniorId 시니어 ID
 * @returns UI 모델로 변환된 처방전 목록
 */
export async function getPreviousPrescriptions(
  seniorId: number
): Promise<Prescription[]> {
  const res = await axiosInstance.get<{ data: ApiPrescriptionResponse[] }>(
    `/api/prescriptions?seniorId=${seniorId}`
  );
  const data = res.data.data || [];
  return data.map(mapApiResponseToPrescription);
}
