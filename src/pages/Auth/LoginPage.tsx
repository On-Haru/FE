import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import BackButton from './components/BackButton';
import AuthLogo from './components/AuthLogo';
import AuthInput from './components/AuthInput';

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
      <BackButton to={`/${role}/auth-select`} />
      <AuthLogo />
      {/* 폼 */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6 mb-8">
        <AuthInput
          id="phone"
          label="전화번호"
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          placeholder="전화번호를 입력하세요"
          required
          isElder={role === 'elder'}
        />

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

        {/* 버튼 */}
        <button
          type="submit"
          className={`w-full rounded-lg text-white font-semibold bg-primary ${role === 'elder' ? 'py-5 text-xl' : 'py-4'}`}
        >
          로그인
        </button>
      </form>
    </div>
  );
};

export default LoginPage;
