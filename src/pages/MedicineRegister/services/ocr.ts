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
  const fullUrl = `${axiosInstance.defaults.baseURL || ''}${apiPath}`;
  
  // FormData 내용 확인 (디버깅용)
  console.log('📤 OCR API 요청 준비:', {
    path: apiPath,
    fullUrl: fullUrl,
    baseURL: axiosInstance.defaults.baseURL,
    file: {
      name: file.name,
      size: file.size,
      type: file.type,
      sizeMB: (file.size / 1024 / 1024).toFixed(2) + 'MB',
      lastModified: new Date(file.lastModified).toISOString(),
    },
    formDataKeys: Array.from(formData.keys()),
    formDataEntries: Array.from(formData.entries()).map(([key, value]) => ({
      key,
      valueType: value instanceof File ? 'File' : typeof value,
      value: value instanceof File ? { name: value.name, size: value.size, type: value.type } : value,
    })),
  });

  try {
    // 실제 요청 전송
    console.log('🚀 OCR API 요청 전송 시작...');
    const res = await axiosInstance.post<{
      success: boolean;
      data: OCRResponse;
    }>(apiPath, formData, {
      // timeout을 늘려서 큰 파일도 처리 가능하도록
      timeout: 60000, // 60초
      // 요청 진행 상황 추적
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`📤 업로드 진행률: ${percentCompleted}%`);
        }
      },
    });

    console.log('✅ OCR API 응답 성공:', {
      status: res.status,
      statusText: res.statusText,
      data: res.data,
      headers: res.headers,
    });
    
    const ocrResult = res.data.data;
    console.log('📋 OCR 결과 상세:', {
      medicinesCount: ocrResult.medicines?.length || 0,
      medicines: ocrResult.medicines,
      hospitalName: ocrResult.hospitalName,
      doctorName: ocrResult.doctorName,
      issuedDate: ocrResult.issuedDate,
      note: ocrResult.note,
    });
    
    // OCR 결과가 비어있는 경우 경고
    if (!ocrResult.medicines || ocrResult.medicines.length === 0) {
      console.warn('⚠️ OCR 결과에 약물 정보가 없습니다. 처방전을 인식하지 못했을 수 있습니다.');
    }
    
    return ocrResult;
  } catch (error: any) {
    const requestUrl = error.config?.url || error.config?.baseURL + apiPath;
    
    // 에러 응답 상세 정보
    const errorResponse = error.response?.data;
    console.error('❌ OCR API 에러 상세:', {
      requestUrl: requestUrl,
      fullUrl: error.config?.baseURL + error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: errorResponse,
      responseHeaders: error.response?.headers,
      message: error.message,
    });
    
    // 500 에러인 경우 서버 내부 오류
    if (error.response?.status === 500) {
      console.error('⚠️ 500 Internal Server Error: 서버에서 오류가 발생했습니다.');
      console.error('응답 데이터:', JSON.stringify(errorResponse, null, 2));
      
      // 에러 메시지 추출
      let errorMessage = 
        errorResponse?.error?.message || 
        errorResponse?.message || 
        errorResponse?.errorCode || 
        '서버 내부 오류가 발생했습니다.';
      
      // OCR 서비스 호출 실패인 경우 더 명확한 메시지 제공
      if (errorMessage.includes('OCR 호출 실패') || errorMessage.includes('404 Not Found')) {
        console.error('🔍 문제 분석:');
        console.error('  1. 프론트엔드 → 백엔드 API 호출: ✅ 성공 (요청이 백엔드에 도달함)');
        console.error('  2. 백엔드 → OCR 서비스 호출: ❌ 실패 (404 Not Found)');
        console.error('');
        console.error('📋 백엔드 개발자에게 확인 요청:');
        console.error('  ❓ OCR API 엔드포인트 URL이 올바른가요?');
        console.error('  ❓ OCR API 키 및 인증 정보가 설정되어 있나요?');
        console.error('  ❓ OCR 서비스가 정상 작동 중인가요?');
        console.error('  ❓ 백엔드 로그에서 OCR 호출 URL을 확인해주세요');
        console.error('');
        console.error('📤 프론트엔드에서 전송한 데이터:');
        console.error('  - 파일명:', file.name);
        console.error('  - 파일 크기:', (file.size / 1024 / 1024).toFixed(2), 'MB');
        console.error('  - 파일 타입:', file.type);
        console.error('  - FormData 키: "image"');
        
        errorMessage = `OCR 서비스 연결 실패: 백엔드에서 OCR API를 호출할 수 없습니다.\n\n에러 상세: ${errorResponse?.message || errorMessage}\n\n백엔드 OCR 설정을 확인해주세요.`;
      }
      
      const detailedError = new Error(errorMessage);
      (detailedError as any).response = error.response;
      (detailedError as any).status = 500;
      throw detailedError;
    }
    
    // 404 에러인 경우 경로 문제일 가능성이 높음
    if (error.response?.status === 404) {
      console.warn('⚠️ 404 에러: API 경로를 확인해주세요. 가능한 경로:');
      console.warn('  - /api/prescriptions/upload (현재 사용 중)');
      console.warn('  - /api/prescription/upload');
      console.warn('  - /api/ocr/upload');
      console.warn('  - /api/prescriptions/ocr');
    }
    
    throw error;
  }
}

