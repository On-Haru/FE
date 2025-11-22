interface ReportAISummaryProps {
    summary: string;
}

const ReportAISummary = ({ summary }: ReportAISummaryProps) => {
    return (
        <div className="p-4 rounded-xl bg-primary/30 border border-primary">
            <h3 className="text-base font-bold text-black mb-2">AI 한줄 요약</h3>
            <p className="text-sm text-gray-500 leading-relaxed">{summary}</p>
        </div>
    );
};

export default ReportAISummary;

