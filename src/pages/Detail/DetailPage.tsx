import { useParams } from 'react-router-dom';

const DetailPage = () => {
    const { id } = useParams<{ id: string }>();

    return (
        <div>
            <h1>Detail</h1>
            <p>노인 ID: {id}</p>
        </div>
    );
};

export default DetailPage;