import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Dropdown, { type DropdownOption } from '@/components/Dropdown';
import { ROUTES } from '@/constants/routes';
import CameraBox from '@/pages/MedicineRegister/components/CameraBox';
import MedicineAddButton from '@/pages/MedicineRegister/components/MedicineAddButton';
import ViewPrescriptionButton from '@/pages/MedicineRegister/components/ViewPrescriptionButton';
//import PreviewModal from '@/pages/MedicineRegister/components/PreviewModal';

const MedicineRegisterPage = () => {
  const navigate = useNavigate();

  const [elderOptions, setElderOptions] = useState<DropdownOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<DropdownOption | null>(
    null
  );

  useEffect(() => {
    const fetchedUsers = ['김노인 님', '이노인 님', '박노인 님'];

    const options = fetchedUsers.map((name) => ({
      label: name,
      value: name,
    }));

    setElderOptions(options);
    setSelectedOption(options[0]);
  }, []);

  return (
    <div className="px-4 py-6">
      {selectedOption && (
        <Dropdown
          selected={selectedOption}
          options={elderOptions}
          onSelect={(value) => {
            const newElder = elderOptions.find((o) => o.value === value);
            if (newElder) {
              setSelectedOption(newElder);
            }
          }}
          fontSize="clamp(16px, 5vw, 20px)"
          width={140}
        />
      )}

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
  );
};

export default MedicineRegisterPage;
