import { useState, useEffect, useCallback } from 'react';
import TableHeader from '@/pages/PreviousMedicine/components/TableHeader';
import TableList from '@/pages/PreviousMedicine/components/TableList';
import DeleteConfirmModal from '@/pages/PreviousMedicine/components/DeleteConfirmModal';
import {
  getPreviousPrescriptions,
  type Prescription,
} from '@/pages/PreviousMedicine/services/previous';
import { deletePrescription } from '@/pages/MedicineDetail/services/prescription';

const PreviousMedicinePage = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    prescriptionId: number | null;
    hospitalName: string;
  }>({
    isOpen: false,
    prescriptionId: null,
    hospitalName: '',
  });

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

  /** 처방전 삭제 모달 열기 */
  const handleOpenDeleteModal = (prescriptionId: number, hospitalName: string) => {
    setDeleteModal({
      isOpen: true,
      prescriptionId,
      hospitalName,
    });
  };

  /** 처방전 삭제 모달 닫기 */
  const handleCloseDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      prescriptionId: null,
      hospitalName: '',
    });
  };

  /** 처방전 삭제 확인 */
  const handleDeletePrescription = useCallback(async () => {
    if (!deleteModal.prescriptionId) return;

    try {
      await deletePrescription(deleteModal.prescriptionId);
      
      // 목록에서 삭제된 처방전 제거
      setPrescriptions((prev) => prev.filter((p) => p.id !== deleteModal.prescriptionId));
      
      // 현재 선택된 처방전이 삭제된 것이라면 localStorage에서도 제거
      const currentPrescriptionId = localStorage.getItem('currentPrescriptionId');
      if (currentPrescriptionId && Number(currentPrescriptionId) === deleteModal.prescriptionId) {
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
  }, [deleteModal.prescriptionId]);

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
              onClick={() => handleOpenDeleteModal(prescription.id, prescription.hospitalName)}
              className="px-2 py-1 text-sm text-red-500 border border-red-500 rounded-lg hover:bg-red-50 transition-colors"
            >
              삭제
            </button>
          </div>
          <TableHeader />
          <TableList medicines={prescription.medicines} />
        </div>
      ))}

      {/* 삭제 확인 모달 */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        hospitalName={deleteModal.hospitalName}
        onConfirm={handleDeletePrescription}
        onCancel={handleCloseDeleteModal}
      />
    </div>
  );
};

export default PreviousMedicinePage;
