import { useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { login } from './services/auth';
import { setAccessToken } from '@/lib/storage';
import { getRoleFromToken } from '@/lib/jwt';
import BackButton from './components/BackButton';
import AuthLogo from './components/AuthLogo';
import AuthInput from './components/AuthInput';
import { formatPhoneNumber, extractPhoneNumber } from '@/utils/phoneFormatter';

const LoginPage = () => {
  const navigate = useNavigate();
  const { role } = useParams<{ role: string }>();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    // role이 없거나 유효하지 않으면 역할 선택 페이지로 리다이렉트
    if (!role || (role !== 'elder' && role !== 'caregiver')) {
      navigate('/');
    }
  }, [role, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // API 스펙에 맞춰 데이터 변환
      // - phone: 하이픈 제거
      const phoneWithoutHyphen = extractPhoneNumber(phoneNumber);

      const response = await login({
        phone: phoneWithoutHyphen,
        password,
      });

      // 성공 시 처리
      // JWT 토큰 저장
      setAccessToken(response.token);

      // JWT 토큰에서 실제 사용자 역할 확인
      const userRole = getRoleFromToken(response.token);

      // URL의 role과 실제 사용자 role이 일치하는지 확인
      const expectedRole = role === 'elder' ? 'SENIOR' : 'CAREGIVER';

      if (userRole !== expectedRole) {
        // 역할이 일치하지 않으면 에러 메시지 표시
        alert(
          role === 'elder'
            ? '보호자 계정으로 로그인해주세요.'
            : '어르신 계정으로 로그인해주세요.'
        );
        return;
      }

      // 역할에 따라 다른 경로로 이동
      if (role === 'elder') {
        navigate('/elder');
      } else {
        navigate('/home');
      }
    } catch (error: any) {
      console.error('Failed to login', error);

      // 에러 응답 처리
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        const errorCode = errorData?.errorCode;
        const errorMessage = errorData?.message;

        // 상태 코드에 따른 메시지 처리
        if (status === 404) {
          if (errorCode === 'US001') {
            alert('유저가 존재하지 않습니다.');
          } else {
            alert(errorMessage || '등록되지 않은 전화번호입니다.');
          }
        } else if (status === 500) {
          if (errorCode === 'GL001') {
            alert('예상치 못한 서버 오류가 발생했습니다.');
          } else {
            alert(errorMessage || '서버 오류가 발생했습니다.');
          }
        } else if (status === 400) {
          // Validation 에러
          alert(errorMessage || '입력 정보를 확인해주세요.');
        } else {
          alert(
            errorMessage || `로그인에 실패했습니다. (오류 코드: ${status})`
          );
        }
      } else {
        // 네트워크 에러 또는 서비스에서 던진 에러
        const errorMessage = error.message || '로그인에 실패했습니다.';
        alert(errorMessage);
      }
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
            className={`cursor-pointer w-full rounded-xl text-white font-semibold bg-primary ${role === 'elder' ? 'py-5 text-xl' : 'py-4 text-base'}`}
          >
            로그인
          </button>
        </form>

        {/* 회원가입 링크 표시 */}
        <button
          onClick={() => navigate(`/${role}/signup`)}
          className={`cursor-pointer text-gray-600 hover:text-primary transition-colors mb-8 ${role === 'elder' ? 'text-lg' : 'text-sm'}`}
        >
          아직 가입이 안되어있다면?
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
