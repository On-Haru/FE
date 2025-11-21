interface MedicineAddButtonProps {
  onClick?: () => void;
}

const MedicineAddButton = ({ onClick }: MedicineAddButtonProps) => {
  return (
    <div onClick={onClick} className="cursor-pointer">
      <div className="flex flex-col items-center justify-center mt-4 w-full h-12 border border-primary bg-primary rounded-xl cursor-pointer">
        <span className="text-white text-lg font-medium">
          약 목록 확인하기
        </span>
      </div>
    </div>
  );
};

export default MedicineAddButton;
