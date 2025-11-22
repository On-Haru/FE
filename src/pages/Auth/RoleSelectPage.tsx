import { useNavigate } from 'react-router-dom';

const RoleSelectPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-between h-full w-full p-4">
      {/* 로고 - 시작 화면만 더 크게 */}
      <div className="flex-1 flex items-center justify-center">
        <img src="/logo.svg" alt="하루온" className="h-24" />
      </div>

      {/* 버튼들 */}
      <div className="w-full max-w-xs space-y-4 mb-8">
        {/* 본인 버튼 */}
        <button
          onClick={() => navigate('/elder/login')}
          className="cursor-pointer w-full py-6 rounded-xl font-semibold bg-primary text-white text-xl shadow-md hover:bg-primary/90 transition-colors"
        >
          어르신
        </button>

        {/* 보호자 버튼 */}
        <button
          onClick={() => navigate('/caregiver/login')}
          className="cursor-pointer w-full py-6 rounded-xl font-semibold border-2 border-primary bg-white text-primary text-xl hover:bg-primary/5 transition-colors"
        >
          보호자
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
