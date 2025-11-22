import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import CameraBox from '@/pages/MedicineRegister/components/CameraBox';
import MedicineAddButton from '@/pages/MedicineRegister/components/MedicineAddButton';
import ViewPrescriptionButton from '@/pages/MedicineRegister/components/ViewPrescriptionButton';
import NameHeader from '@/pages/MedicineRegister/components/NameHeader';
//import PreviewModal from '@/pages/MedicineRegister/components/PreviewModal';

const MedicineRegisterPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-full relative">
      <NameHeader />
      <div className="flex-1 overflow-y-auto py-3">
        <CameraBox
          onCapture={() => {
            navigate(ROUTES.MEDICINE_DETAIL);
          }}
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
