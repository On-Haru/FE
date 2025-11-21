import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

interface ReportPageHeaderProps {
  title: string;
}

const ReportPageHeader = ({ title }: ReportPageHeaderProps) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1);
  };

  return (
    <div className="flex items-center gap-3 w-full mb-4">
      <button
        onClick={handleBackClick}
        className="flex items-center justify-center w-8 h-8 rounded-md hover:bg-gray-100 active:bg-gray-200 transition-colors focus:outline-none"
        aria-label="뒤로가기"
      >
        <ArrowLeft className="w-5 h-5 text-gray-700" />
      </button>
      <h1 className="text-xl font-semibold text-gray-900 flex-1">{title}</h1>
    </div>
  );
};

export default ReportPageHeader;

