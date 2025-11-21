interface ViewPrescriptionButtonProps {
  onClick: () => void;
}

const ViewPrescriptionButton = ({ onClick }: ViewPrescriptionButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center justify-center mt-2 w-full h-12 border border-primary bg-white rounded-xl cursor-pointer"
    >
      <span className="text-primary text-lg font-medium">
        이전 처방전 확인하기
      </span>
    </button>
  );
};

export default ViewPrescriptionButton;
