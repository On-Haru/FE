interface TableHeaderProps {
  editMode?: boolean;
}

const TableHeader = ({ editMode = false }: TableHeaderProps) => {
  return (
    <div className="w-full">
      <div className="flex items-center px-2 py-3 text-base font-semibold text-gray-500 gap-3">
        <span className="flex-[3] min-w-0">약품명</span>

        <div className="flex flex-[2] justify-between text-center">
          <span className="w-1/3">투약량</span>
          <span className="w-1/3">횟수</span>
          <span className="w-1/3">일수</span>
        </div>

        {/* 삭제 버튼 자리 - editMode일 때만 공간 확보 */}
        {editMode && <div className="w-8"></div>}
      </div>

      <div className="w-full h-px bg-gray-200 mt-1" />
    </div>
  );
};

export default TableHeader;
