import jsPDF from 'jspdf';
import type { ReportData } from '@/types/report';

/**
 * 한글 폰트 추가 (AppleSDGothicNeo)
 * 로컬 폰트 파일을 로드하여 사용
 */
const addKoreanFont = async (pdf: jsPDF): Promise<void> => {
    try {
        // 로컬 폰트 파일 로드
        const fontUrl = '/fonts/AppleSDGothicNeoR.ttf';

        console.log('폰트 로드 시작:', fontUrl);
        const response = await fetch(fontUrl);
        if (!response.ok) {
            throw new Error(`폰트 로드 실패: ${response.status} ${response.statusText}`);
        }

        const fontArrayBuffer = await response.arrayBuffer();
        console.log('폰트 파일 크기:', fontArrayBuffer.byteLength, 'bytes');

        // 큰 파일을 위한 안전한 base64 인코딩
        const bytes = new Uint8Array(fontArrayBuffer);
        let binary = '';
        const chunkSize = 8192; // 8KB씩 처리
        for (let i = 0; i < bytes.length; i += chunkSize) {
            const chunk = bytes.subarray(i, i + chunkSize);
            binary += String.fromCharCode.apply(null, Array.from(chunk));
        }
        const fontBase64 = btoa(binary);

        console.log('폰트 base64 인코딩 완료, 길이:', fontBase64.length);

        // VFS에 폰트 추가
        pdf.addFileToVFS('AppleSDGothicNeoR.ttf', fontBase64);

        // 폰트 등록 (normal만 등록, bold는 normal과 동일하게 사용)
        pdf.addFont('AppleSDGothicNeoR.ttf', 'AppleSDGothicNeo', 'normal');

        // 폰트 등록 확인
        const fonts = (pdf as any).getFontList();
        console.log('등록된 폰트 목록:', fonts);
        console.log('폰트 등록 완료: AppleSDGothicNeo');
    } catch (error) {
        console.error('한글 폰트 로드 실패:', error);
        throw error; // 에러를 다시 throw하여 호출자가 처리할 수 있도록
    }
};

/**
 * 리포트 데이터를 PDF로 변환하여 다운로드 (데이터 기반 직접 생성)
 */
