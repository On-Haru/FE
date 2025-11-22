import { useNavigate } from 'react-router-dom';
import { User } from 'lucide-react';

const EmptyStateScreen = () => {
  const navigate = useNavigate();

  const handleConnect = () => {
    // 연결 페이지로 이동 (3단계에서 라우팅 추가 예정)
    navigate('/home/connect');
  };

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-8">
      <div className="flex flex-col items-center gap-6 max-w-sm text-center">
        {/* 회색 사람 아이콘 */}
        <User className="w-24 h-24 text-gray-400" />

        {/* 메시지 */}
        <p className="text-xl font-bold text-gray-900">
          아직 연결된 피보호자가 없습니다
        </p>

        {/* 연결하기 버튼 */}
        <button
          onClick={handleConnect}
          className="w-full bg-primary text-white rounded-xl py-3 px-6 font-semibold mt-2 hover:opacity-90 transition-opacity"
        >
          피보호자 연결하기
        </button>

        {/* 하단 설명 텍스트 */}
        <p className="text-sm text-gray-500 mt-4 leading-relaxed">
          저희 서비스를 통해 피보호자를 연결하여, 복용 기록을 관리하고 복용
          시간을 알려줄 수 있습니다.
        </p>
      </div>
    </div>
  );
};

export default EmptyStateScreen;
