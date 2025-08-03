
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Calculator, TrendingUp } from 'lucide-react';
import { Link } from 'react-router-dom';
import SuperannuationChart from './SuperannuationChart';

export default function MaximiseSuper() {
  const [currentAge, setCurrentAge] = useState(30);
  const [retirementAge, setRetirementAge] = useState(67);
  const [currentBalance, setCurrentBalance] = useState(50000);
  const [currentSalary, setCurrentSalary] = useState(80000);
  const [additionalContributions, setAdditionalContributions] = useState(2000);
  const [salaryPackaging, setSalaryPackaging] = useState(0);

  // Calculate projections
  const yearsToRetirement = retirementAge - currentAge;
  const compulsoryRate = 0.115; // 11.5%
  const returnRate = 0.07; // 7% average return
  
  // Calculate final balances
  const calculateFinalBalance = (extraContributions: number) => {
    let balance = currentBalance;
    for (let year = 0; year < yearsToRetirement; year++) {
      const compulsoryContribution = currentSalary * compulsoryRate;
      balance = balance * (1 + returnRate) + compulsoryContribution + extraContributions;
    }
    return balance;
  };
  
  const balanceWithoutExtra = calculateFinalBalance(0);
  const balanceWithExtra = calculateFinalBalance(additionalContributions);
  const extraBenefit = balanceWithExtra - balanceWithoutExtra;
  
  // Calculate tax savings
  const marginalTaxRate = currentSalary > 120000 ? 0.37 : currentSalary > 45000 ? 0.325 : 0.19;
  const superTaxRate = 0.15;
  const taxSavingsPerYear = (additionalContributions + salaryPackaging) * (marginalTaxRate - superTaxRate);
  const totalTaxSavings = taxSavingsPerYear * yearsToRetirement;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-6">
          <Button asChild variant="outline" className="mb-4">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Assessment
            </Link>
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">💰 Maximise Your Super</h1>
          <p className="text-gray-600">
            Discover how extra super contributions can boost your retirement savings and reduce your tax.
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Your Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="currentAge">Current Age</Label>
                  <Input
                    id="currentAge"
                    type="number"
                    value={currentAge}
                    onChange={(e) => setCurrentAge(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="retirementAge">Retirement Age</Label>
                  <Input
                    id="retirementAge"
                    type="number"
                    value={retirementAge}
                    onChange={(e) => setRetirementAge(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="currentBalance">Current Super Balance</Label>
                  <Input
                    id="currentBalance"
                    type="number"
                    value={currentBalance}
                    onChange={(e) => setCurrentBalance(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="currentSalary">Current Salary</Label>
                  <Input
                    id="currentSalary"
                    type="number"
                    value={currentSalary}
                    onChange={(e) => setCurrentSalary(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="additionalContributions">Extra Annual Contributions</Label>
                  <Input
                    id="additionalContributions"
                    type="number"
                    value={additionalContributions}
                    onChange={(e) => setAdditionalContributions(Number(e.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="salaryPackaging">Salary Packaging to Super</Label>
                  <Input
                    id="salaryPackaging"
                    type="number"
                    value={salaryPackaging}
                    onChange={(e) => setSalaryPackaging(Number(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Your Super Projection
              </CardTitle>
              <CardDescription>
                See how your super will grow with and without extra contributions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SuperannuationChart
                currentAge={currentAge}
                retirementAge={retirementAge}
                currentBalance={currentBalance}
                currentSalary={currentSalary}
                additionalContributions={additionalContributions}
              />
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Extra Retirement Benefit</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">
                ${extraBenefit.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Additional super balance at retirement
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Annual Tax Savings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">
                ${taxSavingsPerYear.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Tax you'll save each year
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Total Tax Savings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">
                ${totalTaxSavings.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Lifetime tax savings to retirement
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">Salary Sacrifice Strategy</h3>
                <p className="text-green-800 text-sm">
                  Consider salary sacrificing ${(additionalContributions / 12).toFixed(0)} per month to super. 
                  This reduces your taxable income and boosts your retirement savings.
                </p>
              </div>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Concessional Contribution Limits</h3>
                <p className="text-blue-800 text-sm">
                  The annual concessional contribution limit is $27,500 (2024-25). 
                  Your employer contributions plus salary sacrifice should not exceed this amount.
                </p>
              </div>
              
              <div className="p-4 bg-purple-50 rounded-lg">
                <h3 className="font-semibold text-purple-900 mb-2">Government Co-contribution</h3>
                <p className="text-purple-800 text-sm">
                  If you earn less than $58,445, you may be eligible for government co-contributions 
                  of up to $500 when you make after-tax contributions to super.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
