interface GreetingCardProps {
  userName: string;
}

const GreetingCard = ({ userName }: GreetingCardProps) => {
  return (
    <div className="px-4 mb-4">
      <div className="rounded-xl px-6 py-4 bg-gray-200">
        <p className="text-2xl font-medium text-black">
          안녕하세요, {userName}님!
        </p>
      </div>
    </div>
  );
};

export default GreetingCard;
