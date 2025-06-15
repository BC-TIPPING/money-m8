import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, ArrowRight, ArrowLeft } from "lucide-react";
import clsx from "clsx";
import { INCOME_FREQUENCIES, PRELOADED_EXPENSE_CATEGORIES } from "@/lib/budgetCategories";

type EmploymentStatus =
  | "Full-Time"
  | "Part-Time"
  | "Casual/Contract"
  | "Self-Employed"
  | "Unemployed"
  | "Retired"
  | "Other";

type FinancialKnowledgeLevel = "High" | "Medium" | "Low";
type YesSomewhatNo = "Yes" | "Somewhat" | "No";

const employmentStatuses: EmploymentStatus[] = [
  "Full-Time",
  "Part-Time",
  "Casual/Contract",
  "Self-Employed",
  "Unemployed",
  "Retired",
  "Other",
];

const financialKnowledgeLevels: FinancialKnowledgeLevel[] = [
  "High",
  "Medium",
  "Low",
];

const investmentTypes = [
  "Stocks or ETFs",
  "Property",
  "Cryptocurrency",
  "Managed Funds",
  "None",
];

const debtTypeOptions = [
  "Credit Card",
  "Personal Loan",
  "Car Loan",
  "Boat/Leisure Loan",
  "BNPL (e.g. Afterpay)",
  "Mortgage",
  "Education Loan",
  "No current debt",
];

const debtConfidenceOptions: YesSomewhatNo[] = ["Yes", "Somewhat", "No"];

const PRELOADED_INCOME_CATEGORIES = [
  "Salary",
  "Investments",
  "Business Income",
  "Rental Income",
  "Other",
];

const steps = [
  "Employment & Income",
  "Budget",
  "Financial Knowledge",
  "Debts & Liabilities",
  "Additional Notes",
];

function FinancialAssessmentModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [step, setStep] = useState(0);

  // Form State
  const [employmentStatus, setEmploymentStatus] = useState<EmploymentStatus | undefined>();
  const [hasRegularIncome, setHasRegularIncome] = useState<boolean | undefined>();
  const [incomeSources, setIncomeSources] = useState([{ category: "", amount: "", frequency: "Monthly" }]);
  const [expenseItems, setExpenseItems] = useState(PRELOADED_EXPENSE_CATEGORIES.map(category => ({ category, amount: "", frequency: "Monthly" })));
  const [uploadBank, setUploadBank] = useState<File | null>(null);
  const [financialKnowledgeLevel, setFinancialKnowledgeLevel] = useState<FinancialKnowledgeLevel | undefined>();
  const [investmentExperience, setInvestmentExperience] = useState<string[]>([]);
  const [debtTypes, setDebtTypes] = useState<string[]>([]);
  const [debtManagementConfidence, setDebtManagementConfidence] = useState<YesSomewhatNo | undefined>();
  const [freeTextComments, setFreeTextComments] = useState("");

  // Budget form manual add income/expense functions
  const handleIncomeChange = (idx: number, key: "category" | "amount" | "frequency", value: string) => {
    setIncomeSources((prev) => {
      const next = [...prev];
      const source = next[idx] as any;
      source[key] = value;
      return next;
    });
  };
  const addIncomeSource = () => setIncomeSources([...incomeSources, { category: "", amount: "", frequency: "Monthly" }]);
  const removeIncomeSource = (idx: number) =>
    setIncomeSources(incomeSources.length === 1 ? incomeSources : incomeSources.filter((_, i) => i !== idx));

  const handleExpenseChange = (idx: number, key: "category" | "amount" | "frequency", value: string) => {
    setExpenseItems((prev) => {
      const next = [...prev];
      (next[idx] as any)[key] = value;
      return next;
    });
  };
  const addExpenseItem = () => setExpenseItems([...expenseItems, { category: "", amount: "", frequency: "Monthly" }]);
  const removeExpenseItem = (idx: number) =>
    setExpenseItems(expenseItems.length === 1 ? expenseItems : expenseItems.filter((_, i) => i !== idx));
    
  const handleAllExpenseFrequenciesChange = (newFrequency: string) => {
    setExpenseItems(prevItems =>
        prevItems.map(item => ({ ...item, frequency: newFrequency }))
    );
  };

  // File upload
  const onBankFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) setUploadBank(e.target.files[0]);
    else setUploadBank(null);
  };

  // Step logic
  const canGoNext =
    step === 0
      ? employmentStatus && hasRegularIncome !== undefined
      : step === 1
      ? (incomeSources.some((src) => src.category && src.amount) ||
          expenseItems.some((item) => item.category && item.amount) ||
          !!uploadBank)
      : step === 2
      ? financialKnowledgeLevel
      : step === 3
      ? debtTypes.length > 0 && debtManagementConfidence
      : true;

  // Reset form when modal is closed
  const handleClose = () => {
    setStep(0);
    setEmploymentStatus(undefined);
    setHasRegularIncome(undefined);
    setIncomeSources([{ category: "", amount: "", frequency: "Monthly" }]);
    setExpenseItems(PRELOADED_EXPENSE_CATEGORIES.map(category => ({ category, amount: "", frequency: "Monthly" })));
    setUploadBank(null);
    setFinancialKnowledgeLevel(undefined);
    setInvestmentExperience([]);
    setDebtTypes([]);
    setDebtManagementConfidence(undefined);
    setFreeTextComments("");
    onClose();
  };

  // Step content
  function renderStep() {
    switch (step) {
      case 0:
        return (
          <section className="animate-fade-in">
            <DialogTitle className="mb-2 text-xl">Employment & Income</DialogTitle>
            <div className="flex flex-col gap-4">
              <div>
                <label className="font-medium mb-1 block">Employment Status</label>
                <RadioGroup value={employmentStatus} onValueChange={val => setEmploymentStatus(val as EmploymentStatus)} className="flex flex-wrap gap-2">
                  {employmentStatuses.map(stat => (
                    <RadioGroupItem
                      key={stat}
                      value={stat}
                      className={clsx("rounded p-2 flex items-center", employmentStatus === stat && "border-primary ring-2 ring-primary")}
                    >{stat}</RadioGroupItem>
                  ))}
                </RadioGroup>
              </div>
              <div>
                <span className="font-medium block mb-1">Do you have a regular income?</span>
                <div className="flex gap-5">
                  <Button
                    type="button"
                    variant={hasRegularIncome === true ? "default" : "outline"}
                    onClick={() => setHasRegularIncome(true)}
                  >
                    Yes
                  </Button>
                  <Button
                    type="button"
                    variant={hasRegularIncome === false ? "default" : "outline"}
                    onClick={() => setHasRegularIncome(false)}
                  >
                    No
                  </Button>
                </div>
              </div>
            </div>
          </section>
        );
      case 1:
        return (
          <section className="animate-fade-in">
            <DialogTitle className="mb-2 text-xl">Budget (Income & Expenses)</DialogTitle>
            <div className="mb-4">
              <label className="font-medium mb-2 block">Gross Income Sources</label>
              <p className="text-xs text-muted-foreground -mt-1 mb-2">Enter your income before tax.</p>
              <div className="space-y-2">
                {incomeSources.map((src, idx) => (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center" key={idx}>
                    <Select
                      value={src.category}
                      onValueChange={(val) => handleIncomeChange(idx, "category", val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {PRELOADED_INCOME_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Amount"
                      type="number"
                      min={0}
                      value={src.amount}
                      onChange={(e) => handleIncomeChange(idx, "amount", e.target.value)}
                    />
                    <div className="flex gap-2 items-center">
                      <Select
                        value={src.frequency}
                        onValueChange={(val) => handleIncomeChange(idx, "frequency", val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          {INCOME_FREQUENCIES.map((freq) => (
                            <SelectItem key={freq} value={freq}>
                              {freq}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button size="icon" variant="ghost" onClick={() => removeIncomeSource(idx)} aria-label="Remove income source">
                        <X size={18} />
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="mt-1" size="sm" onClick={addIncomeSource}>+ Add Income Source</Button>
              </div>
            </div>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium block">Expenses (by category)</label>
                <div className="flex items-center gap-2">
                    <label className="text-sm">Set all to:</label>
                    <Select onValueChange={handleAllExpenseFrequenciesChange}>
                        <SelectTrigger className="w-[120px] h-8 text-xs">
                            <SelectValue placeholder="Frequency" />
                        </SelectTrigger>
                        <SelectContent>
                            {INCOME_FREQUENCIES.map((freq) => (
                                <SelectItem key={freq} value={freq}>
                                    {freq}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
              </div>
              <div className="space-y-2">
                {expenseItems.map((exp, idx) => (
                  <div className="grid grid-cols-[1fr_100px_120px_auto] gap-2 items-center" key={idx}>
                    <Input
                      placeholder="Expense category"
                      value={exp.category}
                      onChange={e => handleExpenseChange(idx, "category", e.target.value)}
                    />
                    <Input
                      placeholder="Amount"
                      type="number"
                      min={0}
                      value={exp.amount}
                      onChange={e => handleExpenseChange(idx, "amount", e.target.value)}
                    />
                    <Select
                        value={exp.frequency}
                        onValueChange={(val) => handleExpenseChange(idx, "frequency", val)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          {INCOME_FREQUENCIES.map((freq) => (
                            <SelectItem key={freq} value={freq}>
                              {freq}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    <Button size="icon" variant="ghost" onClick={() => removeExpenseItem(idx)} aria-label="Remove expense item">
                      <X size={18} />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" className="mt-1" size="sm" onClick={addExpenseItem}>+ Add Expense</Button>
              </div>
            </div>
            <div className="mt-6">
              <label className="mb-1 font-medium block">Or upload a bank statement (PDF or CSV):</label>
              <Input
                type="file"
                accept=".pdf,.csv"
                onChange={onBankFileChange}
                className="file:border-none file:bg-muted file:font-medium file:py-1 file:px-3"
              />
              {uploadBank && (
                <span className="text-xs text-muted-foreground mt-1 block">Uploaded: {uploadBank.name}</span>
              )}
            </div>
          </section>
        );
      case 2:
        return (
          <section className="animate-fade-in">
            <DialogTitle className="mb-2 text-xl">Financial Knowledge</DialogTitle>
            <div className="mb-4">
              <span className="block font-medium mb-1">How would you rate your financial knowledge?</span>
              <RadioGroup
                value={financialKnowledgeLevel}
                onValueChange={val => setFinancialKnowledgeLevel(val as FinancialKnowledgeLevel)}
                className="flex gap-2"
              >
                {financialKnowledgeLevels.map(level => (
                  <RadioGroupItem
                    key={level}
                    value={level}
                    className={clsx("rounded p-2", financialKnowledgeLevel === level && "border-primary ring-2 ring-primary")}
                  >{level}</RadioGroupItem>
                ))}
              </RadioGroup>
            </div>
            <div className="mb-4">
              <span className="block font-medium mb-1">Investment experience (select all that apply):</span>
              <div className="flex flex-wrap gap-2">
                {investmentTypes.map(inv => (
                  <label className="flex items-center gap-1" key={inv}>
                    <Checkbox
                      checked={investmentExperience.includes(inv)}
                      onCheckedChange={(checked) =>
                        setInvestmentExperience((prev) =>
                          checked
                            ? [...prev, inv]
                            : prev.filter((i) => i !== inv)
                        )
                      }
                    />
                    <span>{inv}</span>
                  </label>
                ))}
              </div>
            </div>
          </section>
        );
      case 3:
        return (
          <section className="animate-fade-in">
            <DialogTitle className="mb-2 text-xl">Debts & Liabilities</DialogTitle>
            <div className="mb-4">
              <span className="block font-medium mb-1">Which debts/liabilities do you currently hold?</span>
              <div className="flex flex-wrap gap-2">
                {debtTypeOptions.map(dt => (
                  <label key={dt} className="flex items-center gap-1">
                    <Checkbox
                      checked={debtTypes.includes(dt)}
                      onCheckedChange={checked =>
                        setDebtTypes(checked
                          ? [...debtTypes, dt]
                          : debtTypes.filter(t => t !== dt))
                      }
                    />
                    <span>{dt}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="mb-4">
              <span className="block font-medium mb-1">Are you confident in your ability to manage your debts?</span>
              <RadioGroup value={debtManagementConfidence} onValueChange={val => setDebtManagementConfidence(val as YesSomewhatNo)} className="flex gap-2">
                {debtConfidenceOptions.map(opt => (
                  <RadioGroupItem
                    key={opt}
                    value={opt}
                    className={clsx("rounded p-2", debtManagementConfidence === opt && "border-primary ring-2 ring-primary")}
                  >{opt}</RadioGroupItem>
                ))}
              </RadioGroup>
            </div>
          </section>
        );
      case 4:
        return (
          <section className="animate-fade-in">
            <DialogTitle className="mb-2 text-xl">Additional Notes</DialogTitle>
            <div className="mb-4">
              <label className="block font-medium mb-1" htmlFor="freeResponse">
                Anything else you'd like to share?
              </label>
              <Textarea
                id="freeResponse"
                placeholder="Leave any comments or special needs here…"
                value={freeTextComments}
                onChange={e => setFreeTextComments(e.target.value)}
                className="resize-vertical min-h-[80px]"
              />
              <p className="text-xs text-muted-foreground mt-2">Optional</p>
            </div>
          </section>
        );
      default:
        return null;
    }
  }

  // Submit handler placeholder
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(step + 1);
  };

  // Show completion after all steps are done
  if (step > 4)
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Thank you!</DialogTitle>
          </DialogHeader>
          <div className="my-6">
            <div className="text-xl font-semibold mb-2">Assessment completed 🎉</div>
            <p className="mb-2 text-muted-foreground">
              We’re analyzing your responses to personalize your financial profile, tools and action steps.
              <br />
              <span className="text-primary font-semibold">Section 2</span> (goal-driven plans and modeling) and <span className="text-primary font-semibold">Section 3</span> (analysis, tools, and simulations) coming soon!
            </p>
            <div className="bg-muted rounded-lg p-4 mt-3 text-sm text-muted-foreground">
              <strong>What's next?</strong> <br />
              You’ll soon be able to: review your answers, set detailed budgets/goals, get a personalized roadmap, and play with powerful financial calculators.
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl p-0 overflow-visible animate-scale-in">
        <DialogHeader className="px-6 pt-6 pb-3 flex flex-row items-start justify-between">
          <div>
            <DialogTitle className="text-2xl">{steps[step]}</DialogTitle>
            <div className="text-sm text-muted-foreground mt-1">Step {step + 1} of {steps.length}</div>
          </div>
          <DialogClose asChild>
            <button className="hover:bg-muted rounded-full p-1.5 transition" aria-label="Close assessment modal">
              <X className="w-5 h-5" />
            </button>
          </DialogClose>
        </DialogHeader>
        {/* Stepper */}
        <div className="flex py-2 px-6 gap-2 mb-2">
          {steps.map((label, idx) => (
            <div key={label} className="flex flex-col items-center flex-1">
              <div
                className={clsx(
                  "w-3 h-3 rounded-full transition",
                  idx === step
                    ? "bg-primary"
                    : idx < step
                    ? "bg-primary/70"
                    : "bg-muted"
                )}
              />
              {idx < steps.length - 1 && (
                <span
                  className={clsx(
                    "h-1 w-full rounded bg-muted/80 block",
                    idx < step ? "bg-primary/40" : ""
                  )}
                />
              )}
            </div>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="px-6 pb-6 pt-2">
          {renderStep()}
          <div className="flex justify-between items-center mt-8">
            <Button
              type="button"
              variant="outline"
              className="flex gap-1 items-center"
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div className="flex-1" />
            {step < steps.length - 1 && (
              <Button
                type="submit"
                className="flex gap-1 items-center"
                disabled={!canGoNext}
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
            {step === steps.length - 1 && (
              <Button type="submit" className="flex gap-1 items-center">
                Finish
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default FinancialAssessmentModal;
