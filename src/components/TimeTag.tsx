import { Sun, Sunrise, Moon } from 'lucide-react';

type TimeLabel = '아침' | '점심' | '저녁';

interface TimeTagProps {
    label: TimeLabel;
}

const TimeTag = ({ label }: TimeTagProps) => {
    const getTimeConfig = (label: TimeLabel) => {
        if (label === '아침') {
            return {
                icon: <Sunrise className="w-5 h-5" style={{ color: 'var(--color-morning-primary)' }} />,
                bgColor: 'var(--color-morning-secondary)',
                textColor: 'var(--color-morning-primary)',
            };
        }
        if (label === '점심') {
            return {
                icon: <Sun className="w-5 h-5" style={{ color: 'var(--color-lunch-primary)' }} />,
                bgColor: 'var(--color-lunch-secondary)',
                textColor: 'var(--color-lunch-primary)',
            };
        }
        // 저녁
        return {
            icon: <Moon className="w-5 h-5" style={{ color: 'var(--color-evening-primary)' }} />,
            bgColor: 'var(--color-evening-secondary)',
            textColor: 'var(--color-evening-primary)',
        };
    };

    const config = getTimeConfig(label);

    return (
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
                {label}
            </span>
        </div>
    );
};

export default TimeTag;
export type { TimeLabel };

