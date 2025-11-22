import { useState, useEffect } from 'react';
import TableHeader from '@/pages/MedicineDetail/components/TableHeader';
import TableList, { type MedicineItem } from '@/pages/MedicineDetail/components/TableList';
import FixandDeleteBtn from '@/pages/MedicineDetail/components/FixandDeleteBtn';

import {
  getLatestPrescriptionId,
  getPrescriptionDetail,
  updatePrescription,
} from '@/pages/MedicineDetail/services/prescription';

const MedicineDetailPage = () => {
  const [medicines, setMedicines] = useState<MedicineItem[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const latestId = await getLatestPrescriptionId();
        const detail = await getPrescriptionDetail(latestId);

        console.log('📋 Prescription detail:', detail);

        // medicines 필드가 없거나 빈 배열인 경우 처리
        if (!detail.medicines || !Array.isArray(detail.medicines)) {
          console.warn('⚠️ medicines 필드가 없거나 배열이 아닙니다. 빈 배열로 설정합니다.');
          setMedicines([]);
          return;
        }

        const mapped: MedicineItem[] = detail.medicines.map((m: any) => ({
          id: m.id,
          name: m.name,
          dosage: m.dosage,
          totalCount: m.totalCount,
          durationDays: m.durationDays,
          memo: m.memo ?? null,
          aiDescription: m.aiDescription ?? null,
          schedules: (m.schedules || []).map((s: any) => ({
            id: s.id,
            notifyTime: s.notifyTime,
            timeTag: s.timeTag,
          })),
        }));

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
      const latestId = await getLatestPrescriptionId();

      const payload = {
        medicines: medicines.map((m) => ({
          id: typeof m.id === 'number' ? m.id : undefined, // 신규는 undefined
          name: m.name,
          dosage: m.dosage,
          totalCount: m.totalCount,
          durationDays: m.durationDays,
          memo: m.memo,
          aiDescription: m.aiDescription,
          schedules: m.schedules.map((s) => ({
            id: typeof s.id === 'number' ? s.id : undefined,
            notifyTime: s.notifyTime,
            timeTag: s.timeTag,
          })),
        })),
      };

      console.log('📦 Update payload:', payload);

      await updatePrescription(latestId, payload);

      alert('저장 완료!');
      setEditMode(false);
    } catch (err) {
      console.error('❌ 저장 실패:', err);
      alert('저장 실패');
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
      const maxId =
        prev.flatMap((m) => m.schedules).reduce((max, s) => (s.id > max ? s.id : max), 0) || 0;

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
