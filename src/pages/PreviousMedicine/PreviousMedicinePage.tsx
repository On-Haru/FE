import { useState, useEffect } from 'react';
import TableHeader from '@/pages/PreviousMedicine/components/TableHeader';
import TableList from '@/pages/PreviousMedicine/components/TableList';
import {
  getPreviousPrescriptions,
  type Prescription,
} from '@/pages/PreviousMedicine/services/previous';

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
          console.warn('선택된 피보호자가 없습니다.');
          setPrescriptions([]);
          setLoading(false);
          return;
        }

        const seniorId = Number(storedSeniorId);
        const data = await getPreviousPrescriptions(seniorId);
        setPrescriptions(data);
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
