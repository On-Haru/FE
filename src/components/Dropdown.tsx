import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export interface DropdownOption {
  label: string;  // 화면 표시용
  value: string;  // 내부적으로 사용하는 실제 값
}

interface SelectDropdownProps {
  selected: DropdownOption;          // 현재 선택된 값
  options: DropdownOption[];         // 전체 옵션 목록
  onSelect: (value: string) => void; // 값 선택 시 콜백
  width?: number | string;           // 드롭다운 width 옵션
  fontSize?: string;                 // 폰트 사이즈
}

const Dropdown = ({
  selected,
  options,
  onSelect,
  width = 120,
  fontSize = 'clamp(16px, 5vw, 20px)'
}: SelectDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 → 닫기
  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (option: DropdownOption) => {
    onSelect(option.value);
    setIsOpen(false);
  };

  return (
    <div
      ref={dropdownRef}
      className="relative flex items-center gap-2 cursor-pointer select-none"
      role="button"
      tabIndex={0}
      aria-expanded={isOpen}
    >
      {/* 현재 선택된 label */}
      <span
        className="font-medium text-black whitespace-nowrap"
        style={{ fontSize }}
      >
        {selected.label}
      </span>

      {/* 아이콘 박스 */}
      <div
        className="flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 active:bg-gray-100 transition-colors"
        style={{ width: 22, height: 22 }}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <ChevronDown
          className="w-4 h-4 text-gray-600"
          style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s',
          }}
        />
      </div>

      {/* 드롭다운 리스트 */}
      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1.5 bg-white border border-gray-200 rounded-md shadow-md z-50 overflow-hidden"
          style={{ width, animation: 'fadeIn 0.15s ease-out' }}
        >
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSelect(opt)}
              className={`w-full text-center px-4 py-2 text-base transition-colors ${
                opt.value === selected.value
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-gray-900 hover:bg-gray-50 active:bg-gray-100'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