export const generateReportPDF = async (
    reportData: ReportData
): Promise<void> => {
    try {
        // PDF 생성 (A4 크기, 세로 방향)
        const pdf = new jsPDF('p', 'mm', 'a4');

        // 한글 폰트 추가
        try {
            await addKoreanFont(pdf);
        } catch (fontError) {
            console.error('폰트 로드 실패, 기본 폰트 사용:', fontError);
            // 폰트 로드 실패 시에도 계속 진행 (한글이 깨질 수 있음)
        }
        const pageWidth = 210; // A4 너비 (mm)
        const pageHeight = 297; // A4 높이 (mm)
        const margin = 20;
        let yPosition = margin;

        const userName = reportData.reportMeta.userName || '사용자';
        const dateRange = reportData.reportMeta.dateRange || '';
        const { aiAnalysis, statistics, chartData } = reportData;

        // 헤더 배경 박스
        pdf.setFillColor(54, 200, 183); // Primary 색상
        pdf.rect(margin, yPosition - 5, pageWidth - margin * 2, 25, 'F');

        // 제목 (흰색)
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(20);
        pdf.setFont('AppleSDGothicNeo', 'normal');
        pdf.text(`${userName}님 복약 리포트`, margin + 5, yPosition + 8);

        pdf.setFontSize(11);
        pdf.text(dateRange, margin + 5, yPosition + 15);
        yPosition += 30;

        // 텍스트 색상 원래대로
        pdf.setTextColor(0, 0, 0);

        // AI 한줄 요약
        if (aiAnalysis.summary) {
            // 섹션 제목 박스
            pdf.setFillColor(245, 245, 245);
            pdf.rect(margin, yPosition - 3, pageWidth - margin * 2, 8, 'F');

            pdf.setFontSize(14);
            pdf.setFont('AppleSDGothicNeo', 'normal');
            pdf.setTextColor(54, 200, 183); // Primary 색상
            pdf.text('🤖 AI 한줄 요약', margin + 3, yPosition + 5);
            yPosition += 10;

            // 요약 내용 박스
            pdf.setFillColor(255, 255, 255);
            pdf.setDrawColor(230, 230, 230);
            pdf.rect(margin, yPosition, pageWidth - margin * 2, 0, 'FD'); // 테두리만

            pdf.setFontSize(11);
            pdf.setFont('AppleSDGothicNeo', 'normal');
            pdf.setTextColor(0, 0, 0);
            const summaryLines = pdf.splitTextToSize(aiAnalysis.summary, pageWidth - margin * 2 - 10);
            pdf.text(summaryLines, margin + 5, yPosition + 7);
            yPosition += summaryLines.length * 6 + 15;
        }

        // 페이지 넘김 체크
        if (yPosition > pageHeight - 40) {
            pdf.addPage();
            yPosition = margin;
        }

        // 전체 복약 통계
        pdf.setFillColor(245, 245, 245);
        pdf.rect(margin, yPosition - 3, pageWidth - margin * 2, 8, 'F');

        pdf.setFontSize(14);
        pdf.setFont('AppleSDGothicNeo', 'normal');
        pdf.setTextColor(54, 200, 183);
        pdf.text('📊 전체 복약 통계', margin + 3, yPosition + 5);
        yPosition += 12;

        // 통계 박스들
        const statBoxWidth = (pageWidth - margin * 2 - 10) / 3;
        const statBoxHeight = 20;
        let statX = margin;

        // 전체 복약률 박스
        pdf.setFillColor(54, 200, 183);
        pdf.rect(statX, yPosition, statBoxWidth, statBoxHeight, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(10);
        pdf.text('전체 복약률', statX + 5, yPosition + 7);
        pdf.setFontSize(16);
        pdf.text(`${statistics.overallRate}%`, statX + 5, yPosition + 15);
        statX += statBoxWidth + 5;

        // 평균 지연 시간 박스
        if (statistics.averageDelayMinutes !== null) {
            pdf.setFillColor(255, 144, 144); // Secondary 색상
            pdf.rect(statX, yPosition, statBoxWidth, statBoxHeight, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(10);
            pdf.text('평균 지연', statX + 5, yPosition + 7);
            pdf.setFontSize(16);
            pdf.text(`${statistics.averageDelayMinutes}분`, statX + 5, yPosition + 15);
            statX += statBoxWidth + 5;
        }

        // 미복용 알림 박스
        if (statistics.missedCount !== null) {
            pdf.setFillColor(255, 193, 7); // 경고 색상
            pdf.rect(statX, yPosition, statBoxWidth, statBoxHeight, 'F');
            pdf.setTextColor(255, 255, 255);
            pdf.setFontSize(10);
            pdf.text('미복용 알림', statX + 5, yPosition + 7);
            pdf.setFontSize(16);
            pdf.text(`${statistics.missedCount}건`, statX + 5, yPosition + 15);
        }

        pdf.setTextColor(0, 0, 0);
        yPosition += statBoxHeight + 15;

        // 페이지 넘김 체크
        if (yPosition > pageHeight - 40) {
            pdf.addPage();
            yPosition = margin;
        }

        // 시간대별 복약 패턴
        if (chartData.timePattern && chartData.timePattern.length > 0) {
            pdf.setFillColor(245, 245, 245);
            pdf.rect(margin, yPosition - 3, pageWidth - margin * 2, 8, 'F');

            pdf.setFontSize(14);
            pdf.setFont('AppleSDGothicNeo', 'normal');
            pdf.setTextColor(54, 200, 183);
            pdf.text('⏰ 시간대별 복약 패턴', margin + 3, yPosition + 5);
            yPosition += 12;

            pdf.setFontSize(11);
            pdf.setFont('AppleSDGothicNeo', 'normal');
            pdf.setTextColor(0, 0, 0);

            chartData.timePattern.forEach((pattern, index) => {
                if (yPosition > pageHeight - 50) {
                    pdf.addPage();
                    yPosition = margin;
                }

                // 패턴 박스
                const boxHeight = 15;
                const bgColor = index % 2 === 0 ? [255, 255, 255] : [250, 250, 250];
                pdf.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
                pdf.setDrawColor(230, 230, 230);
                pdf.rect(margin, yPosition, pageWidth - margin * 2, boxHeight, 'FD');

                pdf.text(pattern.label, margin + 5, yPosition + 10);

                // 진행 바
                const barWidth = 100;
                const barHeight = 6;
                const barX = pageWidth - margin - barWidth - 20;
                pdf.setFillColor(230, 230, 230);
                pdf.rect(barX, yPosition + 4, barWidth, barHeight, 'F');
                pdf.setFillColor(54, 200, 183);
                const progressWidth = (barWidth * pattern.rate) / 100;
                pdf.rect(barX, yPosition + 4, progressWidth, barHeight, 'F');

                pdf.text(`${pattern.rate}%`, pageWidth - margin - 10, yPosition + 10, { align: 'right' });
                yPosition += boxHeight + 3;
            });
            yPosition += 10;
        }

        // 페이지 넘김 체크
        if (yPosition > pageHeight - 40) {
            pdf.addPage();
            yPosition = margin;
        }

        // 약별 복용 패턴
        if (chartData.medicinePattern && chartData.medicinePattern.length > 0) {
            pdf.setFillColor(245, 245, 245);
            pdf.rect(margin, yPosition - 3, pageWidth - margin * 2, 8, 'F');

            pdf.setFontSize(14);
            pdf.setFont('AppleSDGothicNeo', 'normal');
            pdf.setTextColor(54, 200, 183);
            pdf.text('💊 약별 복용 패턴', margin + 3, yPosition + 5);
            yPosition += 12;

            pdf.setFontSize(11);
            pdf.setFont('AppleSDGothicNeo', 'normal');
            pdf.setTextColor(0, 0, 0);

            chartData.medicinePattern.forEach((medicine) => {
                if (yPosition > pageHeight - 60) {
                    pdf.addPage();
                    yPosition = margin;
                }

                // 약 카드 박스
                const cardHeight = medicine.aiComment ? 35 : 20;
                pdf.setFillColor(255, 255, 255);
                pdf.setDrawColor(230, 230, 230);
                pdf.rect(margin, yPosition, pageWidth - margin * 2, cardHeight, 'FD');

                // 약 이름과 복용률
                pdf.setFontSize(12);
                pdf.text(medicine.medicineName, margin + 5, yPosition + 8);

                // 복용률 박스
                const rateBoxWidth = 50;
                const rateBoxHeight = 12;
                pdf.setFillColor(54, 200, 183);
                pdf.rect(pageWidth - margin - rateBoxWidth - 5, yPosition + 2, rateBoxWidth, rateBoxHeight, 'F');
                pdf.setTextColor(255, 255, 255);
                pdf.setFontSize(10);
                pdf.text(`${medicine.rate}%`, pageWidth - margin - 10, yPosition + 10, { align: 'right' });
                pdf.setTextColor(0, 0, 0);

                yPosition += 15;

                // AI 분석 코멘트
                if (medicine.aiComment) {
                    pdf.setFontSize(9);
                    pdf.setTextColor(100, 100, 100);
                    const commentLines = pdf.splitTextToSize(`💡 ${medicine.aiComment}`, pageWidth - margin * 2 - 10);
                    pdf.text(commentLines, margin + 10, yPosition + 5);
                    yPosition += commentLines.length * 5;
                    pdf.setTextColor(0, 0, 0);
                }

                yPosition += 8;
            });
            yPosition += 10;
        }

        // 페이지 넘김 체크
        if (yPosition > pageHeight - 40) {
            pdf.addPage();
            yPosition = margin;
        }

        // 복약 지연 통계
        if (chartData.delayStatistics) {
            pdf.setFillColor(245, 245, 245);
            pdf.rect(margin, yPosition - 3, pageWidth - margin * 2, 8, 'F');

            pdf.setFontSize(14);
            pdf.setFont('AppleSDGothicNeo', 'normal');
            pdf.setTextColor(54, 200, 183);
            pdf.text('⚠️ 복약 지연 통계', margin + 3, yPosition + 5);
            yPosition += 12;

            pdf.setFontSize(11);
            pdf.setFont('AppleSDGothicNeo', 'normal');
            pdf.setTextColor(0, 0, 0);

            // 5분 이내 박스
            const boxHeight = 18;
            pdf.setFillColor(76, 175, 80); // 초록색
            pdf.setDrawColor(230, 230, 230);
            pdf.rect(margin, yPosition, pageWidth - margin * 2, boxHeight, 'FD');
            pdf.setFillColor(255, 255, 255);
            pdf.rect(margin + 2, yPosition + 2, pageWidth - margin * 2 - 4, boxHeight - 4, 'F');

            pdf.text('알림 후 5분 이내 복용', margin + 5, yPosition + 10);
            pdf.setFontSize(14);
            pdf.setTextColor(76, 175, 80);
            pdf.text(`${chartData.delayStatistics.withinFiveMinutesRate}%`, pageWidth - margin - 10, yPosition + 10, { align: 'right' });
            yPosition += boxHeight + 5;

            // 30분 이상 박스
            pdf.setFillColor(244, 67, 54); // 빨간색
            pdf.setDrawColor(230, 230, 230);
            pdf.rect(margin, yPosition, pageWidth - margin * 2, boxHeight, 'FD');
            pdf.setFillColor(255, 255, 255);
            pdf.rect(margin + 2, yPosition + 2, pageWidth - margin * 2 - 4, boxHeight - 4, 'F');

            pdf.setFontSize(11);
            pdf.setTextColor(0, 0, 0);
            pdf.text('알림 후 30분 이상 지연 복용', margin + 5, yPosition + 10);
            pdf.setFontSize(14);
            pdf.setTextColor(244, 67, 54);
            pdf.text(`${chartData.delayStatistics.overThirtyMinutesRate}%`, pageWidth - margin - 10, yPosition + 10, { align: 'right' });
        }

        // 파일명 생성
        const fileName = `${userName}_복약리포트_${dateRange.replace(/\s/g, '_')}.pdf`;

        // PDF 다운로드
        pdf.save(fileName);
    } catch (error) {
        console.error('PDF 생성 실패:', error);
        throw new Error('PDF 생성 중 오류가 발생했습니다.');
    }
};


