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
      className="absolute top-4 left-4 flex items-center justify-center w-10 h-10 hover:opacity-70"
    >
      <ChevronLeft className="w-6 h-6" />
    </button>
  );
};

export default BackButton;
