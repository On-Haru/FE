import { useNavigate } from 'react-router-dom';

const RoleSelectPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-4">
      {/* 로고 */}
      <div className="mb-12">
        <img src="/logo.svg" alt="하루온" className="h-16" />
      </div>

      {/* 버튼들 */}
      <div className="w-full max-w-sm space-y-4 mt-8">
        {/* 본인 버튼 */}
        <button
          onClick={() => navigate('/elder/auth-select')}
          className="w-full py-5 rounded-lg font-semibold border-2 bg-primary border-white text-white text-lg"
        >
          본인
        </button>

        {/* 보호자 버튼 */}
        <button
          onClick={() => navigate('/caregiver/auth-select')}
          className="w-full py-5 rounded-lg font-semibold border-2 bg-white border-primary text-primary text-lg"
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
