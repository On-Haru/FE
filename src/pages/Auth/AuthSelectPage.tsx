import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import BackButton from './components/BackButton';
import AuthLogo from './components/AuthLogo';

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
    <div className="flex flex-col items-center justify-between h-full w-full p-4 relative">
      <BackButton to="/" />
      <AuthLogo />

      {/* 버튼들 */}
      <div className="w-full max-w-sm space-y-4 mb-8">
        {/* 로그인 버튼 */}
        <button
          onClick={() => navigate(`/${role}/login`)}
          className={`w-full rounded-lg text-white font-semibold bg-primary ${role === 'elder' ? 'py-5 text-xl' : 'py-4'}`}
        >
          로그인 하기
        </button>

        {/* 등록하기 섹션 */}
        {role === 'elder' && (
          <p className="text-xl font-semibold text-center mb-2">
            아직 등록이 안되어있다면?
          </p>
        )}
        <button
          onClick={() => navigate(`/${role}/signup`)}
          className={`w-full rounded-lg font-semibold border-2 bg-white border-primary text-primary ${role === 'elder' ? 'py-5 text-xl' : 'py-4'}`}
        >
          등록하기
        </button>
      </div>
    </div>
  );
};

export default AuthSelectPage;
