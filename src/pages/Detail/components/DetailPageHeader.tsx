import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';

interface Elder {
  id: string;
  name: string;
}

interface DetailPageHeaderProps {
  currentElder: Elder;
  elders: Elder[];
  onElderChange: (elderId: string) => void;
}

const DetailPageHeader = ({
  currentElder,
  elders,
  onElderChange,
}: DetailPageHeaderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleElderSelect = (elderId: string) => {
    onElderChange(elderId);
    navigate(`/detail/${elderId}`);
    setIsOpen(false);
  };

  const handleAiReportClick = () => {
    // AI 리포트 페이지로 이동 (나중에 구현)
    navigate(`/report?elderId=${currentElder.id}`);
  };

  return (
    <div className="flex items-center justify-between w-full gap-3">
      {/* 왼쪽: 어르신 이름 + 드롭다운 */}
      <div
        className="flex items-center gap-2 relative flex-shrink-0 cursor-pointer"
        ref={dropdownRef}
        onClick={() => setIsOpen(!isOpen)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        aria-label="어르신 선택"
        aria-expanded={isOpen}
      >
        <span
          className="font-medium text-black whitespace-nowrap"
          style={{ fontSize: 'clamp(16px, 5vw, 20px)' }}
        >
          {currentElder.name}님
        </span>
        <div
          className="flex items-center justify-center border border-gray-300 rounded-md hover:bg-gray-50 active:bg-gray-100 transition-colors flex-shrink-0 pointer-events-none"
          style={{ width: '22px', height: '22px' }}
        >
          <ChevronDown
            className="w-4 h-4 text-gray-600"
            style={{
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s',
            }}
          />
        </div>

        {/* 드롭다운 메뉴 */}
        {isOpen && (
          <div
            className="absolute top-full left-0 mt-1.5 w-[120px] bg-white border border-gray-200 rounded-md shadow-md z-50 overflow-hidden"
            style={{
              animation: 'fadeIn 0.15s ease-out',
            }}
          >
            {elders.map((elder) => (
              <button
                key={elder.id}
                onClick={() => handleElderSelect(elder.id)}
                className={`w-full text-center px-4 py-2 text-base transition-colors focus:outline-none cursor-pointer ${elder.id === currentElder.id
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'text-gray-900 hover:bg-gray-50 active:bg-gray-100'
                  }`}
              >
                {elder.name}님
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 오른쪽: AI 리포트 버튼 */}
      <button
        onClick={handleAiReportClick}
        className="bg-primary text-white rounded-lg font-medium hover:bg-primary/90 active:bg-primary/80 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20 whitespace-nowrap flex-shrink-0 flex items-center justify-center cursor-pointer"
        style={{ width: '100px', height: '35px', fontSize: '16px' }}
      >
        AI 리포트
      </button>
    </div>
  );
};

export default DetailPageHeader;

