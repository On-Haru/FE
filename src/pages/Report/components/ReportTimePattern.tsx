import { Sun, Moon } from 'lucide-react';
import type { TimePattern } from '@/types/report';

interface ReportTimePatternProps {
    timePattern: TimePattern[];
}

const ReportTimePattern = ({ timePattern }: ReportTimePatternProps) => {
    const getTimeConfig = (label: string) => {
        if (label === '아침') {
            return {
                icon: <Sun className="w-5 h-5" style={{ color: '#4CAF50' }} />,
                bgColor: '#E8F5E9',
                textColor: '#4CAF50',
            };
        }
        if (label === '점심') {
            return {
                icon: <Sun className="w-5 h-5" style={{ color: '#2196F3' }} />,
                bgColor: '#E3F2FD',
                textColor: '#2196F3',
            };
        }
        // 저녁
        return {
            icon: <Moon className="w-5 h-5" style={{ color: '#FF9800' }} />,
            bgColor: '#FFF3E0',
            textColor: '#FF9800',
        };
    };

    return (
        <div>
            <div className="space-y-4">
                {timePattern.map((item) => {
                    const config = getTimeConfig(item.label);
                    return (
                        <div key={item.label} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div
                                    className="flex items-center gap-2 px-3 py-1 rounded-full"
                                    style={{
                                        backgroundColor: config.bgColor,
                                        borderColor: config.textColor,
                                    }}
                                >
                                    {config.icon}
                                    <span
                                        className="text-sm font-medium"
                                        style={{ color: config.textColor }}
                                    >
                                        {item.label}
                                    </span>
                                </div>
                                <span className="text-sm font-medium text-black">
                                    복용률 {item.rate}%
                                </span>
                            </div>
                            <div className="relative">
                                <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-300"
                                        style={{
                                            width: `${item.rate}%`,
                                            backgroundColor: '#36C8B7',
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default ReportTimePattern;

