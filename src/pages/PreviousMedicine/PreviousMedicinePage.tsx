import { useState, useEffect } from 'react';
import TableHeader from '@/pages/PreviousMedicine/components/TableHeader';
import TableList, {
  type MedicineItem,
} from '@/pages/PreviousMedicine/components/TableList';
import { getPreviousPrescriptions } from '@/pages/PreviousMedicine/services/previous';

export interface Prescription {
  id: number;
  seniorId: number;
  issuedDate: string;
  hospitalName: string;
  doctorName: string;
  note: string;
  medicines: MedicineItem[];
}

const PreviousMedicinePage = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // TODO: 실제 seniorId를 가져와야 함 (예: URL 파라미터, 상태 관리 등)
        const seniorId = 1001; // 임시 값
        const data = await getPreviousPrescriptions(seniorId);
        
        // API 응답 데이터 매핑 (필드가 없을 경우 기본값 처리)
        const mappedPrescriptions: Prescription[] = (data || []).map((prescription: any) => ({
          id: prescription.id,
          seniorId: prescription.seniorId,
          issuedDate: prescription.issuedDate,
          hospitalName: prescription.hospitalName || '',
          doctorName: prescription.doctorName || '',
          note: prescription.note || '',
          medicines: (prescription.medicines || []).map((m: any) => ({
            id: m.id,
            prescriptionId: m.prescriptionId,
            name: m.name || '',
            dailyDoseCount: m.dosage ?? m.dailyDoseCount ?? null,
            administrationMethod: m.administrationMethod ?? null,
            memo: m.memo ?? null,
            totalCount: m.totalCount ?? null,
            durationDays: m.durationDays ?? null,
            aiDescription: m.aiDescription ?? null,
          })),
        }));
        
        setPrescriptions(mappedPrescriptions);
      } catch (error: any) {
        console.error('이전 처방전 조회 실패', {
          status: error.response?.status,
          data: error.response?.data,
        });
        setPrescriptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
  };

  if (loading) {
    return (
      <div className="w-full px-4 py-6 text-center text-sm text-gray-500">
        로딩 중...
      </div>
    );
  }

  if (prescriptions.length === 0) {
    return (
      <div className="w-full px-4 py-6 text-center text-sm text-gray-500">
        등록된 처방전이 없습니다.
      </div>
    );
  }

  return (
    <div className="w-full">
      {prescriptions.map((prescription) => (
        <div key={prescription.id} className="mb-8">
          <div className="px-2 py-2">
            <span className="text-lg font-semibold text-gray-800">
              {prescription.hospitalName} &ensp;
            </span>
            <span className="text-md font-base text-gray-400">
              {formatDate(prescription.issuedDate)}
            </span>
          </div>
          <TableHeader />
          <TableList medicines={prescription.medicines} />
        </div>
      ))}
    </div>
  );
};

export default PreviousMedicinePage;
