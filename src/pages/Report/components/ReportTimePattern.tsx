import TimeTag from '@/components/TimeTag';
import type { TimePattern } from '@/types/report';

interface ReportTimePatternProps {
    timePattern: TimePattern[];
}

const ReportTimePattern = ({ timePattern }: ReportTimePatternProps) => {
    return (
        <div>
            <div className="space-y-4">
                {timePattern.map((item) => {
                    return (
                        <div key={item.label} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <TimeTag label={item.label as '아침' | '점심' | '저녁'} />
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

