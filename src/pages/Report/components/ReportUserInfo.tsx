interface ReportUserInfoProps {
  name: string;
  birthYear: number;
}

const ReportUserInfo = ({ name, birthYear }: ReportUserInfoProps) => {
  return (
    <div className="flex items-end gap-2">
      <h2 className="text-xl font-bold text-black">{name} 님</h2>
      <p className="text-sm text-black">· {birthYear}년생</p>
    </div>
  );
};

export default ReportUserInfo;

