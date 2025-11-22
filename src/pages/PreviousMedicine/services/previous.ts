import axiosInstance from '@/lib/axios';

export async function getPreviousPrescriptions(seniorId: number) {
  const res = await axiosInstance.get(`/api/prescriptions?seniorId=${seniorId}`);
  return res.data.data;
}
