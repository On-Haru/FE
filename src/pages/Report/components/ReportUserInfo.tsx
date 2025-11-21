interface ReportUserInfoProps {
  name: string;
  birthYear: number;
}

const ReportUserInfo = ({ name, birthYear }: ReportUserInfoProps) => {
  return (
    <div className="mb-4">
      <p className="text-base text-gray-700">
        {name} 님 출생: {birthYear}년
      </p>
    </div>
  );
};

export default ReportUserInfo;

