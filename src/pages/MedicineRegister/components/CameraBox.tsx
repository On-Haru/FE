import { Camera } from 'lucide-react';
import { useRef } from 'react';

interface CameraBoxProps {
  onCapture: (file: File) => void;
}

const CameraBox = ({ onCapture }: CameraBoxProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onCapture(file);
  };

  return (
    <div onClick={handleClick} className="cursor-pointer">
      <div className="flex flex-col items-center justify-center w-full h-60 
                      border border-gray-300 rounded-xl">
        <Camera className="w-10 h-10 text-gray-300 mb-3" />
        <span className="text-gray-300 text-xl font-medium">
          새 처방전 등록하기
        </span>
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
