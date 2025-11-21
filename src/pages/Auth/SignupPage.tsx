import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import axiosInstance from '@/lib/axios';
import BackButton from './components/BackButton';
import AuthLogo from './components/AuthLogo';
import AuthInput from './components/AuthInput';
import { formatPhoneNumber } from '@/utils/phoneFormatter';

const SignupPage = () => {
  const navigate = useNavigate();
  const { role } = useParams<{ role: string }>();
  const location = useLocation();
  const isStep2 = location.pathname.endsWith('/info');

  // sessionStorage 키
  const STORAGE_KEY = `signup_${role}`;

  // 1단계 상태 - sessionStorage에서 초기값 로드
  const [phoneNumber, setPhoneNumber] = useState(() => {
    if (isStep2) {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          return data.phoneNumber || '';
        } catch {
          return '';
        }
      }
    }
    return '';
  });
  const [password, setPassword] = useState(() => {
    if (isStep2) {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          const data = JSON.parse(saved);
          return data.password || '';
        } catch {
          return '';
        }
      }
    }
    return '';
  });

  // 2단계 상태
  const [name, setName] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [isYearOpen, setIsYearOpen] = useState(false);
  const yearDropdownRef = useRef<HTMLDivElement>(null);

  // 연도 목록 생성 (현재 연도부터 100년 전까지)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  useEffect(() => {
    // role이 없거나 유효하지 않으면 역할 선택 페이지로 리다이렉트
    if (!role || (role !== 'elder' && role !== 'caregiver')) {
      navigate('/');
    }
  }, [role, navigate]);

  // 2단계에서 1단계 데이터가 없으면 1단계로 리다이렉트
  useEffect(() => {
    if (isStep2) {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (!saved) {
        navigate(`/${role}/signup`);
      } else {
        try {
          const data = JSON.parse(saved);
          if (!data.phoneNumber || !data.password) {
            navigate(`/${role}/signup`);
          }
        } catch {
          navigate(`/${role}/signup`);
        }
      }
    }
  }, [isStep2, role, navigate, STORAGE_KEY]);

  // 외부 클릭 시 연도 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        yearDropdownRef.current &&
        !yearDropdownRef.current.contains(event.target as Node)
      ) {
        setIsYearOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // role이 없거나 유효하지 않으면 아무것도 렌더링하지 않음
  if (!role || (role !== 'elder' && role !== 'caregiver')) {
    return null;
  }

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    // 1단계 데이터를 sessionStorage에 저장
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        phoneNumber,
        password,
      })
    );
    // 모든 역할은 2단계로 이동
    navigate(`/${role}/signup/info`);
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!birthYear) {
      alert('태어난 연도를 선택해주세요.');
      return;
    }

    try {
      await axiosInstance.post('/auth/signup', {
        role,
        phoneNumber,
        password,
        name,
        birthYear: Number(birthYear),
      });

      // 회원가입 성공 시 sessionStorage 정리
      sessionStorage.removeItem(STORAGE_KEY);

      navigate(`/${role}/login`);
    } catch (error) {
      console.error('Failed to sign up', error);
      alert('회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  // 1단계: 전화번호, 비밀번호
  if (!isStep2) {
    return (
      <div className="flex flex-col items-center justify-between h-full w-full p-4 relative">
        <BackButton to="/" />
        <AuthLogo />

        {/* 폼 */}
        <div className="mt-auto w-full flex flex-col items-center">
          <form
            onSubmit={handleStep1Submit}
            className="w-full max-w-sm space-y-6 mb-8"
          >
            <AuthInput
              id="phone"
              label="전화번호"
              type="tel"
              value={phoneNumber}
              onChange={(e) =>
                setPhoneNumber(formatPhoneNumber(e.target.value))
              }
              placeholder="전화번호를 입력하세요"
              required
              isElder={role === 'elder'}
              maxLength={13}
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
              className={`w-full rounded-lg text-white font-semibold bg-primary ${role === 'elder' ? 'py-5 text-xl' : 'py-4 text-base'}`}
            >
              다음
            </button>
          </form>

          {/* 로그인 스타일과 위치 통일을 위한 공간 (로그인 페이지의 "아직 가입이 안되어있다면?" 버튼과 동일한 높이) */}
          <button
            type="button"
            className={`text-gray-600 mb-8 pointer-events-none ${role === 'elder' ? 'text-lg' : 'text-sm'}`}
            style={{ visibility: 'hidden' }}
          >
            아직 가입이 안되어있다면?
          </button>
        </div>
      </div>
    );
  }

  // 2단계: 이름, 태어난 연도
  return (
    <div className="flex flex-col items-center justify-between h-full w-full p-4 relative">
      <BackButton to={`/${role}/signup`} />
      <AuthLogo />

      {/* 폼 */}
      <div className="mt-auto w-full flex flex-col items-center">
        <form
          onSubmit={handleStep2Submit}
          className="w-full max-w-sm space-y-6 mb-8"
        >
          <AuthInput
            id="name"
            label="이름"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름을 입력하세요"
            required
            isElder={role === 'elder'}
          />

          {/* 태어난 연도 선택 */}
          <div>
            <label
              htmlFor="birthYear"
              className={`block font-medium mb-2 ${role === 'elder' ? 'text-lg' : 'text-sm'}`}
            >
              태어난 연도
            </label>
            <div className="relative" ref={yearDropdownRef}>
              <button
                type="button"
                onClick={() => setIsYearOpen(!isYearOpen)}
                className={`w-full px-4 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary bg-white flex items-center justify-between ${role === 'elder' ? 'py-4 text-lg' : 'py-3 text-base'}`}
              >
                <span className={birthYear ? '' : 'text-gray-400'}>
                  {birthYear || '연도를 선택해주세요'}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-600 transition-transform ${isYearOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* 드롭다운 메뉴 */}
              {isYearOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-md z-50 max-h-60 overflow-y-auto">
                  {years.map((year) => (
                    <button
                      key={year}
                      type="button"
                      onClick={() => {
                        setBirthYear(year.toString());
                        setIsYearOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 transition-colors focus:outline-none ${
                        birthYear === year.toString()
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'text-gray-900 hover:bg-gray-50'
                      } ${role === 'elder' ? 'text-lg' : ''}`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 버튼 */}
          <button
            type="submit"
            className={`w-full rounded-lg text-white font-semibold bg-primary ${role === 'elder' ? 'py-5 text-xl' : 'py-4 text-base'}`}
          >
            가입하기
          </button>
        </form>

        {/* 로그인 스타일과 위치 통일을 위한 공간 (로그인 페이지의 "아직 가입이 안되어있다면?" 버튼과 동일한 높이) */}
        <button
          type="button"
          aria-hidden="true"
          className={`text-gray-600 mb-8 pointer-events-none ${role === 'elder' ? 'text-lg' : 'text-sm'}`}
          style={{ visibility: 'hidden' }}
        >
          아직 가입이 안되어있다면?
        </button>
      </div>
    </div>
  );
};

export default SignupPage;
