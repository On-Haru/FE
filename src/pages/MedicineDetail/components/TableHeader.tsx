interface TableHeaderProps {
  editMode?: boolean;
}

const TableHeader = ({ editMode = false }: TableHeaderProps) => {
  return (
    <div className="w-full">
      <div className="flex items-center px-2 py-3 text-base font-semibold text-gray-500 gap-3">
        
        {/* 약품명 */}
        <span className={editMode ? "flex-[2.2]" : "flex-[3]"}>약품명</span>

        {/* 투약량 / 횟수 / 일수 */}
        <div className="flex flex-[2.3] text-center gap-2">
          <span className="flex-1">투약량</span>
          <span className="flex-1">횟수</span>
          <span className="flex-1">일수</span>
        </div>

        {/* 삭제 버튼 자리 */}
        {editMode && <div className="min-w-[2.5rem]"></div>}
      </div>

      <div className="w-full h-px bg-gray-200 mt-1" />
    </div>
  );
};

export default TableHeader;
