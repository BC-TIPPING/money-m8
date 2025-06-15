
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import DebtReductionChart from "./DebtReductionChart";
import InterestSavedChart from "./InterestSavedChart";

interface ResultsDisplayProps {
  summary: string;
  chartData?: {
    debtReductionData?: any[];
    interestSavedData?: any[];
  }
}

const ResultsDisplay: React.FC<ResultsDisplayProps> = ({ summary, chartData }) => {
  if (!summary) return null;

  const showCharts = chartData && (chartData.debtReductionData || chartData.interestSavedData);

  return (
    <div className="space-y-8">
      <Card className="bg-white/80 backdrop-blur-sm animate-fade-in">
        <CardHeader>
          <CardTitle>Your Personalised Financial Summary ✨</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-lg max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{summary}</ReactMarkdown>
        </CardContent>
      </Card>

      {showCharts && (
        <div className="space-y-8 animate-fade-in">
          {chartData.debtReductionData && chartData.debtReductionData.length > 0 && (
            <DebtReductionChart data={chartData.debtReductionData} />
          )}
          {chartData.interestSavedData && chartData.interestSavedData.length > 0 && (
            <InterestSavedChart data={chartData.interestSavedData} />
          )}
        </div>
      )}
    </div>
  );
};

export default ResultsDisplay;
