import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';

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
    <div className="flex flex-col items-center justify-center h-full w-full p-4 relative">
      {/* 뒤로가기 버튼 */}
      <button
        onClick={() => navigate(`/${role}/auth-select`)}
        className="absolute top-4 left-4 flex items-center justify-center w-10 h-10 hover:opacity-70"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* 로고 */}
      <div className="mb-12">
        <img src="/logo.svg" alt="하루온" className="h-16" />
      </div>

      {/* 폼 */}
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-6">
        {/* 전화번호 입력 */}
        <div>
          <label
            htmlFor="phone"
            className={`block font-medium mb-2 ${role === 'elder' ? 'text-lg' : 'text-sm'}`}
          >
            전화번호
          </label>
          <input
            id="phone"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="전화번호를 입력하세요"
            className={`w-full px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary ${role === 'elder' ? 'py-4 text-lg' : 'py-3'}`}
            required
          />
        </div>

        {/* 비밀번호 입력 */}
        <div>
          <label
            htmlFor="password"
            className={`block font-medium mb-2 ${role === 'elder' ? 'text-lg' : 'text-sm'}`}
          >
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호를 입력하세요"
            className={`w-full px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary ${role === 'elder' ? 'py-4 text-lg' : 'py-3'}`}
            required
          />
        </div>

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
