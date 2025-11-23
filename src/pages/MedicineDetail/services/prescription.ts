import axiosInstance from '@/lib/axios';
import type {
  PrescriptionInfo,
  MedicineItem,
  PrescriptionDetailResponse,
  PrescriptionCreateRequest,
  PrescriptionCreateResponse,
  PrescriptionUpdateResponse,
  PrescriptionDeleteResponse,
} from '@/pages/MedicineDetail/types/prescription';
import type { OCRResponse } from '@/pages/MedicineRegister/services/ocr';

// 타입 재export
export type {
  PrescriptionInfo,
  MedicineItem,
  PrescriptionDetailResponse,
  PrescriptionCreateRequest,
  PrescriptionCreateResponse,
  PrescriptionUpdateResponse,
  PrescriptionDeleteResponse,
};


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
  const medicines: MedicineItem[] = (ocrData.medicines || []).map(
    (m: OCRResponse['medicines'][0], idx: number) => {
      const medicineId = Date.now() + idx; // 임시 ID
      return {
        id: medicineId,
        name: m.name || '',
        dosage: m.dosage ?? 0,
        totalCount: m.totalCount ?? 0,
        durationDays: m.durationDays ?? 0,
        memo: m.memo ?? null,
        aiDescription: m.aiDescription ?? null,
        schedules: (m.schedules || []).map(
          (s: OCRResponse['medicines'][0]['schedules'][0], sIdx: number) => ({
            id: medicineId * 1000 + sIdx, // 임시 ID
            notifyTime: s.notifyTime,
            timeTag: s.timeTag,
          })
        ),
      };
    }
  );

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
 * @param prescriptionId 처방전 ID (0이면 새로 생성, 있으면 업데이트)
 * @param data 처방전 데이터
 */
export async function updatePrescription(
  prescriptionId: number,
  data: PrescriptionCreateRequest
): Promise<PrescriptionUpdateResponse['data']> {
  if (prescriptionId > 0) {
    // 기존 처방전 업데이트 (PUT)
    const res = await axiosInstance.put<PrescriptionUpdateResponse>(
      `/api/prescriptions/${prescriptionId}`,
      data
    );
    return res.data.data;
  } else {
    // 새 처방전 생성 (POST)
    const res = await axiosInstance.post<{ data: PrescriptionCreateResponse }>(
      `/api/prescriptions`,
      data
    );
    // POST 응답을 PUT 응답 형식으로 변환
    return {
      id: res.data.data.id,
      seniorId: res.data.data.seniorId,
      hospitalName: res.data.data.hospitalName,
      doctorName: res.data.data.doctorName,
      issuedDate: res.data.data.issuedDate,
      note: res.data.data.note,
      medicines: [], // POST 응답에는 medicines가 없으므로 빈 배열
    };
  }
}

/**
 * 처방전 삭제
 * @param prescriptionId 처방전 ID
 */
export async function deletePrescription(
  prescriptionId: number
): Promise<PrescriptionDeleteResponse> {
  const res = await axiosInstance.delete<PrescriptionDeleteResponse>(
    `/api/prescriptions/${prescriptionId}`
  );
  return res.data;
}
