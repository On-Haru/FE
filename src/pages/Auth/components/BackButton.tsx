import { useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

interface BackButtonProps {
  to: string;
}

const BackButton = ({ to }: BackButtonProps) => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(to)}
      className="absolute top-1 left-3 flex items-center justify-start w-20 h-8 hover:opacity-70 z-10"
    >
      <ChevronLeft className="w-6 h-6" />
    </button>
  );
};

export default BackButton;
