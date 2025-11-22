import { useRef } from 'react';
import { gsap } from 'gsap';
import type { MedicinePattern } from '@/types/report';

interface ReportMedicinePatternProps {
    medicinePattern: MedicinePattern[];
    averageDelayMinutes?: number | null;
}

const ReportMedicinePattern = ({
    medicinePattern,
    averageDelayMinutes,
}: ReportMedicinePatternProps) => {
    const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

    const handleMouseEnter = (index: number) => {
        const card = cardRefs.current[index];
        if (card) {
            gsap.to(card, {
                scale: 1.01,
                y: -2,
                duration: 0.2,
                ease: 'power2.out',
            });
        }
    };

    const handleMouseLeave = (index: number) => {
        const card = cardRefs.current[index];
        if (card) {
            gsap.to(card, {
                scale: 1,
                y: 0,
                duration: 0.2,
                ease: 'power2.out',
            });
        }
    };

    return (
        <div>
            <div className="space-y-3">
                {medicinePattern.map((medicine, index) => (
                    <div
                        key={index}
                        ref={(el) => {
                            cardRefs.current[index] = el;
                        }}
                        onMouseEnter={() => handleMouseEnter(index)}
                        onMouseLeave={() => handleMouseLeave(index)}
                        className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm cursor-pointer transition-shadow hover:shadow-md"
                    >
                        <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                                <h3 className="text-base font-bold text-black mb-1">
                                    {medicine.medicineName}
                                </h3>
                                <p className="text-sm text-gray-500 font-semibold mb-2">
                                    복약률 {medicine.rate}%
                                    {averageDelayMinutes !== null && (
                                        <> · 평균 지연 {averageDelayMinutes}분</>
                                    )}
                                </p>
                            </div>
                            <p className="text-xs text-gray-500">최근 1달 기준</p>
                        </div>
                        {medicine.aiComment && (
                            <div className="mt-2 flex items-start gap-2">
                                <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-primary/30 text-primary flex-shrink-0">
                                    AI 분석
                                </span>
                                <p className="text-sm text-primary leading-relaxed flex-1">
                                    {medicine.aiComment}
                                </p>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReportMedicinePattern;

