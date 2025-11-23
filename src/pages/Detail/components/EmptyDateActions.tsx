import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Pill } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

interface EmptyDateActionsProps {
    date: Date;
    isDateClicked: boolean;
    userId: number;
}

const EmptyDateActions = ({ 
    date, 
    isDateClicked, 
    userId,
}: EmptyDateActionsProps) => {
    const navigate = useNavigate();
    const dayLabel = `${format(date, 'd')}일`;

    const handleRegisterPrescription = () => {
        // 선택된 어르신 ID를 localStorage에 저장
        localStorage.setItem('selectedSeniorId', userId.toString());
        navigate(ROUTES.MEDICINE_REGISTER);
    };

    return (
        <div className="mt-4 px-4">
            {isDateClicked && (
                <h3 className="text-base font-semibold mb-4 text-primary">{dayLabel}</h3>
            )}
            <div className="space-y-3">
                <p className="text-gray-600 mb-4 text-center">
                    {isDateClicked
                        ? '이 날짜에는 체크리스트가 없습니다.'
                        : (
                            <>
                                날짜를 클릭하여 어르신께 알림을 보내거나<br />
                                복약 여부를 확인할 수 있습니다.
                            </>
                        )
                    }
                </p>
                
                {/* 액션 버튼들 - 날짜를 클릭했을 때만 표시 */}
                {isDateClicked && (
                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleRegisterPrescription}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors cursor-pointer"
                        >
                            <Pill className="w-5 h-5" />
                            처방전 등록하기
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmptyDateActions;

