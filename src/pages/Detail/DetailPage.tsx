import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import DetailPageHeader from './components/DetailPageHeader';

interface Elder {
    id: string;
    name: string;
}

const DetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const [currentElder, setCurrentElder] = useState<Elder | null>(null);
    const [elders, setElders] = useState<Elder[]>([]);

    // TODO: API에서 어르신 목록 가져오기
    useEffect(() => {
        // 임시 데이터 (나중에 API로 교체)
        const mockElders: Elder[] = [
            { id: '1', name: '김노인' },
            { id: '2', name: '이노인' },
            { id: '3', name: '박노인' },
        ];
        setElders(mockElders);

        // 현재 선택된 어르신 찾기
        const elder = mockElders.find((e) => e.id === id) || mockElders[0];
        setCurrentElder(elder);
    }, [id]);

    const handleElderChange = (elderId: string) => {
        const elder = elders.find((e) => e.id === elderId);
        if (elder) {
            setCurrentElder(elder);
        }
    };

    if (!currentElder) {
        return <div>Loading...</div>;
    }

    return (
        <div className="flex flex-col min-h-full" >
            <DetailPageHeader
                currentElder={currentElder}
                elders={elders}
                onElderChange={handleElderChange}
            />
            <div className="flex-1">
                <h1>Detail</h1>
                <p>노인 ID: {id}</p>
            </div>
        </div>
    );
};

export default DetailPage;