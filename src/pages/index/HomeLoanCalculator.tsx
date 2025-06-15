
import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { type Database } from '@/integrations/supabase/types';
import { Loader2 } from 'lucide-react';

type DebtDetails = Database['public']['Tables']['assessments']['Row']['debt_details'];

interface HomeLoanCalculatorProps {
  debtDetails: DebtDetails;
  assessmentId: string | null;
  updateHomeLoanExtraRepayment: (vars: { id: string; amount: number | null }) => void;
  isUpdatingRepayment: boolean;
}

const calculateAmortization = (principal: number, annualRate: number, monthlyPayment: number, extraMonthlyPayment: number) => {
  let balance = principal;
  let months = 0;
  let totalInterest = 0;
  const monthlyRate = annualRate / 100 / 12;

  while (balance > 0) {
    const interest = balance * monthlyRate;
    totalInterest += interest;
    balance += interest;
    balance -= (monthlyPayment + extraMonthlyPayment);
    months++;
    if (months > 30 * 12 * 2) { // safety break for over 60 years
        return { months: -1, totalInterest: -1 };
    }
  }
  return { months, totalInterest };
};


export default function HomeLoanCalculator({ debtDetails, assessmentId, updateHomeLoanExtraRepayment, isUpdatingRepayment }: HomeLoanCalculatorProps) {
  const homeLoan = useMemo(() => {
    if (!Array.isArray(debtDetails)) return null;
    return debtDetails.find(d => (d as any).type === 'Home Loan') as any;
  }, [debtDetails]);
  
  const [extraRepayment, setExtraRepayment] = useState<number>(0);

  const results = useMemo(() => {
    if (!homeLoan) return null;

    const principal = parseFloat(homeLoan.balance);
    const annualRate = parseFloat(homeLoan.interestRate);
    const monthlyPayment = parseFloat(homeLoan.minPayment);

    if (isNaN(principal) || isNaN(annualRate) || isNaN(monthlyPayment)) return null;
    
    const baseline = calculateAmortization(principal, annualRate, monthlyPayment, 0);
    const withExtra = calculateAmortization(principal, annualRate, monthlyPayment, extraRepayment);

    if (baseline.months === -1 || withExtra.months === -1) return { error: "Calculation took too long. Please check your loan details." };
    
    const yearsSaved = Math.floor((baseline.months - withExtra.months) / 12);
    const monthsSaved = (baseline.months - withExtra.months) % 12;
    const interestSaved = baseline.totalInterest - withExtra.totalInterest;

    return {
      timeSaved: `${yearsSaved} years, ${monthsSaved} months`,
      interestSaved: interestSaved.toLocaleString('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 0 }),
    };
  }, [homeLoan, extraRepayment]);

  if (!homeLoan) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pay Off Home Loan Sooner 🚀</CardTitle>
          <CardDescription>No home loan details found in your assessment.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Go back and add your home loan details to use this tool.</p>
        </CardContent>
      </Card>
    );
  }
  
  const handleSave = () => {
    if (assessmentId) {
      updateHomeLoanExtraRepayment({ id: assessmentId, amount: extraRepayment });
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pay Off Home Loan Sooner 🚀</CardTitle>
        <CardDescription>See how extra repayments can save you thousands!</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p><strong>Loan Balance:</strong> ${parseFloat(homeLoan.balance).toLocaleString()}</p>
          <p><strong>Interest Rate:</strong> {homeLoan.interestRate}%</p>
          <p><strong>Monthly Repayment:</strong> ${parseFloat(homeLoan.minPayment).toLocaleString()}</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="extra-repayment">Extra Monthly Repayment</Label>
          <Input
            id="extra-repayment"
            type="number"
            value={extraRepayment}
            onChange={(e) => setExtraRepayment(Number(e.target.value))}
            placeholder="e.g. 500"
          />
        </div>
        {results && !results.error && (
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-bold text-lg text-green-800">Your results ✨</h3>
            <p className="text-green-700"><strong>Time Saved:</strong> {results.timeSaved}</p>
            <p className="text-green-700"><strong>Interest Saved:</strong> {results.interestSaved}</p>
          </div>
        )}
        {results?.error && (
            <p className="text-red-500">{results.error}</p>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={!assessmentId || isUpdatingRepayment}>
          {isUpdatingRepayment && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save My Extra Repayment
        </Button>
      </CardFooter>
    </Card>
  );
}
