import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface ReportLoadingProps {
  isLoading: boolean;
}

const ReportLoading = ({ isLoading }: ReportLoadingProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const dotsRef = useRef<HTMLSpanElement[]>([]);

  useEffect(() => {
    if (!isLoading) return;

    const container = containerRef.current;
    const logo = logoRef.current;
    const text = textRef.current;
    const dots = dotsRef.current;

    if (!container || !logo || !text) return;

    // 초기 상태 설정
    gsap.set(container, { opacity: 0 });
    gsap.set(logo, { scale: 0.8, opacity: 0 });
    gsap.set(text, { opacity: 0, y: 10 });
    dots.forEach((dot) => {
      if (dot) gsap.set(dot, { opacity: 0, scale: 0.5 });
    });

    // 컨테이너 페이드 인
    gsap.to(container, {
      opacity: 1,
      duration: 0.4,
      ease: 'power2.out',
    });

    // 로고 등장 애니메이션
    gsap.to(logo, {
      scale: 1,
      opacity: 1,
      duration: 0.6,
      ease: 'power2.out',
    });

    // 로고 부드러운 펄스 애니메이션
    gsap.to(logo, {
      scale: 1.05,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
    });

    // 텍스트 페이드 인
    gsap.to(text, {
      opacity: 1,
      y: 0,
      duration: 0.5,
      delay: 0.3,
      ease: 'power2.out',
    });

    // 점들 순차 펄스 애니메이션
    dots.forEach((dot, index) => {
      if (!dot) return;
      gsap.to(dot, {
        opacity: 1,
        scale: 1,
        duration: 0.3,
        delay: 0.5 + index * 0.15,
        ease: 'power2.out',
      });

      // 점들 순차 펄스
      gsap.to(dot, {
        opacity: 0.4,
        scale: 0.8,
        duration: 0.8,
        delay: 0.8 + index * 0.2,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });
    });

    return () => {
      gsap.killTweensOf([container, logo, text, ...dots]);
    };
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm"
    >
      <div className="flex flex-col items-center gap-6">
        {/* 로고 */}
        <img
          ref={logoRef}
          src="/logo.svg"
          alt="하루온"
          className="w-20 h-20"
        />

        {/* 텍스트 */}
        <div ref={textRef} className="flex flex-col items-center gap-2">
          <p className="text-lg font-semibold text-black">AI 리포트 분석 중</p>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((index) => (
              <span
                key={index}
                ref={(el) => {
                  if (el) dotsRef.current[index] = el;
                }}
                className="w-2 h-2 bg-primary rounded-full"
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportLoading;

