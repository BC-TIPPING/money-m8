
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Brain } from 'lucide-react';

interface AISummarySectionProps {
  aiSummary: string | null;
  generateSummary: () => void;
  isGeneratingSummary: boolean;
  chartData: any;
}

const AISummarySection: React.FC<AISummarySectionProps> = ({
  aiSummary,
  generateSummary,
  isGeneratingSummary,
  chartData
}) => {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Financial Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        {aiSummary ? (
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-gray-700">{aiSummary}</div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">
              Get a personalized AI analysis of your financial situation
            </p>
            <Button 
              onClick={generateSummary}
              disabled={isGeneratingSummary}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isGeneratingSummary ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Analysis...
                </>
              ) : (
                'Generate AI Analysis'
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AISummarySection;
