
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface AnalysisResult {
  timePeriodInDays?: number;
  analysis?: {
    topMerchant?: {
      name: string;
      transactionCount: number;
      totalSpending: number;
      aiSummary: string;
    };
    spendingVisualData?: {
      title: string;
      data: { name: string; count: number }[];
    };
  };
}

const FileAnalysisReport: React.FC<{ result: AnalysisResult }> = ({ result }) => {
  if (!result || !result.analysis) return (
    <Card>
      <CardHeader>
        <CardTitle>Analysis In Progress</CardTitle>
        <CardDescription>
          We are processing your statement. If this takes too long, the format might be unsupported.
        </CardDescription>
      </CardHeader>
    </Card>
  );

  const { timePeriodInDays, analysis } = result;
  const { topMerchant, spendingVisualData } = analysis;

  return (
    <div className="space-y-6 animate-fade-in mt-6">
      <Card>
        <CardHeader>
          <CardTitle>Your Statement Analysis</CardTitle>
          {timePeriodInDays && (
            <CardDescription>
              We've analyzed {timePeriodInDays} days of your transactions. Here's what we found.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {topMerchant && (
            <div>
              <h4 className="font-semibold text-lg mb-2">Top Spending Spot: {topMerchant.name}</h4>
              <p className="text-sm text-muted-foreground">
                You made <span className="font-bold text-primary">{topMerchant.transactionCount}</span> transactions, spending a total of <span className="font-bold text-primary">${topMerchant.totalSpending.toFixed(2)}</span>.
              </p>
              <div className="mt-2 p-3 bg-blue-50 border-l-4 border-blue-400 text-blue-800 rounded-r-lg">
                <p className="text-sm">{topMerchant.aiSummary}</p>
              </div>
            </div>
          )}
          
          {spendingVisualData && (
            <div>
              <h4 className="font-semibold text-lg mb-2">{spendingVisualData.title}</h4>
              <div className="w-full h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={spendingVisualData.data} margin={{ top: 5, right: 20, left: -10, bottom: 55 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={50} interval={0} />
                          <YAxis allowDecimals={false} />
                          <Tooltip cursor={{fill: 'rgba(239, 246, 255, 0.5)'}} />
                          <Bar dataKey="count" fill="#3b82f6" name="Transactions" />
                      </BarChart>
                  </ResponsiveContainer>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FileAnalysisReport;
