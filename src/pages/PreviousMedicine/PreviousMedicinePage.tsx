import { useState, useEffect, useCallback } from 'react';
import TableHeader from '@/pages/PreviousMedicine/components/TableHeader';
import TableList from '@/pages/PreviousMedicine/components/TableList';
import {
  getPreviousPrescriptions,
  type Prescription,
} from '@/pages/PreviousMedicine/services/previous';
import { deletePrescription } from '@/pages/MedicineDetail/services/prescription';

const PreviousMedicinePage = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // localStorage에서 선택된 seniorId 가져오기
        const storedSeniorId = localStorage.getItem('selectedSeniorId');
        
        if (!storedSeniorId) {
          setPrescriptions([]);
          setLoading(false);
          return;
        }

        const seniorId = Number(storedSeniorId);
        const data = await getPreviousPrescriptions(seniorId);
        
        // 발급일 기준 내림차순 정렬 (최신 날짜가 맨 위)
        const sortedData = [...data].sort((a, b) => {
          const dateA = new Date(a.issuedDate).getTime();
          const dateB = new Date(b.issuedDate).getTime();
          return dateB - dateA; // 내림차순 (최신이 먼저)
        });
        
        setPrescriptions(sortedData);
      } catch (error: unknown) {
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

  /** 처방전 삭제 */
  const handleDeletePrescription = useCallback(async (prescriptionId: number, hospitalName: string) => {
    if (!confirm(`정말로 "${hospitalName}" 처방전을 삭제하시겠습니까?`)) {
      return;
    }

    try {
      await deletePrescription(prescriptionId);
      
      // 목록에서 삭제된 처방전 제거
      setPrescriptions((prev) => prev.filter((p) => p.id !== prescriptionId));
      
      // 현재 선택된 처방전이 삭제된 것이라면 localStorage에서도 제거
      const currentPrescriptionId = localStorage.getItem('currentPrescriptionId');
      if (currentPrescriptionId && Number(currentPrescriptionId) === prescriptionId) {
        localStorage.removeItem('currentPrescriptionId');
      }
      
      alert('처방전이 삭제되었습니다.');
    } catch (error: unknown) {
      const err = error as {
        response?: {
          status?: number;
          data?: { message?: string; errorCode?: string };
        };
        message?: string;
      };
      
      const errorMessage = err.response?.data?.message || err.message || '알 수 없는 오류';
      alert(`처방전 삭제 실패: ${errorMessage}`);
    }
  }, []);

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
          <div className="px-2 py-2 flex items-center justify-between">
            <div>
              <span className="text-lg font-semibold text-gray-800">
                {prescription.hospitalName} &ensp;
              </span>
              <span className="text-md font-base text-gray-400">
                {formatDate(prescription.issuedDate)}
              </span>
            </div>
            <button
              onClick={() => handleDeletePrescription(prescription.id, prescription.hospitalName)}
              className="px-4 py-2 text-sm text-red-500 border border-red-500 rounded-xl hover:bg-red-50 transition-colors"
            >
              삭제
            </button>
          </div>
          <TableHeader />
          <TableList medicines={prescription.medicines} />
        </div>
      ))}
    </div>
  );
};

export default PreviousMedicinePage;
