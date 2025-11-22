import { useState, useEffect, useRef } from 'react';
import TableHeader from '@/pages/MedicineDetail/components/TableHeader';
import TableList, { type MedicineItem } from '@/pages/MedicineDetail/components/TableList';
import FixandDeleteBtn from '@/pages/MedicineDetail/components/FixandDeleteBtn';

import {
  getLatestPrescriptionId,
  getPrescriptionDetail,
  updatePrescription,
  mapOCRResponseToMedicineItems,
  type PrescriptionInfo,
  type PrescriptionCreateRequest,
} from '@/pages/MedicineDetail/services/prescription';
import type { OCRResponse } from '../MedicineRegister/services/ocr';

const MedicineDetailPage = () => {
  const [medicines, setMedicines] = useState<MedicineItem[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [prescriptionInfo, setPrescriptionInfo] = useState<PrescriptionInfo | null>(null);
  
  // OCR 데이터 처리 여부 추적 (중복 실행 방지)
  const hasProcessedOCR = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. localStorage에서 OCR 결과 확인
        const ocrDataStr = localStorage.getItem('ocrPrescriptionData');
        if (ocrDataStr && !hasProcessedOCR.current) {
          hasProcessedOCR.current = true; // OCR 처리 시작 표시
          const ocrData = JSON.parse(ocrDataStr) as OCRResponse;
          
          // OCR 데이터 사용 후 즉시 localStorage에서 제거 (중복 실행 방지)
          localStorage.removeItem('ocrPrescriptionData');
          
          // OCR 응답을 UI 모델로 변환
          const { medicines, prescriptionInfo: info } = mapOCRResponseToMedicineItems(ocrData);
          
          setPrescriptionInfo(info);
          setMedicines(medicines);
          
          // OCR 결과가 비어있는 경우 사용자에게 알림
          if (medicines.length === 0) {
            console.warn('⚠️ OCR 결과가 비어있습니다. 처방전을 인식하지 못했을 수 있습니다.');
          }
          
          // OCR 처리 후 최신 처방전 ID 조회 및 저장
          try {
            const latestId = await getLatestPrescriptionId();
            localStorage.setItem('currentPrescriptionId', String(latestId));
          } catch (error) {
            console.error('최신 처방전 ID 조회 실패:', error);
          }
          
          // OCR 데이터를 사용했으므로 여기서 종료 (기존 처방전 조회 로직 실행 안 함)
          return;
        }

        // 2. OCR 결과가 없거나 이미 처리했으면 최신 처방전 조회
        // 단, OCR을 이미 처리했다면 기존 로직을 실행하지 않음
        if (hasProcessedOCR.current) {
          return;
        }
        
        // 저장된 처방전 ID가 있으면 사용, 없으면 최신 처방전 ID 조회
        const storedId = localStorage.getItem('currentPrescriptionId');
        const initialId = storedId ? Number(storedId) : await getLatestPrescriptionId();
        
        const { prescriptionInfo: info, medicines: fetchedMedicines } =
          await getPrescriptionDetail(initialId);

        setPrescriptionInfo(info);
        setMedicines(fetchedMedicines);
        
        // 조회한 처방전 ID를 localStorage에 저장 (다음 로드 시 사용)
        localStorage.setItem('currentPrescriptionId', String(initialId));
      } catch (error: unknown) {
        const err = error as { response?: { status?: number; data?: unknown } };
        console.error('처방전 조회 실패', {
          status: err.response?.status,
          data: err.response?.data,
        });
        setMedicines([]);
      }
    };

    fetchData();
  }, []);

  /** 선택 토글 */
  const toggleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  /** 전체 선택 */
  const toggleSelectAll = (isChecked: boolean, medicines: MedicineItem[]) => {
    setSelected(isChecked ? medicines.map((m) => m.id) : []);
  };

  /** 체크된 약 삭제 */
  const handleDeleteSelected = () => {
    setMedicines((prev) => prev.filter((m) => !selected.includes(m.id)));
    setSelected([]);
  };

  /** 수정 모드 toggle */
  const handleToggleEdit = () => setEditMode((prev) => !prev);

  /** 최종 저장 → 백엔드 업데이트 */
  const handleSaveEdit = async () => {
    try {
      if (!prescriptionInfo) {
        alert('처방전 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
        return;
      }

      // seniorId 검증
      if (!prescriptionInfo.seniorId) {
        alert('시니어 ID가 없습니다. 처방전 정보를 확인해주세요.');
        return;
      }

      // 필수 필드 검증 및 기본값 설정 
      const hospitalName = prescriptionInfo.hospitalName?.trim() || '병원명 미입력';
      const doctorName = prescriptionInfo.doctorName?.trim() || '의사명 미입력';
      const issuedDate = prescriptionInfo.issuedDate || new Date().toISOString().split('T')[0];

      // 처방전 등록 API 형식으로 payload 생성
      // 백엔드가 업데이트를 지원하지 않으므로 항상 새로 생성
      // seniorId는 항상 1005 사용 (백엔드에 존재하는 피보호자 ID)
      const payload: PrescriptionCreateRequest = {
        seniorId: 1005,
        hospitalName,
        doctorName,
        issuedDate,
        note: prescriptionInfo.note || '',
        medicines: medicines.map((m) => ({
          name: m.name,
          dosage: m.dosage,
          totalCount: m.totalCount,
          durationDays: m.durationDays,
          memo: m.memo,
          aiDescription: m.aiDescription,
          schedules: m.schedules.map((s) => ({
            notifyTime: s.notifyTime,
            timeTag: s.timeTag,
          })),
        })),
      };

      // 항상 새로 생성 (백엔드가 업데이트를 지원하지 않음)
      const result = await updatePrescription(0, payload);

      // 저장 후 새로 생성된 처방전 ID로 데이터 다시 불러오기
      if (!result || !result.id) {
        alert('저장은 완료되었지만 데이터를 불러오지 못했습니다. 페이지를 새로고침해주세요.');
        setEditMode(false);
        return;
      }
      
      const newPrescriptionId = result.id;
      
      // localStorage에 새로 생성된 처방전 ID 저장 (새로고침 시 사용)
      localStorage.setItem('currentPrescriptionId', String(newPrescriptionId));
      
      const { prescriptionInfo: updatedInfo, medicines: updatedMedicines } =
        await getPrescriptionDetail(newPrescriptionId);
      
      setPrescriptionInfo(updatedInfo);
      setMedicines(updatedMedicines);

      alert('저장 완료!');
      setEditMode(false);
    } catch (err: unknown) {
      const error = err as {
        response?: {
          status?: number;
          statusText?: string;
          data?: { message?: string };
        };
        message?: string;
      };
      
      console.error('저장 실패', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        response: error.response?.data,
      });
      
      // 404 에러인 경우 더 명확한 메시지 제공
      if (error.response?.status === 404) {
        alert(
          '저장 실패: API 엔드포인트를 찾을 수 없습니다.\n\n백엔드 서버가 실행 중인지 확인하거나, API 경로가 올바른지 확인해주세요.'
        );
      } else {
        alert(
          `저장 실패: ${error.response?.data?.message || error.message || '알 수 없는 오류'}`
        );
      }
    }
  };

  /** 필드 수정 */
  const handleChangeField = (id: number, field: string, value: string | number) => {
    setMedicines((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  /** 알람(스케줄) 수정 */
  const handleChangeAlarm = (
    medicineId: number,
    alarmId: number,
    newTime: string,
    newType: 'MORNING' | 'LUNCH' | 'EVENING'
  ) => {
    setMedicines((prev) =>
      prev.map((m) =>
        m.id === medicineId
          ? {
              ...m,
              schedules: m.schedules.map((s) =>
                s.id === alarmId
                  ? { ...s, notifyTime: newTime, timeTag: newType }
                  : s
              ),
            }
          : m
      )
    );
  };

  /** 알람 삭제 */
  const handleDeleteAlarm = (medicineId: number, alarmId: number) => {
    setMedicines((prev) =>
      prev.map((m) =>
        m.id === medicineId
          ? { ...m, schedules: m.schedules.filter((s) => s.id !== alarmId) }
          : m
      )
    );
  };

  /** 알람 추가 */
  const handleAddAlarm = (medicineId: number) => {
    setMedicines((prev) => {
      const newAlarm = {
        id: Date.now(), // 임시 ID
        notifyTime: '08:00',
        timeTag: 'MORNING' as const,
      };

      return prev.map((m) =>
        m.id === medicineId
          ? { ...m, schedules: [...m.schedules, newAlarm] }
          : m
      );
    });
  };

  /** 약 삭제 */
  const handleDeleteMedicine = (medicineId: number) => {
    setMedicines((prev) => prev.filter((m) => m.id !== medicineId));
    setSelected((prev) => prev.filter((id) => id !== medicineId));
  };

  /** 약 추가 */
  const handleAddMedicine = () => {
    setMedicines((prev) => [
      ...prev,
      {
        id: Date.now(), // 임시 ID
        name: '약품명',
        dosage: 1,
        totalCount: 0,
        durationDays: 1,
        memo: null,
        aiDescription: null,
        schedules: [],
      },
    ]);
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex-1">
        <TableHeader
          allChecked={selected.length === medicines.length}
          onToggleAll={(checked) => toggleSelectAll(checked, medicines)}
        />

        <TableList
          medicines={medicines}
          selected={selected}
          onToggleItem={toggleSelect}
          editMode={editMode}
          onChangeField={handleChangeField}
          onChangeAlarm={handleChangeAlarm}
          onDeleteAlarm={handleDeleteAlarm}
          onAddAlarm={handleAddAlarm}
          onDeleteMedicine={handleDeleteMedicine}
          onAddMedicine={handleAddMedicine}
        />
      </div>

      <FixandDeleteBtn
        onDelete={handleDeleteSelected}
        editMode={editMode}
        onToggleEdit={handleToggleEdit}
        onSave={handleSaveEdit}
      />
    </div>
  );
};

export default MedicineDetailPage;
