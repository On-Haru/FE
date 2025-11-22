import { Camera, Loader2 } from 'lucide-react';
import { useRef } from 'react';

interface CameraBoxProps {
  onCapture: (file: File) => void;
  disabled?: boolean;
}

const CameraBox = ({ onCapture, disabled = false }: CameraBoxProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (disabled) return;
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && !disabled) {
      onCapture(file);
      // 같은 파일을 다시 선택할 수 있도록 input 값 초기화
      e.target.value = '';
    }
  };

  return (
    <div
      onClick={handleClick}
      className={disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
    >
      <div className="flex flex-col items-center justify-center w-full min-h-[400px] 
                      border rounded-xl p-4 pb-10 border-[#E4E4E7] shadow-[0_2px_8px_rgba(0,0,0,0.08)]">
        {disabled ? (
          <>
            <Loader2 className="w-10 h-10 text-gray-300 mb-3 animate-spin" />
            <span className="text-gray-300 text-xl font-medium">
              처방전 인식 중...
            </span>
          </>
        ) : (
          <>
            <Camera className="w-10 h-10 text-gray-300 mb-3" />
            <span className="text-gray-300 text-xl font-medium">
              새 처방전 등록하기
            </span>
          </>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
};

export default CameraBox;
