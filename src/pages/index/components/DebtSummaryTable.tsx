
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { type DebtDetail } from '../assessmentHooks';

interface DebtSummaryTableProps {
  debtDetails: DebtDetail[];
  monthlySurplus: number;
}

const DebtSummaryTable: React.FC<DebtSummaryTableProps> = ({ debtDetails, monthlySurplus }) => {
  if (debtDetails.length === 0) return null;

  const totalDebt = debtDetails.reduce((sum, debt) => sum + parseFloat(debt.balance || '0'), 0);
  const totalMonthlyRepayments = debtDetails.reduce((sum, debt) => sum + parseFloat(debt.repayments || '0'), 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Debt Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2">Debt Type</th>
                <th className="text-right p-2">Balance</th>
                <th className="text-right p-2">Monthly Payment</th>
                <th className="text-right p-2">Interest Rate</th>
              </tr>
            </thead>
            <tbody>
              {debtDetails.map((debt, index) => (
                <tr key={index} className="border-b">
                  <td className="p-2">{debt.type}</td>
                  <td className="text-right p-2">${parseFloat(debt.balance || '0').toLocaleString()}</td>
                  <td className="text-right p-2">${parseFloat(debt.repayments || '0').toLocaleString()}</td>
                  <td className="text-right p-2">{debt.interestRate}%</td>
                </tr>
              ))}
              <tr className="border-t font-semibold">
                <td className="p-2">Total</td>
                <td className="text-right p-2">${totalDebt.toLocaleString()}</td>
                <td className="text-right p-2">${totalMonthlyRepayments.toLocaleString()}</td>
                <td className="text-right p-2">-</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm">
            <strong>Monthly Surplus Available:</strong> ${monthlySurplus.toLocaleString()}
          </p>
          <p className="text-xs text-gray-600 mt-1">
            This amount could be used for additional debt payments or investments.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default DebtSummaryTable;
