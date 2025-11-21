interface ConnectionCodeScreenProps {
  connectionCode: string;
}

const ConnectionCodeScreen = ({
  connectionCode,
}: ConnectionCodeScreenProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-8">
      <div className="text-center mb-8">
        <p className="text-2xl text-gray-700 mb-6">
          보호자와 코드를 연결하세요
        </p>
        <div className="rounded-2xl px-10 py-16 mb-4">
          <p className="text-9xl font-bold text-primary">{connectionCode}</p>
        </div>
      </div>
    </div>
  );
};

export default ConnectionCodeScreen;
