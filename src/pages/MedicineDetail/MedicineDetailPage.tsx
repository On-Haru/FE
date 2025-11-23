import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import TableHeader from '@/pages/MedicineDetail/components/TableHeader';
import TableList, { type MedicineItem } from '@/pages/MedicineDetail/components/TableList';
import FixandDeleteBtn from '@/pages/MedicineDetail/components/FixandDeleteBtn';
import { useToast } from '@/contexts/ToastContext';
import { getApiErrorMessage } from '@/utils/apiErrorHandler';

import {
  getPrescriptionDetail,
  updatePrescription,
  mapOCRResponseToMedicineItems,
} from '@/pages/MedicineDetail/services/prescription';
import type {
  PrescriptionInfo,
  PrescriptionCreateRequest,
} from '@/pages/MedicineDetail/types/prescription';
import { getPreviousPrescriptions } from '@/pages/PreviousMedicine/services/previous';
import type { OCRResponse } from '@/pages/MedicineRegister/services/ocr';

const MedicineDetailPage = () => {
  const navigate = useNavigate();
  const { showSuccess, showError, showInfo } = useToast();
  const [medicines, setMedicines] = useState<MedicineItem[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [prescriptionInfo, setPrescriptionInfo] = useState<PrescriptionInfo | null>(null);
  
  // OCR 데이터 처리 여부 추적 (중복 실행 방지)
  const hasProcessedOCR = useRef(false);
  const shouldAutoSave = useRef(false); // OCR 후 자동 저장 플래그
  const hasAutoSaved = useRef(false); // 자동 저장 실행 여부 추적

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
            return;
          }
          
          // OCR 데이터를 사용했으므로 자동 저장 플래그 설정
          shouldAutoSave.current = true;
          
          // OCR 데이터를 사용했으므로 여기서 종료 (기존 처방전 조회 로직 실행 안 함)
          return;
        }

        // 2. OCR 결과가 없거나 이미 처리했으면 최신 처방전 조회
        // 단, OCR을 이미 처리했다면 기존 로직을 실행하지 않음
        if (hasProcessedOCR.current) {
          return;
        }
        
        // 선택된 seniorId 확인
        const storedSeniorId = localStorage.getItem('selectedSeniorId');
        if (!storedSeniorId) {
          setMedicines([]);
          return;
        }

        const seniorId = Number(storedSeniorId);
        
        // 저장된 처방전 ID가 있으면 해당 처방전 조회 시도
        const storedId = localStorage.getItem('currentPrescriptionId');
        if (storedId) {
          try {
            const { prescriptionInfo: info, medicines: fetchedMedicines } =
              await getPrescriptionDetail(Number(storedId));
            
            // 조회한 처방전이 선택된 seniorId와 일치하는지 확인
            if (info.seniorId === seniorId) {
              setPrescriptionInfo(info);
              setMedicines(fetchedMedicines);
              return;
            }
          } catch (error) {
            // 저장된 ID로 조회 실패 시 최신 처방전 조회로 fallback
          }
        }
        
        // 선택된 seniorId에 맞는 최신 처방전 조회
        const prescriptions = await getPreviousPrescriptions(seniorId);
        
        if (prescriptions.length === 0) {
          // 처방전이 없으면 빈 상태로 설정
          setMedicines([]);
          return;
        }
        
        // 최신 처방전을 가져오기 위해 발급일 기준으로 내림차순 정렬합니다.
        const latestPrescription = [...prescriptions].sort((a, b) => new Date(b.issuedDate).getTime() - new Date(a.issuedDate).getTime())[0];
        const { prescriptionInfo: info, medicines: fetchedMedicines } =
          await getPrescriptionDetail(latestPrescription.id);

        setPrescriptionInfo(info);
        setMedicines(fetchedMedicines);
        
        // 조회한 처방전 ID를 localStorage에 저장 (다음 로드 시 사용)
        localStorage.setItem('currentPrescriptionId', String(latestPrescription.id));
      } catch (error: unknown) {
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
  const handleSaveEdit = useCallback(async () => {
    try {
      if (!prescriptionInfo) {
        showError('처방전 정보를 불러오는 중입니다. 잠시 후 다시 시도해주세요.');
        return;
      }

      // seniorId 검증
      if (!prescriptionInfo.seniorId) {
        showError('시니어 ID가 없습니다. 처방전 정보를 확인해주세요.');
        return;
      }

      // medicines 배열 검증
      if (medicines.length === 0) {
        showError('저장할 약물 정보가 없습니다. 약물을 추가해주세요.');
        return;
      }

      // 필수 필드 검증 및 기본값 설정 
      const hospitalName = prescriptionInfo.hospitalName?.trim() || '병원명 미입력';
      const doctorName = prescriptionInfo.doctorName?.trim() || '의사명 미입력';
      const issuedDate = prescriptionInfo.issuedDate || new Date().toISOString().split('T')[0];

      // seniorId 결정: OCR 데이터 > localStorage 선택값 > prescriptionInfo > 기본값
      const storedSeniorId = localStorage.getItem('selectedSeniorId');
      const seniorId = 
        prescriptionInfo.seniorId || 
        (storedSeniorId ? Number(storedSeniorId) : null) || 
        1005; // 기본값

      // 처방전 등록 API 형식으로 payload 생성
      const payload: PrescriptionCreateRequest = {
        seniorId,
        hospitalName,
        doctorName,
        issuedDate,
        note: null,
        medicines: medicines
          .filter((m) => m.name.trim() !== '') // 빈 약물명 제외
          .map((m) => ({
            name: m.name.trim() || '약품명 미입력',
            dosage: m.dosage ?? 0,
            totalCount: m.totalCount ?? 0,
            durationDays: m.durationDays ?? 0,
            memo: m.memo || null,
            aiDescription: m.aiDescription || null,
            schedules: (m.schedules || []).map((s) => ({
              notifyTime: s.notifyTime,
              timeTag: s.timeTag,
            })),
          })),
      };

      // medicines 배열이 비어있으면 에러
      if (payload.medicines.length === 0) {
        showError('저장할 약물 정보가 없습니다. 약물명을 입력해주세요.');
        return;
      }

      // 기존 처방전 ID가 있으면 업데이트 시도, 없으면 새로 생성
      const currentPrescriptionId = localStorage.getItem('currentPrescriptionId');
      const prescriptionId = currentPrescriptionId ? Number(currentPrescriptionId) : 0;
      
      const result = await updatePrescription(prescriptionId, payload);

      // 저장 후 새로 생성된 처방전 ID로 데이터 다시 불러오기
      if (!result || !result.id) {
        showError('저장은 완료되었지만 데이터를 불러오지 못했습니다. 페이지를 새로고침해주세요.', () => {
          window.location.reload();
        });
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

      // 저장 완료 알림
      showSuccess('저장 완료!');
      setEditMode(false);
    } catch (err: unknown) {
      const errorMessage = getApiErrorMessage(err);
      
      // note 필드 길이 초과 에러 처리
      if (errorMessage.includes('Data too long for column') && errorMessage.includes('note')) {
        showError('저장 실패: 비고(note) 필드가 너무 깁니다. 비고 내용이 500자를 초과하여 저장할 수 없습니다.');
      }
      // 404 에러인 경우 더 명확한 메시지 제공
      else if ((err as { response?: { status?: number } }).response?.status === 404) {
        showError('저장 실패: API 엔드포인트를 찾을 수 없습니다. 백엔드 서버가 실행 중인지 확인해주세요.', () => {
          handleSaveEdit();
        });
      } else {
        showError(`저장 실패: ${errorMessage}`, () => {
          handleSaveEdit();
        });
      }
    }
  }, [prescriptionInfo, medicines, showSuccess, showError]);

  // OCR 처리 후 자동 저장 (한 번만 실행되도록 보장)
  useEffect(() => {
    // shouldAutoSave 플래그가 false이거나 이미 자동 저장을 실행했으면 실행하지 않음
    if (!shouldAutoSave.current || hasAutoSaved.current) {
      return;
    }

    // prescriptionInfo와 medicines가 준비되지 않았으면 대기
    if (!prescriptionInfo || medicines.length === 0) {
      return;
    }

    // 플래그를 먼저 리셋하여 중복 실행 방지
    shouldAutoSave.current = false;
    hasAutoSaved.current = true;

    // 비동기로 실행하여 현재 렌더 사이클과 분리
    // 이렇게 하면 handleSaveEdit이 상태를 업데이트해도
    // 이 useEffect가 다시 실행되지 않음 (hasAutoSaved.current가 이미 true)
    const timeoutId = setTimeout(() => {
      handleSaveEdit();
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
    // handleSaveEdit은 useCallback으로 메모이즈되어 있지만,
    // 의존성 배열에 포함하지 않아도 ref를 통해 한 번만 실행되도록 보장됨
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prescriptionInfo, medicines]);

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
