import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';

const SignupPage = () => {
  const navigate = useNavigate();
  const { role } = useParams<{ role: string }>();
  const location = useLocation();
  const isStep2 = location.pathname.endsWith('/info');

  // 1단계 상태
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');

  // 2단계 상태
  const [name, setName] = useState('');
  const [birthYear, setBirthYear] = useState('');

  // 연도 목록 생성 (현재 연도부터 100년 전까지)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

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

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    // 본인(elder)은 2단계로 이동, 보호자(caregiver)는 바로 등록 완료
    if (role === 'elder') {
      navigate(`/${role}/signup/info`);
    } else {
      // 보호자는 1단계에서 바로 등록 완료
      // TODO: API 호출하여 회원가입 완료
      navigate(`/${role}/login`);
    }
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: API 호출하여 회원가입 완료
    // 회원가입 완료 후 로그인 페이지로 이동하거나 홈으로 이동
    navigate(`/${role}/login`);
  };

  // 1단계: 전화번호, 비밀번호
  if (!isStep2) {
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
        <form
          onSubmit={handleStep1Submit}
          className="w-full max-w-sm space-y-6"
        >
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
            {role === 'elder' ? '다음' : '등록하기'}
          </button>
        </form>
      </div>
    );
  }

  // 2단계: 이름, 태어난 연도
  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-4 relative">
      {/* 뒤로가기 버튼 */}
      <button
        onClick={() => navigate(`/${role}/signup`)}
        className="absolute top-4 left-4 flex items-center justify-center w-10 h-10 hover:opacity-70"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      {/* 로고 */}
      <div className="mb-12">
        <img src="/logo.svg" alt="하루온" className="h-16" />
      </div>

      {/* 폼 */}
      <form onSubmit={handleStep2Submit} className="w-full max-w-sm space-y-6">
        {/* 이름 입력 */}
        <div>
          <label
            htmlFor="name"
            className={`block font-medium mb-2 ${role === 'elder' ? 'text-lg' : 'text-sm'}`}
          >
            이름
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름을 입력하세요"
            className={`w-full px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary ${role === 'elder' ? 'py-4 text-lg' : 'py-3'}`}
            required
          />
        </div>

        {/* 태어난 연도 선택 */}
        <div>
          <label
            htmlFor="birthYear"
            className={`block font-medium mb-2 ${role === 'elder' ? 'text-lg' : 'text-sm'}`}
          >
            태어난 연도
          </label>
          <select
            id="birthYear"
            value={birthYear}
            onChange={(e) => setBirthYear(e.target.value)}
            className={`w-full px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary appearance-none bg-white ${role === 'elder' ? 'py-4 text-lg' : 'py-3'}`}
            required
          >
            <option value="">연도를 선택해주세요</option>
            {years.map((year) => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* 버튼 */}
        <button
          type="submit"
          className={`w-full rounded-lg text-white font-semibold bg-primary ${role === 'elder' ? 'py-5 text-xl' : 'py-4'}`}
        >
          등록하기
        </button>
      </form>
    </div>
  );
};

export default SignupPage;
