import { useEffect, useState } from 'react';
import Dropdown, { type DropdownOption } from '@/components/Dropdown';
import { getCaregiverLinks } from '@/pages/Home/services/caregiverLink';
import { getUser } from '@/pages/Home/services/user';

interface NameHeaderProps {
  onSeniorIdChange?: (seniorId: number | null) => void;
}

const NameHeader = ({ onSeniorIdChange }: NameHeaderProps) => {
  const [elderOptions, setElderOptions] = useState<DropdownOption[]>([]);
  const [selectedOption, setSelectedOption] = useState<DropdownOption | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchElders = async () => {
      try {
        setIsLoading(true);
        // 연결된 피보호자 목록 가져오기
        const links = await getCaregiverLinks();

        if (links.length === 0) {
          setElderOptions([]);
          setSelectedOption(null);
          setIsLoading(false);
          return;
        }

        // 각 피보호자의 이름 가져오기
        const eldersWithNames = await Promise.all(
          links.map(async (link) => {
            try {
              const userInfo = await getUser(link.seniorId);
              return {
                seniorId: link.seniorId,
                name: userInfo.name,
              };
            } catch (error) {
              // User API 호출 실패 시 기본값 사용
              return {
                seniorId: link.seniorId,
                name: `피보호자 ${link.seniorId}`,
              };
            }
          })
        );

        // Dropdown 옵션 생성 (seniorId를 value로 사용)
        const options: DropdownOption[] = eldersWithNames.map((elder) => ({
          label: `${elder.name} 님`,
          value: String(elder.seniorId),
        }));

        setElderOptions(options);

        // 기본값 설정 (첫 번째 피보호자 또는 localStorage에 저장된 값)
        const storedSeniorId = localStorage.getItem('selectedSeniorId');
        const defaultOption =
          options.find((opt) => opt.value === storedSeniorId) || options[0];
        setSelectedOption(defaultOption);

        // localStorage에 선택된 seniorId 저장
        if (defaultOption) {
          localStorage.setItem('selectedSeniorId', defaultOption.value);
          // 부모 컴포넌트에 선택된 seniorId 전달
          onSeniorIdChange?.(Number(defaultOption.value));
        }
      } catch (error) {
        console.error('피보호자 목록 조회 실패:', error);
        setElderOptions([]);
        setSelectedOption(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchElders();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-between w-full gap-3">
        <div className="flex-shrink-0 text-gray-400">로딩 중...</div>
      </div>
    );
  }

  if (elderOptions.length === 0) {
    return (
      <div className="flex items-center justify-between w-full gap-3">
        <div className="flex-shrink-0 text-gray-400">연결된 피보호자가 없습니다</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between w-full gap-3">
      {selectedOption && (
        <div className="flex-shrink-0">
          <Dropdown
            selected={selectedOption}
            options={elderOptions}
            onSelect={(value) => {
              const newElder = elderOptions.find((o) => o.value === value);
              if (newElder) {
                setSelectedOption(newElder);
                // localStorage에 선택된 seniorId 저장
                localStorage.setItem('selectedSeniorId', value);
                // 부모 컴포넌트에 선택된 seniorId 전달
                onSeniorIdChange?.(Number(value));
              }
            }}
            fontSize="clamp(16px, 5vw, 20px)"
            width={140}
          />
        </div>
      )}
    </div>
  );
};

export default NameHeader;
