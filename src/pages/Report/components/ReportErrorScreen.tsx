import { AlertCircle, RefreshCw, Home, WifiOff, ServerCrash, UserX, FileQuestion } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ReportErrorScreenProps {
    error: string;
    errorCode?: string | null;
    statusCode?: number;
    onRetry?: () => void;
}

const ReportErrorScreen = ({ error, errorCode, statusCode, onRetry }: ReportErrorScreenProps) => {
    const navigate = useNavigate();

    // 에러 타입에 따른 메시지 및 아이콘 결정
    const getErrorInfo = () => {
        if (statusCode === 401) {
            return {
                title: '로그인이 필요해요',
                message: '리포트를 보려면 다시 로그인해주세요.',
                description: '세션이 만료되었거나 인증이 필요합니다.',
                icon: <AlertCircle className="w-24 h-24 text-primary" />,
                iconColor: 'text-primary',
                showRetry: false,
                showHome: true,
                primaryAction: {
                    label: '로그인하기',
                    onClick: () => navigate('/caregiver/login'),
                },
            };
        }

        if (statusCode === 404) {
            if (errorCode === 'US001') {
                return {
                    title: '사용자를 찾을 수 없어요',
                    message: '요청하신 사용자 정보를 찾을 수 없습니다.',
                    description: '사용자 ID를 확인하거나 홈으로 돌아가서 다시 시도해주세요.',
                    icon: <UserX className="w-24 h-24 text-primary" />,
                    iconColor: 'text-primary',
                    showRetry: true,
                    showHome: true,
                };
            }
            return {
                title: '리포트를 찾을 수 없어요',
                message: '요청하신 리포트 데이터가 없습니다.',
                description: '해당 기간의 리포트가 생성되지 않았거나 삭제되었을 수 있습니다.',
                icon: <FileQuestion className="w-24 h-24 text-orange-400" />,
                iconColor: 'text-orange-400',
                showRetry: true,
                showHome: true,
            };
        }

        if (statusCode === 500 || errorCode === 'RP001') {
            return {
                title: '서버에 문제가 발생했어요',
                message: '리포트를 생성하는 중 오류가 발생했습니다.',
                description: '잠시 후 다시 시도해주세요. 문제가 계속되면 고객센터로 문의해주세요.',
                icon: <ServerCrash className="w-24 h-24 text-red-400" />,
                iconColor: 'text-red-400',
                showRetry: true,
                showHome: true,
            };
        }

        // 네트워크 에러 또는 기타 에러
        return {
            title: '연결에 문제가 있어요',
            message: '리포트를 불러올 수 없습니다.',
            description: error || '인터넷 연결을 확인하고 다시 시도해주세요.',
            icon: <WifiOff className="w-24 h-24 text-gray-400" />,
            iconColor: 'text-gray-400',
            showRetry: true,
            showHome: true,
        };
    };

    const errorInfo = getErrorInfo();

    return (
        <div className="flex flex-col items-center justify-center min-h-[500px] px-4 py-12">
            <div className="flex flex-col items-center gap-8 max-w-sm text-center">
                {/* 에러 아이콘 */}
                <div className="flex items-center justify-center p-4">
                    {errorInfo.icon}
                </div>

                {/* 에러 제목 */}
                <div className="flex flex-col gap-3">
                    <h2 className="text-2xl font-bold text-gray-900">{errorInfo.title}</h2>

                    {/* 에러 메시지 */}
                    <p className="text-lg text-gray-700 leading-relaxed">{errorInfo.message}</p>

                    {/* 추가 설명 */}
                    <p className="text-sm text-gray-500 leading-relaxed mt-2">
                        {errorInfo.description}
                    </p>
                </div>

                {/* 버튼들 */}
                <div className="flex flex-col gap-3 w-full mt-6">
                    {errorInfo.showRetry && onRetry && (
                        <button
                            onClick={onRetry}
                            className="w-full bg-primary text-white rounded-xl py-3.5 px-6 font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                        >
                            <RefreshCw className="w-5 h-5" />
                            다시 시도
                        </button>
                    )}

                    {errorInfo.primaryAction && (
                        <button
                            onClick={errorInfo.primaryAction.onClick}
                            className="w-full bg-primary text-white rounded-xl py-3.5 px-6 font-semibold hover:opacity-90 transition-opacity shadow-sm cursor-pointer"
                        >
                            {errorInfo.primaryAction.label}
                        </button>
                    )}

                    {errorInfo.showHome && (
                        <button
                            onClick={() => navigate('/home')}
                            className="w-full bg-gray-100 text-gray-700 rounded-xl py-3.5 px-6 font-semibold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <Home className="w-5 h-5" />
                            홈으로 돌아가기
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportErrorScreen;

