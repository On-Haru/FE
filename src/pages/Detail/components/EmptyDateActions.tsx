import { format } from 'date-fns';

interface EmptyDateActionsProps {
    date: Date;
    elderName: string;
    isDateClicked: boolean;
}

const EmptyDateActions = ({ date }: EmptyDateActionsProps) => {
    const dayLabel = `${format(date, 'd')}일`;

    return (
        <div className="mt-4 px-4">
            <h3 className="text-base font-semibold mb-4 text-primary">{dayLabel}</h3>
            <div className="space-y-3">
                <p className="text-sm text-gray-600 mb-4">
                    이 날짜에는 체크리스트가 없습니다. <br />다른 날짜를 클릭하여 어르신께 알림을 보내거나 복약 여부를 확인할 수 있습니다.
                </p>
            </div>
        </div>
    );
};

export default EmptyDateActions;

