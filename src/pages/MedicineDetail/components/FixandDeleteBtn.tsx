interface FixandDeleteBtnProps {
  editMode: boolean;
  onToggleEdit: () => void;
  onSave: () => void;
}

const FixandDeleteBtn = ({ editMode, onToggleEdit, onSave }: FixandDeleteBtnProps) => {
  return (
    <div className="w-full px-4 py-4 flex justify-end">
      <div className="flex gap-2">
        {editMode ? (
          <>
            <button 
              className="px-6 h-12 rounded-xl border border-primary text-primary font-semibold" 
              onClick={onToggleEdit}
            >
              취소하기
            </button>
            <button 
              className="px-6 h-12 rounded-xl bg-primary text-white font-semibold" 
              onClick={onSave}
            >
              저장하기
            </button>
          </>
        ) : (
          <button 
            className="px-6 h-12 rounded-xl bg-primary text-white font-semibold" 
            onClick={onToggleEdit}
          >
            수정하기
          </button>
        )}
      </div>
    </div>
  );
};

export default FixandDeleteBtn;
