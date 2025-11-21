interface OverlappingCirclesProps {
    filledCount: number; // 틸 색상으로 채워질 원의 개수 (0-3)
}

const OverlappingCircles = ({ filledCount }: OverlappingCirclesProps) => {
    // 32x32px 셀, 16x16px 원
    // 삼원색처럼 삼각형 패턴으로 원 세 개를 항상 겹쳐서 표시
    // 완료율에 따라 각 원의 색상만 변경 (항상 세 개 표시)
    // 세 원이 중앙에서 겹치도록 배치 (삼원색 RGB 패턴처럼)
    const positions = [
        { top: '0px', left: '8px' }, // 상단 원 (수평 중앙, 최상단)
        { top: '10px', left: '2px' }, // 하단 왼쪽 (중앙에서 약간 왼쪽, 겹치게)
        { top: '10px', left: '14px' }, // 하단 오른쪽 (중앙에서 약간 오른쪽, 겹치게)
    ];

    return (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 0 }}>
            {positions.map((pos, index) => {
                // 각 원의 색상 결정: filledCount에 따라 틸 색상 또는 회색
                const isFilled = index < filledCount;
                const color = isFilled ? 'bg-primary' : 'bg-gray-300';

                return (
                    <div
                        key={index}
                        className={`absolute ${color} opacity-80 rounded-full`}
                        style={{
                            width: '17px',
                            height: '17px',
                            top: pos.top,
                            left: pos.left,
                            zIndex: 0,
                        }}
                    />
                );
            })}
        </div>
    );
};

export default OverlappingCircles;

