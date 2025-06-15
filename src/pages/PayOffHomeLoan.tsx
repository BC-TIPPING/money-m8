import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const formSchema = z.object({
  loanAmount: z.coerce.number({ required_error: "Loan amount is required." }).min(1, "Loan amount must be positive."),
  loanTerm: z.coerce.number({ required_error: "Loan term is required." }).min(1, "Loan term must be at least 1 year.").max(40, "Loan term cannot exceed 40 years."),
  interestRate: z.coerce.number({ required_error: "Interest rate is required." }).min(0, "Interest rate cannot be negative.").max(25, "Interest rate seems too high."),
  extraRepayment: z.coerce.number().min(0, "Extra repayment cannot be negative.").default(0),
  repaymentFrequency: z.enum(["weekly", "fortnightly", "monthly", "yearly"]).default("monthly"),
});

type CalculatorFormValues = z.infer<typeof formSchema>;

interface CalculationResult {
  monthlyPayment: number;
  timeSaved: string;
  interestSaved: number;
  originalTerm: string;
  newTerm: string;
  error?: string;
}

const formatTerm = (years: number, months: number): string => {
    const yearText = years > 0 ? `${years} Yr` : null;
    const monthText = months > 0 ? `${months} M` : null;

    if (yearText && monthText) {
        return `${yearText} & ${monthText}`;
    }
    return yearText || monthText || '0 M';
};

const calculateLoanDetails = (values: CalculatorFormValues): CalculationResult => {
  const { loanAmount, loanTerm, interestRate, extraRepayment, repaymentFrequency } = values;

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

  let monthlyExtraRepayment = 0;
  switch (repaymentFrequency) {
    case 'weekly':
      monthlyExtraRepayment = extraRepayment * 52 / 12;
      break;
    case 'fortnightly':
      monthlyExtraRepayment = extraRepayment * 26 / 12;
      break;
    case 'yearly':
      monthlyExtraRepayment = extraRepayment / 12;
      break;
    case 'monthly':
    default:
      monthlyExtraRepayment = extraRepayment;
      break;
  }

  const calculateAmortization = (p: number, mp: number, mer: number, mr: number) => {
    let balance = p;
    let months = 0;
    let totalInterest = 0;
    const totalMonthlyPayment = mp + mer;

    if (totalMonthlyPayment <= 0 && p > 0) {
        return { months: Infinity, totalInterest: Infinity };
    }
    
    if (mr > 0 && totalMonthlyPayment <= p * mr) {
        return { months: Infinity, totalInterest: Infinity };
    }

    while (balance > 0) {
      const interestForMonth = balance * mr;
      totalInterest += interestForMonth;
      balance += interestForMonth;
      balance -= totalMonthlyPayment;
      months++;
      if (months > 40 * 12 * 2) {
        return { months: Infinity, totalInterest: Infinity };
      }
    }
    return { months, totalInterest };
  };

  const baseline = calculateAmortization(principal, monthlyPayment, 0, monthlyRate);
  const withExtra = calculateAmortization(principal, monthlyPayment, monthlyExtraRepayment, monthlyRate);

  if (withExtra.months === Infinity) {
      return { error: "With the given repayments, the loan will never be paid off. Please increase the repayment amount.", monthlyPayment: 0, timeSaved: "", interestSaved: 0, originalTerm: "", newTerm: "" };
  }

  const yearsSaved = Math.floor((baseline.months - withExtra.months) / 12);
  const monthsSaved = Math.round((baseline.months - withExtra.months) % 12);
  const interestSaved = baseline.totalInterest - withExtra.totalInterest;
  const originalTermYears = Math.floor(baseline.months / 12);
  const originalTermMonths = Math.round(baseline.months % 12);
  const newTermYears = Math.floor(withExtra.months / 12);
  const newTermMonths = Math.round(withExtra.months % 12);

  return {
    monthlyPayment,
    timeSaved: formatTerm(yearsSaved, monthsSaved),
    interestSaved: interestSaved,
    originalTerm: formatTerm(originalTermYears, originalTermMonths),
    newTerm: formatTerm(newTermYears, newTermMonths),
  };
};

export default function PayOffHomeLoanPage() {
    const [results, setResults] = useState<CalculationResult | null>(null);

    const form = useForm<CalculatorFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            loanAmount: 500000,
            loanTerm: 30,
            interestRate: 6.5,
            extraRepayment: 0,
            repaymentFrequency: "monthly",
        },
    });

    function onSubmit(values: CalculatorFormValues) {
        const result = calculateLoanDetails(values);
        setResults(result);
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-6">
                <Button asChild variant="ghost">
                    <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard</Link>
                </Button>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Home Loan Repayment Calculator</CardTitle>
                        <CardDescription>See how extra repayments can impact your loan.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="loanAmount"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Remaining Loan Balance ($)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g. 500000" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="loanTerm"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Remaining Loan Term (years)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g. 25" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="interestRate"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Interest Rate (%)</FormLabel>
                                            <FormControl>
                                                <Input type="number" step="0.01" placeholder="e.g. 6.5" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="extraRepayment"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Additional Repayments ($)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g. 200" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="repaymentFrequency"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Repayment Frequency</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select frequency" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="weekly">Weekly</SelectItem>
                                                    <SelectItem value="fortnightly">Fortnightly</SelectItem>
                                                    <SelectItem value="monthly">Monthly</SelectItem>
                                                    <SelectItem value="yearly">Yearly</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" className="w-full">Calculate</Button>
                            </form>
                        </Form>
                    </CardContent>
                </Card>

                {results && (
                     <Card className="bg-green-50">
                        <CardHeader>
                            <CardTitle className="text-green-800">Your Results ✨</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-green-700">
                            {results.error ? (
                                <p className="text-red-500 font-bold">{results.error}</p>
                            ) : (
                                <>
                                    <div>
                                        <p className="text-lg font-semibold">Interest Saved</p>
                                        <p className="text-2xl font-bold">{results.interestSaved.toLocaleString('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 0 })}</p>
                                    </div>
                                    <div>
                                        <p className="text-lg font-semibold">Time Saved</p>
                                        <p className="text-2xl font-bold">{results.timeSaved}</p>
                                    </div>
                                    <div className="pt-4 border-t border-green-200">
                                        <p><strong>Minimum Monthly Repayment:</strong> {results.monthlyPayment.toLocaleString('en-AU', { style: 'currency', currency: 'AUD' })}</p>
                                        <p><strong>Original Loan Term:</strong> {results.originalTerm}</p>
                                        <p><strong>New Loan Term (with extra repayments):</strong> {results.newTerm}</p>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
