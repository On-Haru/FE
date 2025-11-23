import Dropdown, { type DropdownOption } from '@/components/Dropdown';

interface Elder {
  id: string;
  name: string;
}

interface NameHeaderProps {
  currentElder: Elder;
  elders: Elder[];
  onElderChange: (elderId: string) => void;
}

const NameHeader = ({
  currentElder,
  elders,
  onElderChange,
}: NameHeaderProps) => {
  // Elder 데이터를 DropdownOption 형식으로 변환
  const dropdownOptions: DropdownOption[] = elders.map((elder) => ({
    label: `${elder.name}님`,
    value: elder.id,
  }));

  const selectedOption: DropdownOption = {
    label: `${currentElder.name}님`,
    value: currentElder.id,
  };

  return (
    <div className="flex items-center justify-between w-full gap-3 ">
      {/* 왼쪽: 어르신 이름 + 드롭다운 */}
      <div className="flex-shrink-0">
        <Dropdown
          selected={selectedOption}
          options={dropdownOptions}
          onSelect={onElderChange}
          width={120}
          fontSize="clamp(16px, 5vw, 20px)"
        />
      </div>
      {/* 오른쪽: 빈 공간 (DetailPageHeader의 AI 리포트 버튼과 동일한 높이 유지) */}
      <div className="flex-shrink-0" style={{ width: '100px', height: '35px' }} />
    </div>
  );
};

export default NameHeader;
