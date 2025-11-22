import axiosInstance from '@/lib/axios';

export interface OCRResponse {
  id: null;
  seniorId: number | null;
  hospitalName: string | null;
  doctorName: string | null;
  issuedDate: string | null;
  note: string | null;
  medicines: {
    id: null;
    prescriptionId: null;
    name: string;
    dosage: number;
    totalCount: number;
    durationDays: number;
    memo: string | null;
    aiDescription: string | null;
    schedules: {
      id: null;
      notifyTime: string;
      timeTag: 'MORNING' | 'LUNCH' | 'EVENING';
    }[];
  }[];
}

/**
 * 처방전 OCR 업로드
 * @param file 처방전 사진 파일
 * @returns OCR로 추출된 처방전 데이터 (id는 모두 null)
 */
export async function uploadPrescriptionOCR(file: File): Promise<OCRResponse> {
  // 파일 검증
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    throw new Error(`파일 크기가 너무 큽니다. 최대 ${maxSize / 1024 / 1024}MB까지 업로드 가능합니다.`);
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('이미지 파일만 업로드 가능합니다.');
  }

  const formData = new FormData();
  formData.append('image', file);

  // multipart/form-data는 Content-Type 헤더를 명시하지 않아야 함
  // 브라우저가 자동으로 boundary를 포함한 Content-Type을 설정함
  // axios request interceptor에서 FormData일 때 Content-Type을 자동으로 제거함
  
  const apiPath = '/api/prescriptions/upload';

  try {
    const res = await axiosInstance.post<{
      success: boolean;
      data: OCRResponse;
    }>(apiPath, formData, {
      timeout: 60000, // 60초
    });

    const ocrResult = res.data.data;
    
    // OCR 결과가 비어있는 경우 경고
    if (!ocrResult.medicines || ocrResult.medicines.length === 0) {
      console.warn('⚠️ OCR 결과에 약물 정보가 없습니다. 처방전을 인식하지 못했을 수 있습니다.');
    }
    
    return ocrResult;
  } catch (error: unknown) {
    const err = error as {
      response?: {
        status?: number;
        statusText?: string;
        data?: {
          error?: { message?: string };
          message?: string;
          errorCode?: string;
        };
      };
      message?: string;
    };

    // 500 에러인 경우 서버 내부 오류
    if (err.response?.status === 500) {
      const errorResponse = err.response.data;
      let errorMessage =
        errorResponse?.error?.message ||
        errorResponse?.message ||
        errorResponse?.errorCode ||
        '서버 내부 오류가 발생했습니다.';

      // OCR 서비스 호출 실패인 경우 더 명확한 메시지 제공
      if (errorMessage.includes('OCR 호출 실패') || errorMessage.includes('404 Not Found')) {
        errorMessage = `OCR 서비스 연결 실패: 백엔드에서 OCR API를 호출할 수 없습니다.\n\n에러 상세: ${errorResponse?.message || errorMessage}\n\n백엔드 OCR 설정을 확인해주세요.`;
      }

      const detailedError = new Error(errorMessage);
      (detailedError as any).response = err.response;
      (detailedError as any).status = 500;
      throw detailedError;
    }

    throw error;
  }
}

