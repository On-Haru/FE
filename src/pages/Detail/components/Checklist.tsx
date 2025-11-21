import type { ChecklistItem } from '@/types/checklist';
import { format, parse } from 'date-fns';

interface ChecklistProps {
    date: string;
    items: ChecklistItem[];
}

const Checklist = ({ date, items }: ChecklistProps) => {
    const parsedDate = parse(date, 'yyyy-MM-dd', new Date());
    const dayLabel = `${format(parsedDate, 'd')}일`;

    return (
        <div className="mt-4">
            <h3 className="text-lg font-semibold mb-3">{dayLabel}</h3>
            <div className="space-y-3">
                {items.map((item) => (
                    <label
                        key={item.id}
                        className="flex items-center gap-3 cursor-pointer"
                    >
                        <div className="relative flex items-center justify-center">
                            <input
                                type="checkbox"
                                checked={item.checked}
                                readOnly
                                className="w-5 h-5 rounded border-2 border-gray-300 appearance-none checked:bg-primary checked:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer"
                                style={{
                                    backgroundImage: item.checked
                                        ? "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20' fill='white'%3E%3Cpath fill-rule='evenodd' d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z' clip-rule='evenodd'/%3E%3C/svg%3E\")"
                                        : 'none',
                                    backgroundSize: 'contain',
                                    backgroundRepeat: 'no-repeat',
                                    backgroundPosition: 'center',
                                }}
                            />
                        </div>
                        <span className={`text-base ${item.checked ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                            {item.label}
                        </span>
                    </label>
                ))}
            </div>
        </div>
    );
};

export default Checklist;