import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createCaregiverLink } from './services/caregiverLink';
import { formatPhoneNumber, extractPhoneNumber } from '@/utils/phoneFormatter';

const CaregiverConnectionPage = () => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [connectionCode, setConnectionCode] = useState('');

  // 전화번호 입력값 변경 처리
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhoneNumber(formatted);
  };

  // 연결 코드 입력값 변경 처리 (숫자만 입력받기)
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // 숫자가 아닌 문자 제거
    if (value.length <= 4) {
      setConnectionCode(value);
    }
  };

  // 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const phoneWithoutHyphen = extractPhoneNumber(phoneNumber);
    if (phoneWithoutHyphen.length < 10 || phoneWithoutHyphen.length > 11) {
      alert('올바른 전화번호를 입력해주세요.');
      return;
    }

    if (connectionCode.length !== 4) {
      alert('연결 코드를 입력해주세요.');
      return;
    }

    try {
      await createCaregiverLink({
        phoneNumber: phoneWithoutHyphen,
        code: parseInt(connectionCode, 10),
      });

      // 성공 시 홈으로 이동
      navigate('/home');
    } catch (error: any) {
      // 에러 응답 처리
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;
        const errorCode = errorData?.errorCode;
        const errorMessage = errorData?.message;

        if (status === 400) {
          if (errorCode === 'US003') {
            alert('피보호자 정보가 일치하지 않습니다.');
          } else {
            alert(errorMessage || '입력 정보를 확인해주세요.');
          }
        } else if (status === 401) {
          if (errorCode === 'AU001') {
            alert('인증 토큰이 필요합니다. 다시 로그인해주세요.');
          } else if (errorCode === 'AU002') {
            alert('유효하지 않은 토큰입니다. 다시 로그인해주세요.');
          } else {
            alert(errorMessage || '인증에 실패했습니다.');
          }
        } else if (status === 409) {
          if (errorCode === 'CG001') {
            alert('이미 등록된 보호자입니다.');
          } else {
            alert(errorMessage || '이미 등록된 정보입니다.');
          }
        } else if (status === 502) {
          alert('서버에 연결할 수 없습니다. 잠시 후 다시 시도해주세요.');
        } else {
          alert(errorMessage || `연결에 실패했습니다. (오류 코드: ${status})`);
        }
      } else {
        const errorMessage = error.message || '연결에 실패했습니다.';
        alert(errorMessage);
      }
    }
  };

  // 버튼 활성화 조건
  const phoneWithoutHyphen = extractPhoneNumber(phoneNumber);
  const isButtonDisabled =
    phoneWithoutHyphen.length < 10 ||
    phoneWithoutHyphen.length > 11 ||
    connectionCode.length !== 4;

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-8">
      <div className="w-full max-w-sm space-y-8">
        {/* 제목 */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            피보호자 연결하기
          </h1>
          <p className="text-sm text-gray-600">
            피보호자의 홈화면에 표시되는 연결 코드를 입력하세요
          </p>
        </div>

        {/* 입력 필드 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium text-gray-700 mb-3 text-center"
            >
              피보호자 전화번호
            </label>
            <input
              id="phoneNumber"
              type="tel"
              inputMode="numeric"
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder="010-1234-5678"
              maxLength={13}
              className="w-full px-6 py-4 text-lg text-center rounded-xl border-2 border-gray-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary transition-colors"
              autoFocus
            />
          </div>
          <div>
            <label
              htmlFor="connectionCode"
              className="block text-sm font-medium text-gray-700 mb-3 text-center"
            >
              연결 코드
            </label>
            <input
              id="connectionCode"
              type="text"
              inputMode="numeric"
              value={connectionCode}
              onChange={handleCodeChange}
              placeholder="0000"
              maxLength={4}
              className="w-full px-6 py-4 text-4xl font-bold text-center rounded-xl border-2 border-gray-300 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary transition-colors"
            />
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={isButtonDisabled}
            className={`cursor-pointer w-full py-4 px-6 rounded-xl font-semibold text-white transition-all ${
              isButtonDisabled
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-primary hover:opacity-90'
            }`}
          >
            연결하기
          </button>
        </form>

        {/* 안내 텍스트 */}
        <p className="text-xs text-gray-500 text-center leading-relaxed">
          어르신 홈화면 우측 상단에 표시되는 4자리 숫자를 입력해주세요.
        </p>
      </div>
    </div>
  );
};

export default CaregiverConnectionPage;
