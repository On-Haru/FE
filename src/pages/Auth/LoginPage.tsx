import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import BackButton from './components/BackButton';
import AuthLogo from './components/AuthLogo';
import AuthInput from './components/AuthInput';
import { formatPhoneNumber } from '@/utils/phoneFormatter';

const LoginPage = () => {
  const navigate = useNavigate();
  const { role } = useParams<{ role: string }>();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (!role || (role !== 'elder' && role !== 'caregiver')) {
      navigate('/');
    }
  }, [role, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: API 호출하여 로그인
    // 로그인 성공 후 역할에 따라 다른 경로로 이동
    if (role === 'elder') {
      navigate('/elder');
    } else {
      navigate('/home');
    }
  };
  return (
    <div className="flex flex-col items-center justify-between h-full w-full p-4 relative">
      <BackButton to="/" />
      <AuthLogo />
      {/* 폼 */}
      <div className="mt-auto w-full flex flex-col items-center">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-sm space-y-6 mb-8"
        >
          <AuthInput
            id="phone"
            label="전화번호"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(formatPhoneNumber(e.target.value))}
            placeholder="전화번호를 입력하세요"
            required
            isElder={role === 'elder'}
            maxLength={13}
          />

          {/* 버튼 */}
          <button
            type="submit"
            className={`w-full rounded-lg text-white font-semibold bg-primary ${role === 'elder' ? 'py-5 text-xl' : 'py-4 text-base'}`}
          >
            로그인
          </button>
        </form>

        <AuthInput
          id="password"
          label="비밀번호"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호를 입력하세요"
          required
          isElder={role === 'elder'}
        />

        {/* 회원가입 링크 표시 */}
        <button
          onClick={() => navigate(`/${role}/signup`)}
          className={`text-gray-600 hover:text-primary transition-colors mb-8 ${role === 'elder' ? 'text-lg' : 'text-sm'}`}
        >
          아직 가입이 안되어있다면?
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
