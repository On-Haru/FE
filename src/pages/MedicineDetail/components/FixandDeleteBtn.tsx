interface FixandDeleteBtnProps {
  onDelete: () => void;
  editMode: boolean;
  onToggleEdit: () => void;
  onSave: () => void;
}

const FixandDeleteBtn = ({ onDelete, editMode, onToggleEdit, onSave }: FixandDeleteBtnProps) => {
  return (
    <div className="w-full px-4 py-4 flex justify-end">
      <div className="flex gap-2">
        <button className="px-6 h-12 rounded-lg border border-primary text-primary font-semibold" onClick={onDelete}>
          {editMode ? "취소하기" : "선택삭제"}
        </button>

        <button className="px-6 h-12 rounded-lg bg-primary text-white font-semibold" onClick={editMode ? onSave : onToggleEdit}>
          {editMode ? "저장하기" : "수정하기"}
        </button>
      </div>
    </div>
  );
};

export default FixandDeleteBtn;
