export type UserType = 'elder' | 'caregiver';

export const USER_TYPE = {
  ELDER: 'elder' as const,
  CAREGIVER: 'caregiver' as const,
} as const;

// 경로로 사용자 타입 판단
export const getUserTypeFromPath = (pathname: string): UserType => {
  return pathname.startsWith('/elder') ? USER_TYPE.ELDER : USER_TYPE.CAREGIVER;
};

// 사용자 타입이 노인인지 확인
export const isElderUser = (userType: UserType): boolean => {
  return userType === USER_TYPE.ELDER;
};
