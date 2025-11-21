interface ConnectionCodeScreenProps {
  connectionCode: string;
}

const ConnectionCodeScreen = ({
  connectionCode,
}: ConnectionCodeScreenProps) => {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-8">
      <div className="text-center mb-8">
        <p className="text-lg text-gray-700 mb-4">보호자와 코드를 연결하세요</p>
        <div
          className="rounded-2xl px-8 py-12 mb-4"
          style={{ backgroundColor: 'var(--color-morning-secondary)' }}
        >
          <p className="text-6xl font-bold text-black">{connectionCode}</p>
        </div>
      </div>
    </div>
  );
};

export default ConnectionCodeScreen;
