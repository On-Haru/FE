import TableHeader from '@/pages/MedicineDetail/components/TableHeader';
import TableList, {
  type MedicineItem,
} from '@/pages/MedicineDetail/components/TableList';
import FixandDeleteBtn from '@/pages/MedicineDetail/components/FixandDeleteBtn';
import { useState } from 'react';

const MedicineDetailPage = () => {
  const [medicines, setMedicines] = useState<MedicineItem[]>([
    {
      medicine_id: 1,
      medicinename: '타이레놀',
      dosage: 2,
      number: 3,
      days: 5,
      alarms: [
        {
          id: 1,
          schedule_type: 'MORNING',
          notify_time: '08:00',
          repeated_time: 'DAILY',
        },
        {
          id: 2,
          schedule_type: 'EVENING',
          notify_time: '19:00',
          repeated_time: 'DAILY',
        },
      ],
    },
    {
      medicine_id: 2,
      medicinename: '오메가3',
      dosage: 1,
      number: 1,
      days: 30,
      alarms: [
        {
          id: 3,
          schedule_type: 'MORNING',
          notify_time: '09:00',
          repeated_time: 'DAILY',
        },
      ],
    },
  ]);

  const [selected, setSelected] = useState<number[]>([]);
  const [editMode, setEditMode] = useState(false);

  const toggleSelect = (id: number) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (isChecked: boolean, medicines: MedicineItem[]) => {
    setSelected(isChecked ? medicines.map((m) => Number(m.medicine_id)) : []);
  };

  const handleDeleteSelected = () => {
    setMedicines((prev) =>
      prev.filter((m) => !selected.includes(Number(m.medicine_id)))
    );
    setSelected([]);
  };

  const handleToggleEdit = () => setEditMode(true);
  const handleSaveEdit = () => {
    setEditMode(false);
    // TODO: 저장 API
  };

  const handleChangeField = (
    id: number,
    field: string,
    value: number | string
  ) => {
    setMedicines((prev) =>
      prev.map((m) => (m.medicine_id === id ? { ...m, [field]: value } : m))
    );
  };

  const handleChangeAlarm = (
    medicineId: number,
    alarmId: number,
    newTime: string,
    newType: 'MORNING' | 'LUNCH' | 'EVENING'
  ) => {
    setMedicines((prev) =>
      prev.map((m) =>
        m.medicine_id === medicineId
          ? {
              ...m,
              alarms: m.alarms?.map((a) =>
                a.id === alarmId
                  ? { ...a, notify_time: newTime, schedule_type: newType }
                  : a
              ),
            }
          : m
      )
    );
  };

  const handleDeleteAlarm = (medicineId: number, alarmId: number) => {
    setMedicines((prev) =>
      prev.map((m) =>
        m.medicine_id === medicineId
          ? {
              ...m,
              alarms: m.alarms?.filter((a) => a.id !== alarmId),
            }
          : m
      )
    );
  };

  const handleAddAlarm = (medicineId: number) => {
    setMedicines((prev) => {
      const maxId =
        prev
          .flatMap((m) => m.alarms ?? [])
          .reduce<number>(
            (max, a) => (Number(a.id) > max ? Number(a.id) : max),
            0
          ) || 0;

      const newAlarm = {
        id: maxId + 1,
        schedule_type: 'MORNING' as const,
        notify_time: '08:00',
        repeated_time: 'DAILY' as const,
      };

      return prev.map((m) =>
        m.medicine_id === medicineId
          ? { ...m, alarms: [...(m.alarms ?? []), newAlarm] }
          : m
      );
    });
  };

  const handleAddMedicine = () => {
    setMedicines((prev) => [
      ...prev,
      {
        medicine_id: Date.now(), // 새로운 id
        medicinename: '약품명', // 빈 이름
        dosage: 0,
        number: 0,
        days: 0,
        alarms: [], // 알람 비어있음
      },
    ]);
  };

  const handleDeleteMedicine = (medicineId: number) => {
    setMedicines((prev) =>
      prev.filter((m) => Number(m.medicine_id) !== medicineId)
    );
    setSelected((prev) => prev.filter((id) => id !== medicineId));
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
