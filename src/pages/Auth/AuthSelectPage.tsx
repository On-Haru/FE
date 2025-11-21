import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';

const AuthSelectPage = () => {
  const navigate = useNavigate();
  const { role } = useParams<{ role: string }>();

  useEffect(() => {
    // role이 없거나 유효하지 않으면 역할 선택 페이지로 리다이렉트
    if (!role || (role !== 'elder' && role !== 'caregiver')) {
      navigate('/');
    }
  }, [role, navigate]);

  // role이 없거나 유효하지 않으면 아무것도 렌더링하지 않음
  if (!role || (role !== 'elder' && role !== 'caregiver')) {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      {/* 로고 */}
      <div className="mb-12">
        <img src="/logo.svg" alt="하루온" className="h-16" />
      </div>

      {/* 버튼들 */}
      <div className="w-full max-w-sm space-y-4">
        {/* 로그인 버튼 */}
        <button
          onClick={() => navigate(`/login/${role}`)}
          className="w-full py-4 rounded-lg text-white font-semibold bg-primary"
        >
          로그인 하기
        </button>

        {/* 등록하기 섹션 */}
        {role === 'elder' && (
          <p className="text-lg font-semibold text-center mb-2">
            아직 등록이 안되어있다면?
          </p>
        )}
        <button
          onClick={() => navigate(`/signup/${role}`)}
          className="w-full py-4 rounded-lg font-semibold border-2 bg-white border-primary text-primary"
        >
          등록하기
        </button>
      </div>
    </div>
  );
};

export default AuthSelectPage;
