interface GreetingCardProps {
  userName: string;
}

const GreetingCard = ({ userName }: GreetingCardProps) => {
  return (
    <div className="px-4 mb-4">
      <div className="rounded-2xl px-6 py-4 bg-morning-secondary">
        <p className="text-lg font-medium text-white">
          안녕하세요, {userName}님!
        </p>
      </div>
    </div>
  );
};

export default GreetingCard;
