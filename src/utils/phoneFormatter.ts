/**
 * 전화번호 포맷팅 함수
 * 숫자만 추출하여 010-1234-5678 형식으로 변환
 */
export const formatPhoneNumber = (value: string): string => {
  // 숫자만 추출
  const numbers = value.replace(/[^\d]/g, '');

  // 최대 11자리까지만 허용 (한국 전화번호)
  const limitedNumbers = numbers.slice(0, 11);

  // 자동 하이픈 포맷팅
  if (limitedNumbers.length <= 3) {
    return limitedNumbers;
  } else if (limitedNumbers.length <= 7) {
    return `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3)}`;
  } else {
    return `${limitedNumbers.slice(0, 3)}-${limitedNumbers.slice(3, 7)}-${limitedNumbers.slice(7)}`;
  }
};

/**
 * 전화번호에서 숫자만 추출
 */
export const extractPhoneNumber = (value: string): string => {
  return value.replace(/[^\d]/g, '');
};
