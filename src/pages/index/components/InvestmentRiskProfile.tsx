
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface InvestmentRiskProfileProps {
  riskProfile: 'Conservative' | 'Balanced' | 'Growth';
  hasHighInterestDebt: boolean;
}

const InvestmentRiskProfile: React.FC<InvestmentRiskProfileProps> = ({ riskProfile, hasHighInterestDebt }) => {
  const portfolioAllocation = {
    Conservative: [
      { asset: 'Australian Index Funds', allocation: 40, returns: { '1yr': 8.2, '3yr': 6.1, '5yr': 7.8, '10yr': 9.1 }, risk: 3 },
      { asset: 'International Index Funds', allocation: 30, returns: { '1yr': 12.4, '3yr': 8.9, '5yr': 10.2, '10yr': 11.8 }, risk: 4 },
      { asset: 'Australian Bonds', allocation: 20, returns: { '1yr': 2.1, '3yr': 1.8, '5yr': 2.9, '10yr': 4.2 }, risk: 2 },
      { asset: 'Cash/Term Deposits', allocation: 10, returns: { '1yr': 4.5, '3yr': 2.8, '5yr': 2.1, '10yr': 2.9 }, risk: 1 },
    ],
    Balanced: [
      { asset: 'International Index Funds', allocation: 45, returns: { '1yr': 12.4, '3yr': 8.9, '5yr': 10.2, '10yr': 11.8 }, risk: 4 },
      { asset: 'Australian Index Funds', allocation: 35, returns: { '1yr': 8.2, '3yr': 6.1, '5yr': 7.8, '10yr': 9.1 }, risk: 3 },
      { asset: 'Australian Bonds', allocation: 15, returns: { '1yr': 2.1, '3yr': 1.8, '5yr': 2.9, '10yr': 4.2 }, risk: 2 },
      { asset: 'Cash/Term Deposits', allocation: 5, returns: { '1yr': 4.5, '3yr': 2.8, '5yr': 2.1, '10yr': 2.9 }, risk: 1 },
    ],
    Growth: [
      { asset: 'International Index Funds', allocation: 50, returns: { '1yr': 12.4, '3yr': 8.9, '5yr': 10.2, '10yr': 11.8 }, risk: 4 },
      { asset: 'Australian Index Funds', allocation: 40, returns: { '1yr': 8.2, '3yr': 6.1, '5yr': 7.8, '10yr': 9.1 }, risk: 3 },
      { asset: 'Australian Bonds', allocation: 7, returns: { '1yr': 2.1, '3yr': 1.8, '5yr': 2.9, '10yr': 4.2 }, risk: 2 },
      { asset: 'Cash/Term Deposits', allocation: 3, returns: { '1yr': 4.5, '3yr': 2.8, '5yr': 2.1, '10yr': 2.9 }, risk: 1 },
    ],
  };

  const allocation = portfolioAllocation[riskProfile];
  const overallRisk = allocation.reduce((sum, item) => sum + (item.risk * item.allocation / 100), 0);
  const expectedReturn = allocation.reduce((sum, item) => sum + (item.returns['10yr'] * item.allocation / 100), 0);

  const getRiskColor = (risk: number) => {
    if (risk <= 2) return 'bg-green-100 text-green-800';
    if (risk <= 3) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Recommended Investment Portfolio</span>
          <Badge variant="outline">{riskProfile} Risk Profile</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {hasHighInterestDebt && (
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-semibold text-red-900 mb-2">⚠️ Priority: Eliminate High-Interest Debt First</h4>
            <p className="text-sm text-red-800">
              Before investing, pay off high-interest debt (15-25% guaranteed return). This portfolio is for reference when you're debt-free.
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">Portfolio Summary</h4>
            <p className="text-sm text-muted-foreground">Expected Annual Return: <span className="font-medium text-green-600">{expectedReturn.toFixed(1)}%</span></p>
            <p className="text-sm text-muted-foreground">Overall Risk Score: <span className="font-medium">{overallRisk.toFixed(1)}/5</span></p>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Investment Timeline</h4>
            <p className="text-sm text-muted-foreground">Minimum recommended holding period: 5+ years</p>
            <p className="text-sm text-muted-foreground">Rebalance: Every 12 months</p>
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold">Asset Allocation</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Asset Class</th>
                  <th className="text-center p-2">Allocation</th>
                  <th className="text-center p-2">1yr</th>
                  <th className="text-center p-2">3yr</th>
                  <th className="text-center p-2">5yr</th>
                  <th className="text-center p-2">10yr</th>
                  <th className="text-center p-2">Risk</th>
                </tr>
              </thead>
              <tbody>
                {allocation.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="p-2 font-medium">{item.asset}</td>
                    <td className="text-center p-2">{item.allocation}%</td>
                    <td className="text-center p-2">{item.returns['1yr']}%</td>
                    <td className="text-center p-2">{item.returns['3yr']}%</td>
                    <td className="text-center p-2">{item.returns['5yr']}%</td>
                    <td className="text-center p-2">{item.returns['10yr']}%</td>
                    <td className="text-center p-2">
                      <Badge className={`${getRiskColor(item.risk)} text-xs`}>
                        {item.risk}/5
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Investment Strategy Notes</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Start with low-cost index funds (Vanguard VAS, VGS)</li>
            <li>• Dollar-cost average by investing regularly</li>
            <li>• Consider tax-efficient investment structures</li>
            <li>• Review and rebalance annually</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvestmentRiskProfile;
