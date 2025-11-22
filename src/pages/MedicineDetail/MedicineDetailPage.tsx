import { useState, useEffect, useRef } from 'react';
import TableHeader from '@/pages/MedicineDetail/components/TableHeader';
import TableList, { type MedicineItem } from '@/pages/MedicineDetail/components/TableList';
import FixandDeleteBtn from '@/pages/MedicineDetail/components/FixandDeleteBtn';

import {
  getLatestPrescriptionId,
  getPrescriptionDetail,
  updatePrescription,
} from '@/pages/MedicineDetail/services/prescription';
import type { OCRResponse } from '../MedicineRegister/services/ocr';

const MedicineDetailPage = () => {
  const [medicines, setMedicines] = useState<MedicineItem[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [prescriptionInfo, setPrescriptionInfo] = useState<{
    seniorId: number;
    hospitalName: string;
    doctorName: string;
    issuedDate: string;
    note: string;
  } | null>(null);
  
  // OCR 데이터 처리 여부 추적 (중복 실행 방지)
  const hasProcessedOCR = useRef(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. localStorage에서 OCR 결과 확인
        const ocrDataStr = localStorage.getItem('ocrPrescriptionData');
        if (ocrDataStr && !hasProcessedOCR.current) {
          hasProcessedOCR.current = true; // OCR 처리 시작 표시
          console.log('📸 OCR 데이터 발견, OCR 결과 사용');
          const ocrData = JSON.parse(ocrDataStr) as OCRResponse;
          
          console.log('📋 OCR 원본 데이터:', ocrData);
          console.log('📋 OCR medicines:', ocrData.medicines);
          console.log('📋 OCR medicines 개수:', ocrData.medicines?.length || 0);
          
          // OCR 데이터 사용 후 즉시 localStorage에서 제거 (중복 실행 방지)
          localStorage.removeItem('ocrPrescriptionData');
          console.log('🗑️ OCR 데이터 localStorage에서 제거 완료 (중복 실행 방지)');
          
          // OCR 결과 사용 (id는 모두 null이므로 임시 ID 생성)
          setPrescriptionInfo({
            seniorId: ocrData.seniorId ?? 1001, // TODO: 실제 seniorId 가져오기
            hospitalName: ocrData.hospitalName ?? '',
            doctorName: ocrData.doctorName ?? '',
            issuedDate: ocrData.issuedDate ?? new Date().toISOString().split('T')[0],
            note: ocrData.note ?? '',
          });

          // medicines 매핑 (임시 ID 생성)
          const mapped: MedicineItem[] = (ocrData.medicines || []).map((m, idx: number) => {
            const medicineId = Date.now() + idx; // 임시 ID
            console.log(`💊 OCR Medicine ${idx + 1}:`, {
              name: m.name,
              dosage: m.dosage,
              totalCount: m.totalCount,
              durationDays: m.durationDays,
              schedulesCount: m.schedules?.length || 0,
            });
            return {
              id: medicineId,
              name: m.name || '',
              dosage: m.dosage ?? 0,
              totalCount: m.totalCount ?? 0,
              durationDays: m.durationDays ?? 0,
              memo: m.memo ?? null,
              aiDescription: m.aiDescription ?? null,
              schedules: (m.schedules || []).map((s, sIdx: number) => ({
                id: medicineId * 1000 + sIdx, // 임시 ID
                notifyTime: s.notifyTime,
                timeTag: s.timeTag,
              })),
            };
          });

          console.log('📋 OCR로 매핑된 medicines (최종):', mapped);
          console.log('📋 OCR로 매핑된 medicines 개수:', mapped.length);
          
          // medicines state 업데이트
          setMedicines(mapped);
          console.log('✅ medicines state 업데이트 완료');
          
          // OCR 결과가 비어있는 경우 사용자에게 알림
          if (mapped.length === 0) {
            console.warn('⚠️ OCR 결과가 비어있습니다. 처방전을 인식하지 못했을 수 있습니다.');
          } else {
            console.log(`✅ ${mapped.length}개의 약물 정보를 성공적으로 불러왔습니다.`);
          }
          
          // OCR 데이터를 사용했으므로 여기서 종료 (기존 처방전 조회 로직 실행 안 함)
          return;
        }

        // 2. OCR 결과가 없거나 이미 처리했으면 기존 로직 사용
        // 단, OCR을 이미 처리했다면 기존 로직을 실행하지 않음
        if (hasProcessedOCR.current) {
          console.log('📋 OCR 데이터를 이미 처리했으므로 기존 처방전 조회 로직을 건너뜁니다.');
          return;
        }
        
        console.log('📋 기존 처방전 조회 로직 사용');
        const storedId = localStorage.getItem('currentPrescriptionId');
        const initialId = storedId ? Number(storedId) : await getLatestPrescriptionId();
        
        const detail = await getPrescriptionDetail(initialId);
        console.log('📋 Prescription detail:', detail);

        // 처방전 기본 정보 저장
        setPrescriptionInfo({
          seniorId: detail.seniorId,
          hospitalName: detail.hospitalName,
          doctorName: detail.doctorName,
          issuedDate: detail.issuedDate,
          note: detail.note,
        });

        // medicines 필드가 없거나 빈 배열인 경우 처리
        if (!detail.medicines || !Array.isArray(detail.medicines)) {
          console.warn('⚠️ medicines 필드가 없거나 배열이 아닙니다. 빈 배열로 설정합니다.');
          setMedicines([]);
          return;
        }

        const mapped: MedicineItem[] = detail.medicines.map((m: {
          id: number;
          name: string;
          dosage: number;
          totalCount: number;
          durationDays: number;
          memo?: string | null;
          aiDescription?: string | null;
          schedules?: Array<{
            id: number;
            notifyTime: string;
            timeTag: 'MORNING' | 'LUNCH' | 'EVENING';
          }>;
        }) => {
          console.log('💊 Medicine item:', m);
          return {
            id: m.id,
            name: m.name || '',
            dosage: m.dosage ?? 0,
            totalCount: m.totalCount ?? 0,
            durationDays: m.durationDays ?? 0,
            memo: m.memo ?? null,
            aiDescription: m.aiDescription ?? null,
            schedules: (m.schedules || []).map((s) => ({
              id: s.id,
              notifyTime: s.notifyTime,
              timeTag: s.timeTag,
            })),
          };
        });

        setMedicines(mapped);
      } catch (error: any) {
        console.error('처방전 조회 실패');
        console.log('status:', error.response?.status);
        console.log('data:', error.response?.data);
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

      // 처방전 등록 API 형식으로 payload 생성
      const payload = {
        seniorId: prescriptionInfo.seniorId,
        hospitalName: prescriptionInfo.hospitalName,
        doctorName: prescriptionInfo.doctorName,
        issuedDate: prescriptionInfo.issuedDate,
        note: prescriptionInfo.note,
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

      console.log('📦 Update payload:', JSON.stringify(payload, null, 2));
      console.log('📦 Schedules 확인:', medicines.map(m => ({ 
        name: m.name, 
        schedulesCount: m.schedules.length, 
        schedules: m.schedules 
      })));

      const result = await updatePrescription(0, payload);
      console.log('저장 성공 응답:', result);

      // 저장 후 새로 생성된 처방전 ID로 데이터 다시 불러오기
      // 백엔드 API가 일관된 형식(result.id)으로 ID를 반환해야 함
      if (!result || !result.id) {
        console.error('❌ 저장 응답에 처방전 ID가 없습니다:', result);
        alert('저장은 완료되었지만 데이터를 불러오지 못했습니다. 페이지를 새로고침해주세요.');
        setEditMode(false);
        return;
      }

      const newPrescriptionId = result.id;
      console.log('📋 새로 생성된 처방전 ID:', newPrescriptionId);
      
      // localStorage에 새로 생성된 처방전 ID 저장 (새로고침 시 사용)
      localStorage.setItem('currentPrescriptionId', String(newPrescriptionId));
      
      const detail = await getPrescriptionDetail(newPrescriptionId);
      
      console.log('📋 저장 후 조회한 데이터:', detail);
      console.log('📋 저장 후 조회한 medicines:', detail.medicines);
      
      if (detail.medicines && Array.isArray(detail.medicines)) {
        const mapped: MedicineItem[] = detail.medicines.map((m: {
          id: number;
          name: string;
          dosage: number;
          totalCount: number;
          durationDays: number;
          memo?: string | null;
          aiDescription?: string | null;
          schedules?: Array<{
            id: number;
            notifyTime: string;
            timeTag: 'MORNING' | 'LUNCH' | 'EVENING';
          }>;
        }) => {
          console.log('💊 Medicine:', m.name, 'Schedules:', m.schedules);
          return {
            id: m.id,
            name: m.name || '',
            dosage: m.dosage ?? 0,
            totalCount: m.totalCount ?? 0,
            durationDays: m.durationDays ?? 0,
            memo: m.memo ?? null,
            aiDescription: m.aiDescription ?? null,
            schedules: (m.schedules || []).map((s) => ({
              id: s.id,
              notifyTime: s.notifyTime,
              timeTag: s.timeTag,
            })),
          };
        });
        console.log('📋 매핑된 medicines:', mapped);
        setMedicines(mapped);
        
        // 처방전 기본 정보도 업데이트
        setPrescriptionInfo({
          seniorId: detail.seniorId,
          hospitalName: detail.hospitalName,
          doctorName: detail.doctorName,
          issuedDate: detail.issuedDate,
          note: detail.note,
        });
      }

      alert('저장 완료!');
      setEditMode(false);
    } catch (err: any) {
      console.error('저장 실패:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      alert(`저장 실패: ${err.response?.data?.message || err.message || '알 수 없는 오류'}`);
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

  // 디버깅: medicines state 확인
  console.log('🔍 MedicineDetailPage 렌더링:', {
    medicinesCount: medicines.length,
    medicines: medicines,
    editMode,
  });

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
