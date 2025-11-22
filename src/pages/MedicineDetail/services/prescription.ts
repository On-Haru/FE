import axiosInstance from '@/lib/axios';

export async function getLatestPrescriptionId() {
  return 5001; // 실제 존재하는 처방전 ID
}

export async function getPrescriptionDetail(id: number) {
  const res = await axiosInstance.get(`/api/prescriptions/${id}`);
  return res.data.data;
}

export async function updatePrescription(id: number, data: any) {
  const res = await axiosInstance.put(`/api/prescriptions/${id}`, data);
  return res.data.data;
}
