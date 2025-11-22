import { useEffect, useState } from 'react';
import Dropdown, { type DropdownOption } from '@/components/Dropdown';

const NameHeader = () => {
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
