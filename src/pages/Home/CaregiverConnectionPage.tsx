import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CaregiverConnectionPage = () => {
  const navigate = useNavigate();
  const [connectionCode, setConnectionCode] = useState('');

  // 입력값 변경 처리 (숫자만 입력받기)
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // 숫자가 아닌 문자 제거
    if (value.length <= 4) {
      setConnectionCode(value);
    }
  };

  // 제출 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (connectionCode.length !== 4) {
      return; // 4자리가 아니면 제출 불가
    }

    try {
      // TODO: API 호출로 연결 시도 (9단계에서 구현)
      // await connectByCode(connectionCode);
      console.log('연결 코드:', connectionCode);

      // 성공 시 홈으로 이동
      navigate('/home');
    } catch (error) {
      console.error('연결 실패:', error);
      // TODO: 에러 처리 (알림 등)
    }
  };

  // 버튼 활성화 조건
  const isButtonDisabled = connectionCode.length !== 4;

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-8">
      <div className="w-full max-w-sm space-y-8">
        {/* 제목 */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            피보호자 연결하기
          </h1>
          <p className="text-sm text-gray-600">
            어르신 홈화면에 표시되는 연결 코드를 입력하세요
          </p>
        </div>

        {/* 입력 필드 */}
        <form onSubmit={handleSubmit} className="space-y-6">
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
              autoFocus
            />
          </div>

          {/* 제출 버튼 */}
          <button
            type="submit"
            disabled={isButtonDisabled}
            className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all ${
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
