import { useNavigate } from 'react-router-dom';
import { useRef } from 'react';
import { gsap } from 'gsap';
import Dropdown, { type DropdownOption } from '@/components/Dropdown';
import { useToast } from '@/contexts/ToastContext';

interface Elder {
  id: string;
  name: string;
}

interface DetailPageHeaderProps {
  currentElder: Elder;
  elders: Elder[];
  onElderChange: (elderId: string) => void;
  currentMonth: Date;
}

const DetailPageHeader = ({
  currentElder,
  elders,
  onElderChange,
  currentMonth,
}: DetailPageHeaderProps) => {
  const navigate = useNavigate();
  const reportButtonRef = useRef<HTMLButtonElement>(null);
  const { showToast } = useToast();

  // Elder 데이터를 DropdownOption 형식으로 변환
  const dropdownOptions: DropdownOption[] = elders.map((elder) => ({
    label: `${elder.name}님`,
    value: elder.id,
  }));

  const selectedOption: DropdownOption = {
    label: `${currentElder.name}님`,
    value: currentElder.id,
  };

  const handleElderSelect = (elderId: string) => {
    const selectedElder = elders.find((elder) => elder.id === elderId);
    if (selectedElder && selectedElder.id !== currentElder.id) {
    onElderChange(elderId);
    navigate(`/detail/${elderId}`);
      showToast(`${selectedElder.name}님으로 변경되었습니다`);
    }
  };

  const handleAiReportClick = () => {
    // 달력에 표시된 년도와 월을 파라미터로 전달
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth() + 1; // getMonth()는 0부터 시작하므로 +1
    navigate(`/report?elderId=${currentElder.id}&year=${year}&month=${month}`);
  };

  return (
    <div className="flex items-center justify-between w-full gap-3">
      {/* 왼쪽: 어르신 이름 + 드롭다운 */}
      <div className="flex-shrink-0">
        <Dropdown
          selected={selectedOption}
          options={dropdownOptions}
          onSelect={handleElderSelect}
          width={120}
          fontSize="clamp(16px, 5vw, 20px)"
        />
      </div>

      {/* 오른쪽: AI 리포트 버튼 */}
      <button
        ref={reportButtonRef}
        onClick={handleAiReportClick}
        onMouseEnter={() => {
          if (reportButtonRef.current) {
            gsap.to(reportButtonRef.current, {
              scale: 1.05,
              duration: 0.2,
              ease: 'power2.out',
            });
          }
        }}
        onMouseLeave={() => {
          if (reportButtonRef.current) {
            gsap.to(reportButtonRef.current, {
              scale: 1,
              duration: 0.2,
              ease: 'power2.out',
            });
          }
        }}
        className="bg-primary text-white rounded-xl font-medium active:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-primary/20 whitespace-nowrap flex-shrink-0 flex items-center justify-center cursor-pointer"
        style={{ width: '100px', height: '35px', fontSize: '16px' }}
      >
        AI 리포트
      </button>
    </div>
  );
};

export default DetailPageHeader;

