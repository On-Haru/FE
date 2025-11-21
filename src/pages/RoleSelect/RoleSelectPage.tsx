import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

const RoleSelectPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {/* 로고 */}
      <div className="mb-12">
        <img src="/logo.svg" alt="하루온" className="h-16" />
      </div>

      {/* 버튼들 */}
      <div className="w-full max-w-sm space-y-4">
        {/* 본인 등록하기 버튼 */}
        <button
          onClick={() => navigate('/signup/elder')}
          className="w-full py-4 rounded-lg text-white font-semibold bg-primary "
        >
          본인 등록하기
        </button>

        {/* 보호자 등록하기 버튼 */}
        <button
          onClick={() => navigate('/signup/caregiver')}
          className="w-full py-4 rounded-lg font-semibold border-2 bg-white border-primary text-primary"
        >
          보호자 등록하기
        </button>
      </div>

      {/* 도움말 링크 
      <button className="mt-8 text-sm text-gray-500">
        어떻게 사용하는지 모르겠어요!
      </button> */}
    </div>
  );
};

export default RoleSelectPage;
