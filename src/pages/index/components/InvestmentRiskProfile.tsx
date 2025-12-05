
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

        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold text-green-900 mb-3">Why Diversification Matters</h4>
          <p className="text-sm text-green-800 mb-3">
            Index funds provide instant diversification by holding hundreds or thousands of stocks in a single investment. 
            This spreads your risk across multiple companies, industries, and even countries.
          </p>
          <div className="text-sm text-green-800 space-y-2">
            <p><strong>Single Stock Risk:</strong> If you owned only BHP shares and iron ore prices crashed, you could lose 50%+ overnight.</p>
            <p><strong>Index Fund Protection:</strong> An ASX 200 index fund holds 200 companies - if BHP falls, other companies may rise, limiting your losses.</p>
            <p><strong>The Power of Spreading Risk:</strong> By owning a slice of the entire market, you remove the risk of picking the wrong individual stocks.</p>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <h4 className="font-semibold text-yellow-900 mb-3">Risk vs Reward: Understanding Beta</h4>
          <p className="text-sm text-yellow-800 mb-3">
            Beta measures how much a stock moves compared to the overall market. A beta of 1.0 means it moves with the market.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-yellow-800">
            <div>
              <h5 className="font-semibold mb-2">Risky Mining Stock Example:</h5>
              <p><strong>Fortescue Metals (FMG)</strong></p>
              <p>Beta: 1.8 (80% more volatile than market)</p>
              <p>Risk: Price swings ±30-50% regularly</p>
              <p>Reward: Can deliver huge gains OR losses</p>
            </div>
            <div>
              <h5 className="font-semibold mb-2">Stable Index Fund:</h5>
              <p><strong>ASX 200 Index Fund</strong></p>
              <p>Beta: 1.0 (moves with market)</p>
              <p>Risk: Typical swings ±15-25%</p>
              <p>Reward: Steady long-term growth</p>
            </div>
          </div>
          <div className="mt-3 p-2 bg-yellow-100 rounded text-xs text-yellow-900">
            <strong>Beta Guide:</strong> 0-0.5 (Low risk) | 0.5-1.0 (Moderate risk) | 1.0-1.5 (Market risk) | 1.5+ (High risk)
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <h4 className="font-semibold text-purple-900 mb-3">5 Core Index Funds for Australian Investors</h4>
          <div className="space-y-4">
            <div className="border-l-4 border-purple-300 pl-3">
              <h5 className="font-semibold text-purple-900">1. Vanguard Australian Shares Index (VAS)</h5>
              <div className="flex gap-4 text-xs text-purple-700 mb-1">
                <span className="bg-purple-200 px-2 py-0.5 rounded">5yr Avg Return: 8.2% p.a.</span>
                <span className="bg-purple-200 px-2 py-0.5 rounded">Beta: 1.0</span>
              </div>
              <p className="text-sm text-purple-800 mb-1">Contains: Top 300 Australian companies (CBA, BHP, CSL, Woolworths)</p>
              <p className="text-sm text-purple-800">Why it suits you: Core Australian exposure, franking credits, matches your home market</p>
            </div>
            
            <div className="border-l-4 border-purple-300 pl-3">
              <h5 className="font-semibold text-purple-900">2. Vanguard International Shares Index (VGS)</h5>
              <div className="flex gap-4 text-xs text-purple-700 mb-1">
                <span className="bg-purple-200 px-2 py-0.5 rounded">5yr Avg Return: 12.8% p.a.</span>
                <span className="bg-purple-200 px-2 py-0.5 rounded">Beta: 1.05</span>
              </div>
              <p className="text-sm text-purple-800 mb-1">Contains: 1,500+ global companies (Apple, Microsoft, Amazon, Google)</p>
              <p className="text-sm text-purple-800">Why it suits you: Global diversification, access to world's largest companies, currency hedging</p>
            </div>

            <div className="border-l-4 border-purple-300 pl-3">
              <h5 className="font-semibold text-purple-900">3. iShares Core S&P 500 (IVV)</h5>
              <div className="flex gap-4 text-xs text-purple-700 mb-1">
                <span className="bg-purple-200 px-2 py-0.5 rounded">5yr Avg Return: 14.5% p.a.</span>
                <span className="bg-purple-200 px-2 py-0.5 rounded">Beta: 1.0</span>
              </div>
              <p className="text-sm text-purple-800 mb-1">Contains: 500 largest US companies (Tesla, NVIDIA, Meta, Netflix)</p>
              <p className="text-sm text-purple-800">Why it suits you: Access to US growth, tech innovation, world's strongest economy</p>
            </div>

            <div className="border-l-4 border-purple-300 pl-3">
              <h5 className="font-semibold text-purple-900">4. Vanguard Emerging Markets (VGE)</h5>
              <div className="flex gap-4 text-xs text-purple-700 mb-1">
                <span className="bg-purple-200 px-2 py-0.5 rounded">5yr Avg Return: 4.2% p.a.</span>
                <span className="bg-purple-200 px-2 py-0.5 rounded">Beta: 1.15</span>
              </div>
              <p className="text-sm text-purple-800 mb-1">Contains: Companies from China, India, Taiwan, South Korea (Alibaba, TSMC)</p>
              <p className="text-sm text-purple-800">Why it suits you: Higher growth potential, demographic trends, diversification from developed markets</p>
            </div>

            <div className="border-l-4 border-purple-300 pl-3">
              <h5 className="font-semibold text-purple-900">5. Vanguard Australian Government Bonds (VGB)</h5>
              <div className="flex gap-4 text-xs text-purple-700 mb-1">
                <span className="bg-purple-200 px-2 py-0.5 rounded">5yr Avg Return: 1.8% p.a.</span>
                <span className="bg-purple-200 px-2 py-0.5 rounded">Beta: 0.1</span>
              </div>
              <p className="text-sm text-purple-800 mb-1">Contains: Australian government treasury bonds with various maturity dates</p>
              <p className="text-sm text-purple-800">Why it suits you: Stability during market crashes, income generation, balances stock volatility</p>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-purple-100 rounded">
            <p className="text-xs text-purple-900">
              <strong>Portfolio Suggestion:</strong> Start with VAS (40%) + VGS (40%) + IVV (20%) for a simple, globally diversified portfolio. 
              Add VGE (10%) and VGB (10%) as you grow more comfortable with investing.
            </p>
            <p className="text-xs text-purple-700 mt-1 italic">
              Note: Returns are historical averages and do not guarantee future performance. Beta measures volatility relative to the market.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InvestmentRiskProfile;
