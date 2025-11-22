import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import CameraBox from '@/pages/MedicineRegister/components/CameraBox';
import MedicineAddButton from '@/pages/MedicineRegister/components/MedicineAddButton';
import ViewPrescriptionButton from '@/pages/MedicineRegister/components/ViewPrescriptionButton';
import NameHeader from '@/pages/MedicineRegister/components/NameHeader';
import { uploadPrescriptionOCR } from '@/pages/MedicineRegister/services/ocr';
//import PreviewModal from '@/pages/MedicineRegister/components/PreviewModal';

const MedicineRegisterPage = () => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);

  const handleCapture = async (file: File) => {
    try {
      setIsUploading(true);

      // OCR API 호출
      const ocrResult = await uploadPrescriptionOCR(file);

      // OCR 결과를 localStorage에 저장 (MedicineDetailPage에서 사용)
      localStorage.setItem('ocrPrescriptionData', JSON.stringify(ocrResult));

      // MedicineDetailPage로 이동
      navigate(ROUTES.MEDICINE_DETAIL);
    } catch (error: unknown) {
      const err = error as {
        response?: {
          data?: {
            error?: { message?: string };
            message?: string;
          };
        };
        message?: string;
      };
      
      // 에러 메시지 추출
      let errorMessage =
        err.response?.data?.error?.message ||
        err.response?.data?.message ||
        err.message ||
        '알 수 없는 오류가 발생했습니다.';

      // 백엔드 OCR 설정 문제인 경우 더 명확한 메시지
      if (
        errorMessage.includes('OCR 호출 실패') ||
        errorMessage.includes('404 Not Found')
      ) {
        errorMessage =
          '백엔드 OCR 서비스 설정 문제입니다.\n\n백엔드 개발자에게 다음을 확인 요청하세요:\n- OCR API 엔드포인트 URL\n- OCR API 키 및 인증 정보\n- 환경 변수 설정';
      }

      alert(`처방전 인식에 실패했습니다\n\n${errorMessage}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full relative">
      <NameHeader />
      <div className="flex-1 overflow-y-auto py-3">
        <CameraBox
          onCapture={handleCapture}
          disabled={isUploading}
        />

        {/* {isPreviewOpen && selectedOption && (
        <PreviewModal
          file={capturedFile}
          name={selectedOption.label}
          onClose={() => setIsPreviewOpen(false)}
          onConfirm={() => {
            // Todo: OCR 연결
            setIsPreviewOpen(false);
          }}
        />
      )} */}

        <MedicineAddButton onClick={() => navigate(ROUTES.MEDICINE_DETAIL)} />
        <ViewPrescriptionButton
          onClick={() => navigate(ROUTES.MEDICINE_PREVIOUS)}
        />
      </div>
    </div>
  );
};

export default MedicineRegisterPage;
