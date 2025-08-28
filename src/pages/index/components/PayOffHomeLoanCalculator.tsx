
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartContainer, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";

interface PayOffHomeLoanCalculatorProps {
  assessmentData: any;
  totalMonthlyNetIncome: number;
  totalAnnualGrossIncome: number;
}

const formatTerm = (years: number, months: number): string => {
  const yearText = years > 0 ? `${years} Yr` : null;
  const monthText = months > 0 ? `${months} M` : null;

  if (yearText && monthText) {
    return `${yearText} & ${monthText}`;
  }
  return yearText || monthText || '0 M';
};

const chartConfig = {
  originalLoan: { label: "Current Plan", color: "#9CA3AF" },
  withExtraRepayments: { label: "With Extra Repayments", color: "#059669" },
} satisfies ChartConfig;

const PayOffHomeLoanCalculator: React.FC<PayOffHomeLoanCalculatorProps> = ({
  assessmentData,
  totalMonthlyNetIncome,
}) => {
  const [loanAmount, setLoanAmount] = useState(500000);
  const [loanTerm, setLoanTerm] = useState(30);
  const [interestRate, setInterestRate] = useState(6.5);
  const [extraRepayment, setExtraRepayment] = useState(500); // Set default extra payment
  const [results, setResults] = useState<any>(null);

  // Extract mortgage details from assessment if available
  useEffect(() => {
    const mortgageDebt = assessmentData.debtDetails?.find((debt: any) => 
      debt.type === 'Mortgage'
    );
    
    if (mortgageDebt) {
      setLoanAmount(parseFloat(mortgageDebt.balance) || 500000);
      setInterestRate(parseFloat(mortgageDebt.interestRate) || 6.5);
    }
  }, [assessmentData.debtDetails]);

  const calculateLoanDetails = () => {
    const principal = loanAmount;
    const annualRate = interestRate;
    const termInMonths = loanTerm * 12;
    const monthlyRate = annualRate / 100 / 12;

    let monthlyPayment = 0;
    if (monthlyRate > 0) {
      monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termInMonths)) / (Math.pow(1 + monthlyRate, termInMonths) - 1);
    } else {
      monthlyPayment = principal / termInMonths;
    }

    const calculateAmortization = (p: number, mp: number, mer: number, mr: number) => {
      let balance = p;
      let months = 0;
      let totalInterest = 0;
      const totalMonthlyPayment = mp + mer;
      const amortizationData: { year: number, balance: number }[] = [{ year: 0, balance: p }];

      if (totalMonthlyPayment <= 0 && p > 0) {
        return { months: Infinity, totalInterest: Infinity, data: [] };
      }
      
      if (mr > 0 && totalMonthlyPayment <= p * mr) {
        return { months: Infinity, totalInterest: Infinity, data: [] };
      }

      while (balance > 0.01) { // Use small threshold instead of exactly 0
        const interestForMonth = balance * mr;
        totalInterest += interestForMonth;
        balance += interestForMonth;
        
        const paymentAmount = Math.min(totalMonthlyPayment, balance);
        balance -= paymentAmount;
        months++;

        // Add data points every 12 months for chart display
        if (months % 12 === 0) {
          amortizationData.push({ year: months / 12, balance: Math.max(0, balance) });
        }

        if (months > 40 * 12 * 2) {
          return { months: Infinity, totalInterest: Infinity, data: [] };
        }
      }
      
      if (months % 12 !== 0 && amortizationData[amortizationData.length - 1].balance > 0) {
        amortizationData.push({ year: months / 12, balance: 0 });
      }

      return { months, totalInterest, data: amortizationData };
    };

    const baseline = calculateAmortization(principal, monthlyPayment, 0, monthlyRate);
    const withExtra = calculateAmortization(principal, monthlyPayment, extraRepayment, monthlyRate);

    if (withExtra.months === Infinity) {
      return null;
    }

    const totalTimeSavedMonths = baseline.months - withExtra.months;
    const yearsSaved = Math.floor(totalTimeSavedMonths / 12);
    const monthsSaved = Math.round(totalTimeSavedMonths % 12);
    const interestSaved = baseline.totalInterest - withExtra.totalInterest;
    const originalTermYears = Math.floor(baseline.months / 12);
    const originalTermMonths = Math.round(baseline.months % 12);
    const newTermYears = Math.floor(withExtra.months / 12);
    const newTermMonths = Math.round(withExtra.months % 12);

    const chartData = baseline.data.map(originalPoint => {
      const newPoint = withExtra.data.find(p => p.year === originalPoint.year);
      const newBalance = newPoint ? newPoint.balance : 0;
      
      return {
        year: originalPoint.year,
        originalLoan: originalPoint.balance,
        withExtraRepayments: newBalance,
      };
    });

    const debtFreeYear = new Date().getFullYear() + newTermYears;

    return {
      monthlyPayment,
      timeSaved: formatTerm(yearsSaved, monthsSaved),
      interestSaved: interestSaved,
      originalTerm: formatTerm(originalTermYears, originalTermMonths),
      newTerm: formatTerm(newTermYears, newTermMonths),
      chartData,
      debtFreeYear,
    };
  };

  useEffect(() => {
    const result = calculateLoanDetails();
    setResults(result);
  }, [loanAmount, loanTerm, interestRate, extraRepayment]);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🏡 Pay Off Home Loan Sooner
        </CardTitle>
        <CardDescription>See how extra repayments can save you thousands and years!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="loanAmount">Loan Balance ($)</Label>
            <Input
              id="loanAmount"
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(parseFloat(e.target.value) || 0)}
              className="w-full"
            />
          </div>
          <div>
            <Label htmlFor="loanTerm">Remaining Term (years)</Label>
            <Input
              id="loanTerm"
              type="number"
              value={loanTerm}
              onChange={(e) => setLoanTerm(parseFloat(e.target.value) || 0)}
              className="w-full"
            />
          </div>
          <div>
            <Label htmlFor="interestRate">Interest Rate (%)</Label>
            <Input
              id="interestRate"
              type="number"
              step="0.01"
              value={interestRate}
              onChange={(e) => setInterestRate(parseFloat(e.target.value) || 0)}
              className="w-full"
            />
          </div>
          <div>
            <Label htmlFor="extraRepayment">Extra Monthly Payment ($)</Label>
            <Input
              id="extraRepayment"
              type="number"
              value={extraRepayment}
              onChange={(e) => setExtraRepayment(parseFloat(e.target.value) || 0)}
              className="w-full"
            />
          </div>
        </div>

        {results && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Interest Saved</p>
                  <p className="text-2xl font-bold text-green-700">
                    {results.interestSaved.toLocaleString('en-AU', { 
                      style: 'currency', 
                      currency: 'AUD', 
                      minimumFractionDigits: 0 
                    })}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Time Saved</p>
                  <p className="text-2xl font-bold text-green-700">{results.timeSaved}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Debt Free By</p>
                  <p className="text-2xl font-bold text-green-700 flex items-center justify-center gap-1">
                    {results.debtFreeYear} 🎉
                  </p>
                </div>
              </div>

              {results.chartData && results.chartData.length > 1 && (
                <div className="mt-6">
                  <p className="text-sm font-medium text-gray-700 mb-3">Loan Balance Over Time</p>
                  <ChartContainer config={chartConfig} className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={results.chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="year" 
                          tickFormatter={(value) => `Yr ${value}`}
                          label={{ value: 'Years', position: 'insideBottom', offset: -5 }}
                        />
                        <YAxis 
                          tickFormatter={(value) => `$${(value / 1000)}k`}
                        />
                        <Tooltip
                          content={<ChartTooltipContent
                            formatter={(value) => value.toLocaleString('en-AU', { 
                              style: 'currency', 
                              currency: 'AUD', 
                              minimumFractionDigits: 0 
                            })}
                            labelFormatter={(label) => `Year ${label}`}
                          />}
                        />
                        <Line 
                          dataKey="originalLoan" 
                          stroke="var(--color-originalLoan)" 
                          strokeWidth={2} 
                          dot={false} 
                        />
                        <Line 
                          dataKey="withExtraRepayments" 
                          stroke="var(--color-withExtraRepayments)" 
                          strokeWidth={2} 
                          dot={false} 
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Button asChild className="w-2/3 mx-auto block">
          <Link to="/pay-off-home-loan">Open Full Calculator</Link>
        </Button>
      </CardContent>
    </Card>
  );
};

export default PayOffHomeLoanCalculator;
