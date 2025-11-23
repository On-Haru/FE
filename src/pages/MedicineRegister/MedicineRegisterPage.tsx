import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import CameraBox from '@/pages/MedicineRegister/components/CameraBox';
import MedicineAddButton from '@/pages/MedicineRegister/components/MedicineAddButton';
import ViewPrescriptionButton from '@/pages/MedicineRegister/components/ViewPrescriptionButton';
import NameHeader from '@/pages/MedicineRegister/components/NameHeader';
import { uploadPrescriptionOCR } from '@/pages/MedicineRegister/services/ocr';
import { getCaregiverLinks } from '@/pages/Home/services/caregiverLink';
import { getUser } from '@/pages/Auth/services/user';

interface Elder {
  id: string;
  name: string;
  linkId?: number;
}

const MedicineRegisterPage = () => {
  const navigate = useNavigate();
  const [isUploading, setIsUploading] = useState(false);
  const [selectedSeniorId, setSelectedSeniorId] = useState<number | null>(null);
  const [currentElder, setCurrentElder] = useState<Elder | null>(null);
  const [elders, setElders] = useState<Elder[]>([]);
  const [isEldersLoading, setIsEldersLoading] = useState(true);

  // 어르신 목록 조회 (등록된 피보호자 목록)
  useEffect(() => {
    const fetchElders = async () => {
      setIsEldersLoading(true);
      try {
        const links = await getCaregiverLinks();
        
        // CaregiverLink의 id 기준으로 정렬 (가장 먼저 연결된 것이 첫 번째)
        const sortedLinks = [...links].sort((a, b) => a.id - b.id);
        
        // 각 피보호자의 사용자 정보를 병렬로 가져오기
        const elderPromises = sortedLinks.map(async (link) => {
          try {
            const userInfo = await getUser(link.seniorId);
            return {
              id: link.seniorId.toString(),
              name: userInfo.name,
              linkId: link.id,
            };
          } catch (error) {
            // 에러 발생 시 기본값 사용
            return {
              id: link.seniorId.toString(),
              name: `피보호자 ${link.seniorId}`,
              linkId: link.id,
            };
          }
        });

        const fetchedElders = await Promise.all(elderPromises);
        setElders(fetchedElders);

        if (fetchedElders.length === 0) {
          // 피보호자가 없으면 currentElder를 null로 설정하여 에러 메시지 표시
          setCurrentElder(null);
          setIsEldersLoading(false);
          return;
        }

        // localStorage에 저장된 값 또는 첫 번째 피보호자를 기본값으로 사용
        const storedSeniorId = localStorage.getItem('selectedSeniorId');
        const targetElder = fetchedElders.find((e) => e.id === storedSeniorId) || fetchedElders[0];
        
        setCurrentElder(targetElder);
        setSelectedSeniorId(Number(targetElder.id));
        localStorage.setItem('selectedSeniorId', targetElder.id);
      } catch (error) {
        // 에러 발생 시 빈 배열로 설정하고 currentElder도 null로 설정
        setElders([]);
        setCurrentElder(null);
      } finally {
        setIsEldersLoading(false);
      }
    };

    fetchElders();
  }, []);

  const handleElderChange = (elderId: string) => {
    const elder = elders.find((e) => e.id === elderId);
    if (elder) {
      setCurrentElder(elder);
      setSelectedSeniorId(Number(elderId));
      localStorage.setItem('selectedSeniorId', elderId);
    }
  };

  const handleCapture = async (file: File) => {
    try {
      setIsUploading(true);

      // OCR API 호출
      const ocrResult = await uploadPrescriptionOCR(file);

      // 선택된 seniorId를 OCR 결과에 포함
      const ocrResultWithSeniorId = {
        ...ocrResult,
        seniorId: selectedSeniorId || ocrResult.seniorId,
      };

      // OCR 결과를 localStorage에 저장 (MedicineDetailPage에서 사용)
      localStorage.setItem('ocrPrescriptionData', JSON.stringify(ocrResultWithSeniorId));

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

  if (!currentElder) {
    if (isEldersLoading) {
      return (
        <div className="flex items-center justify-center h-full">
          <p className="text-gray-500">로딩 중...</p>
        </div>
      );
    }
    if (elders.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <p className="text-gray-500 mb-2">등록된 피보호자가 없습니다.</p>
            <p className="text-sm text-gray-400">홈 화면에서 피보호자를 연결해주세요.</p>
          </div>
        </div>
      );
    }
    // Fallback: elders loaded but currentElder가 아직 선택되지 않은 경우
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500">로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-full relative">
      <NameHeader
        currentElder={currentElder}
        elders={elders}
        onElderChange={handleElderChange}
      />
      <div className="flex-1 overflow-y-auto py-3">
        <CameraBox
          onCapture={handleCapture}
          disabled={isUploading}
        />

        <MedicineAddButton onClick={() => navigate(ROUTES.MEDICINE_DETAIL)} />
        <ViewPrescriptionButton
          onClick={() => navigate(ROUTES.MEDICINE_PREVIOUS)}
        />
      </div>
    </div>
  );
};

export default MedicineRegisterPage;
