
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingDown, Flag, ExternalLink } from "lucide-react";

interface DebtDetail {
  type: string;
  balance: string;
  repayments: string;
  interestRate: string;
}

interface DebtSummaryTableProps {
  debtDetails: DebtDetail[];
  monthlySurplus: number;
}

const DebtSummaryTable: React.FC<DebtSummaryTableProps> = ({ debtDetails, monthlySurplus }) => {
  // Industry average interest rates (Australian market 2024)
  const industryAverages = {
    'Credit Card': 20.5,
    'Personal Loan': 12.5,
    'Car Loan': 8.5,
    'Mortgage': 6.2,
    'Investment Loan': 6.5,
    'BNPL (e.g. Afterpay)': 0, // Generally 0% but fees apply
    'Store Card': 22.0,
    'Line of Credit': 15.0,
    'Payday Loan': 400, // Annual percentage rate can be extremely high
    'Other': 15.0, // Generic average
  };

  const getIndustryAverage = (debtType: string): number => {
    return industryAverages[debtType as keyof typeof industryAverages] || industryAverages['Other'];
  };

  const isRateUnfavorable = (userRate: number, debtType: string): boolean => {
    const industryRate = getIndustryAverage(debtType);
    return userRate > industryRate + 0.75; // Flag if user's rate is more than 0.75% above industry average
  };

  const validDebts = debtDetails.filter(debt => 
    parseFloat(debt.balance) > 0 && 
    parseFloat(debt.repayments) > 0 && 
    parseFloat(debt.interestRate) > 0
  );

  if (validDebts.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-green-600" />
            Debt Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-green-800 font-medium">🎉 Congratulations! No high-interest debt detected.</p>
            <p className="text-sm text-green-700 mt-1">You're in excellent position to focus on building wealth through investments.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Sort debts by interest rate (highest first) for snowball method
  const sortedDebts = [...validDebts].sort((a, b) => parseFloat(b.interestRate) - parseFloat(a.interestRate));

  const totalBalance = validDebts.reduce((sum, debt) => sum + parseFloat(debt.balance), 0);
  const totalMinPayments = validDebts.reduce((sum, debt) => sum + parseFloat(debt.repayments), 0);
  const weightedRate = validDebts.reduce((sum, debt) => 
    sum + (parseFloat(debt.balance) * parseFloat(debt.interestRate)), 0
  ) / totalBalance;

  const availableForDebt = Math.max(monthlySurplus * 0.7, 0);
  const recommendedExtra = Math.min(availableForDebt, 500);

  const getRiskLevel = (rate: number) => {
    if (rate >= 20) return { label: 'Very High', color: 'bg-red-100 text-red-800' };
    if (rate >= 15) return { label: 'High', color: 'bg-orange-100 text-orange-800' };
    if (rate >= 10) return { label: 'Medium', color: 'bg-yellow-100 text-yellow-800' };
    return { label: 'Low', color: 'bg-green-100 text-green-800' };
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          Debt Summary & Snowball Strategy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Total Debt</p>
            <p className="text-2xl font-bold text-red-600">${totalBalance.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Monthly Min Payments</p>
            <p className="text-2xl font-bold">${totalMinPayments.toLocaleString()}</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">Weighted Interest Rate</p>
            <p className="text-2xl font-bold text-orange-600">{weightedRate.toFixed(1)}%</p>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">💡 The Debt Snowball Method</h4>
          <p className="text-sm text-blue-800 mb-2">
            Focus on paying the minimum on all debts, then throw every extra dollar at the highest interest rate debt first. 
            Once that's paid off, take that payment and add it to the next highest rate debt.
          </p>
          <p className="text-sm text-blue-800">
            <strong>Recommended extra payment:</strong> ${recommendedExtra.toFixed(0)}/month (70% of your surplus)
          </p>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold">Your Debt Elimination Order</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Priority</th>
                  <th className="text-left p-2">Debt Type</th>
                  <th className="text-right p-2">Balance</th>
                  <th className="text-right p-2">Min Payment</th>
                  <th className="text-right p-2">Your Rate</th>
                  <th className="text-right p-2">Industry Avg</th>
                  <th className="text-center p-2">Risk Level</th>
                  <th className="text-center p-2">Compare</th>
                </tr>
              </thead>
              <tbody>
                {sortedDebts.map((debt, index) => {
                  const rate = parseFloat(debt.interestRate);
                  const industryAvg = getIndustryAverage(debt.type);
                  const riskLevel = getRiskLevel(rate);
                  const showFlag = isRateUnfavorable(rate, debt.type);
                  
                  return (
                    <tr key={index} className="border-b">
                      <td className="p-2">
                        <Badge variant="outline" className={index === 0 ? 'border-red-500 text-red-700' : ''}>
                          {index + 1}
                        </Badge>
                      </td>
                      <td className="p-2 font-medium">
                        <div className="flex items-center gap-2">
                          {debt.type}
                           {showFlag && (
                             <div title="Rate significantly above industry average">
                               <Flag className="h-4 w-4 text-red-500" />
                             </div>
                           )}
                        </div>
                      </td>
                      <td className="text-right p-2">${parseFloat(debt.balance).toLocaleString()}</td>
                      <td className="text-right p-2">${parseFloat(debt.repayments).toLocaleString()}</td>
                      <td className="text-right p-2 font-medium">
                        <span className={showFlag ? 'text-red-600' : ''}>{rate.toFixed(1)}%</span>
                      </td>
                      <td className="text-right p-2 text-muted-foreground">
                        {industryAvg > 0 ? `${industryAvg.toFixed(1)}%` : 'N/A'}
                      </td>
                      <td className="text-center p-2">
                        <Badge className={riskLevel.color}>
                          {riskLevel.label}
                        </Badge>
                      </td>
                      <td className="text-center p-2">
                        {showFlag && debt.type !== 'BNPL (e.g. Afterpay)' && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            onClick={() => window.open('https://www.joust.com.au/', '_blank')}
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            Compare
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Only show immediate action if there's high interest debt (excluding mortgages) */}
        {sortedDebts.some(debt => 
          ['Credit Card', 'Personal Loan', 'BNPL (e.g. Afterpay)'].includes(debt.type) && 
          parseFloat(debt.balance) > 0
        ) && (
          <div className="bg-red-50 p-4 rounded-lg">
            <h4 className="font-semibold text-red-900 mb-2">🚨 Immediate Action Required</h4>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• <strong>Stop all unnecessary spending</strong> - Cancel subscriptions, reduce entertainment, eat out less</li>
              <li>• <strong>Pay minimum on all debts</strong> except the highest interest rate ({sortedDebts[0]?.type})</li>
              <li>• <strong>Attack {sortedDebts[0]?.type} with ${recommendedExtra.toFixed(0)}/month extra</strong></li>
              <li>• <strong>Consider debt consolidation</strong> if you can get a lower rate</li>
              <li>• <strong>No investing until high-interest debt is eliminated</strong></li>
            </ul>
          </div>
        )}

        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold text-green-900 mb-2">✅ After Debt Elimination</h4>
          <p className="text-sm text-green-800">
            Once you've eliminated these debts, you'll have ${(totalMinPayments + recommendedExtra).toFixed(0)}/month 
            available for investing. This represents a guaranteed return of {weightedRate.toFixed(1)}% - better than most investments!
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DebtSummaryTable;
