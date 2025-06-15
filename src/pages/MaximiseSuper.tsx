
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
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
  grossAnnualIncome: z.coerce.number({ required_error: "Gross annual income is required." }).min(1, "Income must be positive."),
  extraContribution: z.coerce.number().min(0, "Extra contribution cannot be negative.").default(0),
  contributionFrequency: z.enum(["weekly", "fortnightly", "monthly", "yearly"]).default("monthly"),
});

type CalculatorFormValues = z.infer<typeof formSchema>;

interface CalculationResult {
  employerContribution: number;
  annualExtraContribution: number;
  totalConcessionalContribution: number;
  roomToContribute: number;
  capExceeded: boolean;
  incomeTaxSaved: number;
  netBenefit: number;
  weeklyTaxDecrease: number;
}

const SUPER_GUARANTEE_RATE = 0.12;
const CONCESSIONAL_CAP = 27500;
const SUPER_CONTRIBUTION_TAX = 0.15;

const calculateIncomeTax = (income: number) => {
  let tax = 0;
  // Note: Using 2023-24 tax brackets. These are subject to change.
  if (income > 180000) {
    tax += (income - 180000) * 0.45;
    income = 180000;
  }
  if (income > 120000) {
    tax += (income - 120000) * 0.37;
    income = 120000;
  }
  if (income > 45000) {
    tax += (income - 45000) * 0.325;
    income = 45000;
  }
  if (income > 18200) {
    tax += (income - 18200) * 0.19;
  }
  return tax;
};


const calculateSuperDetails = (values: CalculatorFormValues): CalculationResult => {
  const { grossAnnualIncome, extraContribution, contributionFrequency } = values;

  const employerContribution = grossAnnualIncome * SUPER_GUARANTEE_RATE;

  let annualExtraContribution = 0;
  switch (contributionFrequency) {
    case 'weekly':
      annualExtraContribution = extraContribution * 52;
      break;
    case 'fortnightly':
      annualExtraContribution = extraContribution * 26;
      break;
    case 'monthly':
      annualExtraContribution = extraContribution * 12;
      break;
    case 'yearly':
    default:
      annualExtraContribution = extraContribution;
      break;
  }

  const totalConcessionalContribution = employerContribution + annualExtraContribution;
  const roomToContribute = CONCESSIONAL_CAP - totalConcessionalContribution;
  const capExceeded = totalConcessionalContribution > CONCESSIONAL_CAP;

  // Tax calculations for salary sacrifice
  const taxBefore = calculateIncomeTax(grossAnnualIncome);
  const newTaxableIncome = grossAnnualIncome - annualExtraContribution;
  const taxAfter = calculateIncomeTax(newTaxableIncome);

  const incomeTaxSaved = taxBefore - taxAfter;
  const taxOnSuperContribution = annualExtraContribution * SUPER_CONTRIBUTION_TAX;
  const netBenefit = incomeTaxSaved - taxOnSuperContribution;
  const weeklyTaxDecrease = incomeTaxSaved / 52;

  return {
    employerContribution,
    annualExtraContribution,
    totalConcessionalContribution,
    roomToContribute,
    capExceeded,
    incomeTaxSaved,
    netBenefit,
    weeklyTaxDecrease,
  };
};

const formatCurrency = (value: number) => value.toLocaleString('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 0 });

export default function MaximiseSuperPage() {
    const [results, setResults] = useState<CalculationResult | null>(null);

    const form = useForm<CalculatorFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            grossAnnualIncome: 80000,
            extraContribution: 0,
            contributionFrequency: "monthly",
        },
    });

    function onSubmit(values: CalculatorFormValues) {
        const result = calculateSuperDetails(values);
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
                        <CardTitle>Superannuation Contribution Calculator</CardTitle>
                        <CardDescription>See how extra contributions can boost your retirement savings and lower your tax.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                <FormField
                                    control={form.control}
                                    name="grossAnnualIncome"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Gross Annual Income ($)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g. 80000" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="extraContribution"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Additional Contribution ($)</FormLabel>
                                            <FormControl>
                                                <Input type="number" placeholder="e.g. 200" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="contributionFrequency"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Contribution Frequency</FormLabel>
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
                     <Card className="bg-sky-50">
                        <CardHeader>
                            <CardTitle className="text-sky-800">Your Super Potential 💰</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sky-700">
                             <div>
                                <p className="text-lg font-semibold">Net Annual Benefit</p>
                                <p className="text-2xl font-bold">{formatCurrency(results.netBenefit)}</p>
                                <p className="text-sm">This is your tax saving minus the 15% tax on contributions.</p>
                            </div>
                            <div>
                                <p className="text-lg font-semibold">Weekly Tax Reduction</p>
                                <p className="text-2xl font-bold">{formatCurrency(results.weeklyTaxDecrease)}</p>
                                <p className="text-sm">The amount of income tax saved from your pay each week.</p>
                            </div>

                            <div className="pt-4 border-t border-sky-200 space-y-2">
                                <p><strong>Employer Contribution (est.):</strong> {formatCurrency(results.employerContribution)}</p>
                                <p><strong>Your Additional Contribution (annual):</strong> {formatCurrency(results.annualExtraContribution)}</p>
                                <p className="font-bold"><strong>Total Annual Contribution:</strong> {formatCurrency(results.totalConcessionalContribution)}</p>
                                <p><strong>Concessional Cap:</strong> {formatCurrency(CONCESSIONAL_CAP)}</p>
                                {results.capExceeded ? (
                                     <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertTitle>Warning</AlertTitle>
                                        <AlertDescription>
                                            Your total contributions exceed the concessional cap. Additional tax may apply.
                                        </AlertDescription>
                                    </Alert>
                                ) : (
                                    <p><strong>Room remaining in cap:</strong> {formatCurrency(results.roomToContribute > 0 ? results.roomToContribute : 0)}</p>
                                )}
                            </div>
                             <div className="pt-4 text-xs text-slate-500">
                                <p>Disclaimer: Calculations are estimates based on 2023/24 income tax rates, a 12% Super Guarantee, and a $27,500 concessional contributions cap. These figures are subject to change. This is not financial advice.</p>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
