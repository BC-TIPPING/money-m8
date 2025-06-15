
import { useState } from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, ArrowLeft } from "lucide-react";
import clsx from "clsx";

const adventurousPanels = [
  { title: "Chart Your Journey", description: "Imagine your financial path as a wild trek — we help you map it out.", emoji: "🗺️" },
  { title: "Climb Your Goals", description: "Reach summits: home, wealth, freedom. We’re with you at every step.", emoji: "⛰️" },
  { title: "Navigate Uncertainty", description: "Weather every storm with insight and clarity, no matter the terrain.", emoji: "🌌" },
  { title: "Unlock Hidden Opportunities", description: "Discover financial secrets hidden in plain sight.", emoji: "🧭" },
  { title: "Equip for Adventure", description: "Tools, knowledge, confidence — your pack for the future.", emoji: "🛡️" },
];

const employmentStatuses = [
  "Full-Time", "Part-Time", "Casual/Contract", "Self-Employed", "Unemployed", "Retired", "Other"
];
const incomeConfidenceOptions = ["Yes", "Somewhat", "No"];
const financialKnowledgeLevels = ["High", "Medium", "Low"];
const investmentTypes = [
  "Stocks or ETFs", "Property", "Cryptocurrency", "Managed Funds", "None"
];
const goalOptions = [
  "Buy a house", "Improve financial literacy", "Set a budget", "Reduce debt",
  "Grow investments", "Save for a purchase", "Maximise Super", "Pay off home loan sooner", "Other"
];
const goalTimeframes = [
  "0–6 months", "6–12 months", "1–3 years", "3–5 years", "5+ years"
];
const debtTypeOptions = [
  "Credit Card", "Personal Loan", "Car Loan", "Boat/Leisure Loan",
  "BNPL (e.g. Afterpay)", "Mortgage", "Education Loan", "No current debt"
];
const debtConfidenceOptions = ["Yes", "Somewhat", "No"];
const steps = [
  "Employment & Income",
  "Budget",
  "Financial Knowledge",
  "Financial Goals",
  "Debts & Liabilities",
  "Additional Notes",
];

const CenteredCard = ({ children }: { children: React.ReactNode }) => (
  <section className="w-full flex flex-col items-center min-h-[100dvh] justify-center px-2 pt-8 pb-10">
    <div className="relative w-full max-w-2xl rounded-2xl shadow-xl p-8 md:p-12 bg-[rgba(29,33,48,0.95)] border border-[#383e5c]/50 backdrop-blur-lg">
      {children}
    </div>
  </section>
);

export default function Index() {
  const [step, setStep] = useState(0);

  const [employmentStatus, setEmploymentStatus] = useState<string | undefined>();
  const [hasRegularIncome, setHasRegularIncome] = useState<boolean | undefined>();
  const [incomeConfidence, setIncomeConfidence] = useState<string | undefined>();
  const [incomeSources, setIncomeSources] = useState([{ description: "", amount: "" }]);
  const [expenseItems, setExpenseItems] = useState([{ category: "", amount: "" }]);
  const [uploadBank, setUploadBank] = useState<File | null>(null);
  const [financialKnowledgeLevel, setFinancialKnowledgeLevel] = useState<string | undefined>();
  const [investmentExperience, setInvestmentExperience] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [otherGoal, setOtherGoal] = useState("");
  const [goalTimeframe, setGoalTimeframe] = useState<string | undefined>();
  const [debtTypes, setDebtTypes] = useState<string[]>([]);
  const [debtManagementConfidence, setDebtManagementConfidence] = useState<string | undefined>();
  const [freeTextComments, setFreeTextComments] = useState("");

  // Fix TS: pass value directly, not as a lambda
  const handleIncomeChange = (idx: number, key: "description" | "amount", value: string) => {
    setIncomeSources((prev) => {
      const next = [...prev];
      next[idx][key] = value;
      return next;
    });
  };
  const addIncomeSource = () => setIncomeSources([...incomeSources, { description: "", amount: "" }]);
  const removeIncomeSource = (idx: number) =>
    setIncomeSources(incomeSources.length === 1 ? incomeSources : incomeSources.filter((_, i) => i !== idx));

  const handleExpenseChange = (idx: number, key: "category" | "amount", value: string) => {
    setExpenseItems((prev) => {
      const next = [...prev];
      next[idx][key] = value;
      return next;
    });
  };
  const addExpenseItem = () => setExpenseItems([...expenseItems, { category: "", amount: "" }]);
  const removeExpenseItem = (idx: number) =>
    setExpenseItems(expenseItems.length === 1 ? expenseItems : expenseItems.filter((_, i) => i !== idx));
  const onBankFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) setUploadBank(e.target.files[0]);
    else setUploadBank(null);
  };

  const canGoNext =
    step === 0
      ? employmentStatus && hasRegularIncome !== undefined && incomeConfidence
      : step === 1
      ? (incomeSources.some((src) => src.description && src.amount) ||
          expenseItems.some((item) => item.category && item.amount) ||
          !!uploadBank)
      : step === 2
      ? financialKnowledgeLevel
      : step === 3
      ? (goals.length > 0 && goalTimeframe)
      : step === 4
      ? debtTypes.length > 0 && debtManagementConfidence
      : true;

  function renderStep() {
    switch (step) {
      case 0:
        return (
          <>
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm text-[#a9b4c8] font-medium">{`Step ${step + 1} of ${steps.length}`}</div>
                <div className="font-extrabold text-2xl text-white mt-2">{steps[step]}</div>
              </div>
              <div className="flex gap-3 items-center mt-4 md:mt-0">
                {steps.map((_, idx) => (
                  <span key={idx} className={clsx(
                    "w-3 h-3 rounded-full transition-all",
                    idx === step ? "bg-white shadow-lg scale-110" :
                    idx < step ? "bg-[#a9b4c8]/80" : "bg-[#262c3c]"
                  )} />
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-6 text-white">Employment & Income</h2>
              <div className="mb-6">
                <label className="font-semibold mb-2 block text-[#a9b4c8]">Employment Status</label>
                <RadioGroup value={employmentStatus} onValueChange={setEmploymentStatus} className="flex flex-wrap gap-3">
                  {employmentStatuses.map(stat => (
                    <RadioGroupItem
                      key={stat}
                      value={stat}
                      className={clsx(
                        "rounded border-2 bg-[#23273a] text-[#cfd5e4] px-4 py-2 font-semibold cursor-pointer transition",
                        employmentStatus === stat ? "border-white bg-white text-[#23273a] shadow-md" : "border-[#38405a]"
                      )}
                    >{stat}</RadioGroupItem>
                  ))}
                </RadioGroup>
              </div>
              <div className="mb-6">
                <span className="font-semibold block mb-2 text-[#a9b4c8]">Do you have a regular income?</span>
                <div className="flex gap-4">
                  <Button
                    type="button"
                    variant={hasRegularIncome === true ? "default" : "outline"}
                    className={clsx(
                      "rounded-lg px-6 py-2 text-lg font-semibold",
                      hasRegularIncome === true
                        ? "bg-white text-[#20232f] border-2 border-white shadow-lg"
                        : "bg-[#23273a] text-white border border-[#42475a]"
                    )}
                    onClick={() => setHasRegularIncome(true)}
                  >Yes</Button>
                  <Button
                    type="button"
                    variant={hasRegularIncome === false ? "default" : "outline"}
                    className={clsx(
                      "rounded-lg px-6 py-2 text-lg font-semibold",
                      hasRegularIncome === false
                        ? "bg-white text-[#20232f] border-2 border-white shadow-lg"
                        : "bg-[#23273a] text-white border border-[#42475a]"
                    )}
                    onClick={() => setHasRegularIncome(false)}
                  >No</Button>
                </div>
              </div>
              <div className="mb-2">
                <span className="font-semibold mb-2 block text-[#a9b4c8]">Are you confident in your income stability?</span>
                <RadioGroup value={incomeConfidence} onValueChange={setIncomeConfidence} className="flex gap-3">
                  {incomeConfidenceOptions.map(opt => (
                    <RadioGroupItem
                      key={opt}
                      value={opt}
                      className={clsx(
                        "rounded border-2 bg-[#23273a] text-[#cfd5e4] px-6 py-2 font-semibold cursor-pointer transition",
                        incomeConfidence === opt ? "border-white bg-white text-[#23273a] shadow-md" : "border-[#38405a]"
                      )}
                    >{opt}</RadioGroupItem>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </>
        );
      case 1:
        return (
          <>
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm text-[#a9b4c8] font-medium">{`Step ${step + 1} of ${steps.length}`}</div>
                <div className="font-extrabold text-2xl text-white mt-2">{steps[step]}</div>
              </div>
              <div className="flex gap-3 items-center mt-4 md:mt-0">
                {steps.map((_, idx) => (
                  <span key={idx} className={clsx(
                    "w-3 h-3 rounded-full transition-all",
                    idx === step ? "bg-white shadow-lg scale-110" :
                    idx < step ? "bg-[#a9b4c8]/80" : "bg-[#262c3c]"
                  )} />
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-6 text-white">Budget (Income & Expenses)</h2>
              {/* Income Sources */}
              <div className="mb-6">
                <label className="font-semibold mb-2 block text-[#a9b4c8]">Income Sources</label>
                <div className="space-y-3">
                  {incomeSources.map((src, idx) => (
                    <div className="flex gap-3" key={idx}>
                      <Input
                        placeholder="Income description"
                        value={src.description}
                        onChange={e => handleIncomeChange(idx, "description", e.target.value)}
                        className="flex-1 bg-[#23273a] text-white border-none focus:ring-2 focus:ring-blue-500"
                      />
                      <Input
                        placeholder="Amount"
                        type="number"
                        min={0}
                        value={src.amount}
                        onChange={e => handleIncomeChange(idx, "amount", e.target.value)}
                        className="w-[120px] bg-[#23273a] text-white border-none focus:ring-2 focus:ring-blue-500"
                      />
                      <Button size="icon" variant="ghost" onClick={() => removeIncomeSource(idx)} aria-label="Remove income source">
                        ×
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" className="mt-1" size="sm" onClick={addIncomeSource}>+ Add Income Source</Button>
                </div>
              </div>
              {/* Expenses */}
              <div className="mb-6">
                <label className="font-semibold mb-2 block text-[#a9b4c8]">Expenses (by category)</label>
                <div className="space-y-3">
                  {expenseItems.map((exp, idx) => (
                    <div className="flex gap-3" key={idx}>
                      <Input
                        placeholder="Expense category"
                        value={exp.category}
                        onChange={e => handleExpenseChange(idx, "category", e.target.value)}
                        className="flex-1 bg-[#23273a] text-white border-none focus:ring-2 focus:ring-blue-500"
                      />
                      <Input
                        placeholder="Amount"
                        type="number"
                        min={0}
                        value={exp.amount}
                        onChange={e => handleExpenseChange(idx, "amount", e.target.value)}
                        className="w-[120px] bg-[#23273a] text-white border-none focus:ring-2 focus:ring-blue-500"
                      />
                      <Button size="icon" variant="ghost" onClick={() => removeExpenseItem(idx)} aria-label="Remove expense item">
                        ×
                      </Button>
                    </div>
                  ))}
                  <Button variant="outline" className="mt-1" size="sm" onClick={addExpenseItem}>+ Add Expense</Button>
                </div>
              </div>
              {/* Bank Upload */}
              <div className="mt-8">
                <label className="mb-2 font-semibold block text-[#a9b4c8]">Or upload a bank statement (PDF or CSV):</label>
                <Input
                  type="file"
                  accept=".pdf,.csv"
                  onChange={onBankFileChange}
                  className="file:bg-[#283b59] file:text-white file:border-none"
                />
                {uploadBank && <span className="text-xs text-[#cfd5e4] mt-2 block">Uploaded: {uploadBank.name}</span>}
              </div>
            </div>
          </>
        );
      case 2:
        return (
          <>
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm text-[#a9b4c8] font-medium">{`Step ${step + 1} of ${steps.length}`}</div>
                <div className="font-extrabold text-2xl text-white mt-2">{steps[step]}</div>
              </div>
              <div className="flex gap-3 items-center mt-4 md:mt-0">
                {steps.map((_, idx) => (
                  <span key={idx} className={clsx(
                    "w-3 h-3 rounded-full transition-all",
                    idx === step ? "bg-white shadow-lg scale-110" :
                    idx < step ? "bg-[#a9b4c8]/80" : "bg-[#262c3c]"
                  )} />
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-6 text-white">Financial Knowledge</h2>
              <div className="mb-8">
                <span className="block font-semibold mb-2 text-[#a9b4c8]">How would you rate your financial knowledge?</span>
                <RadioGroup value={financialKnowledgeLevel} onValueChange={setFinancialKnowledgeLevel} className="flex gap-3">
                  {financialKnowledgeLevels.map(level => (
                    <RadioGroupItem
                      key={level}
                      value={level}
                      className={clsx(
                        "rounded border-2 bg-[#23273a] text-[#cfd5e4] px-6 py-2 font-semibold cursor-pointer transition",
                        financialKnowledgeLevel === level ? "border-white bg-white text-[#23273a] shadow-md" : "border-[#38405a]"
                      )}
                    >{level}</RadioGroupItem>
                  ))}
                </RadioGroup>
              </div>
              <div className="mb-2">
                <span className="block font-semibold mb-2 text-[#a9b4c8]">Investment experience (select all that apply):</span>
                <div className="flex flex-wrap gap-4">
                  {investmentTypes.map(inv => (
                    <label className="flex items-center gap-2 cursor-pointer" key={inv}>
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
                      <span className="text-[#cfd5e4] font-semibold">{inv}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </>
        );
      case 3:
        return (
          <>
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm text-[#a9b4c8] font-medium">{`Step ${step + 1} of ${steps.length}`}</div>
                <div className="font-extrabold text-2xl text-white mt-2">{steps[step]}</div>
              </div>
              <div className="flex gap-3 items-center mt-4 md:mt-0">
                {steps.map((_, idx) => (
                  <span key={idx} className={clsx(
                    "w-3 h-3 rounded-full transition-all",
                    idx === step ? "bg-white shadow-lg scale-110" :
                    idx < step ? "bg-[#a9b4c8]/80" : "bg-[#262c3c]"
                  )} />
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-6 text-white">Financial Goals</h2>
              <div className="mb-8">
                <span className="block font-semibold mb-2 text-[#a9b4c8]">What are your current financial goals?</span>
                <div className="flex flex-wrap gap-4">
                  {goalOptions.map(goal => (
                    goal === "Other" ? (
                      <label key={goal} className="flex items-center gap-2 cursor-pointer">
                        <Checkbox
                          checked={goals.includes("Other")}
                          onCheckedChange={checked =>
                            setGoals(checked
                              ? [...goals, "Other"]
                              : goals.filter(g => g !== "Other"))
                          }
                        />
                        <span className="text-[#cfd5e4] font-semibold">Other</span>
                        {goals.includes("Other") && (
                          <Input className="ml-1 bg-[#23273a] text-white border-none focus:ring-2 focus:ring-blue-500" value={otherGoal} onChange={e => setOtherGoal(e.target.value)} placeholder="Describe your goal" />
                        )}
                      </label>
                    ) : (
                      <label className="flex items-center gap-2 cursor-pointer" key={goal}>
                        <Checkbox
                          checked={goals.includes(goal)}
                          onCheckedChange={checked =>
                            setGoals(checked
                              ? [...goals, goal]
                              : goals.filter(g => g !== goal))
                          }
                        />
                        <span className="text-[#cfd5e4] font-semibold">{goal}</span>
                      </label>
                    )
                  ))}
                </div>
              </div>
              <div className="mb-2">
                <span className="block font-semibold mb-2 text-[#a9b4c8]">What is your goal timeframe?</span>
                <RadioGroup value={goalTimeframe} onValueChange={setGoalTimeframe} className="flex flex-wrap gap-3">
                  {goalTimeframes.map(g => (
                    <RadioGroupItem
                      key={g}
                      value={g}
                      className={clsx(
                        "rounded border-2 bg-[#23273a] text-[#cfd5e4] px-6 py-2 font-semibold cursor-pointer transition",
                        goalTimeframe === g ? "border-white bg-white text-[#23273a] shadow-md" : "border-[#38405a]"
                      )}
                    >{g}</RadioGroupItem>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </>
        );
      case 4:
        return (
          <>
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm text-[#a9b4c8] font-medium">{`Step ${step + 1} of ${steps.length}`}</div>
                <div className="font-extrabold text-2xl text-white mt-2">{steps[step]}</div>
              </div>
              <div className="flex gap-3 items-center mt-4 md:mt-0">
                {steps.map((_, idx) => (
                  <span key={idx} className={clsx(
                    "w-3 h-3 rounded-full transition-all",
                    idx === step ? "bg-white shadow-lg scale-110" :
                    idx < step ? "bg-[#a9b4c8]/80" : "bg-[#262c3c]"
                  )} />
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-6 text-white">Debts & Liabilities</h2>
              <div className="mb-8">
                <span className="block font-semibold mb-2 text-[#a9b4c8]">Which debts/liabilities do you currently hold?</span>
                <div className="flex flex-wrap gap-4">
                  {debtTypeOptions.map(dt => (
                    <label key={dt} className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={debtTypes.includes(dt)}
                        onCheckedChange={checked =>
                          setDebtTypes(checked
                            ? [...debtTypes, dt]
                            : debtTypes.filter(t => t !== dt))
                        }
                      />
                      <span className="text-[#cfd5e4] font-semibold">{dt}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="mb-2">
                <span className="block font-semibold mb-2 text-[#a9b4c8]">Are you confident in your ability to manage your debts?</span>
                <RadioGroup value={debtManagementConfidence} onValueChange={setDebtManagementConfidence} className="flex gap-3">
                  {debtConfidenceOptions.map(opt => (
                    <RadioGroupItem
                      key={opt}
                      value={opt}
                      className={clsx(
                        "rounded border-2 bg-[#23273a] text-[#cfd5e4] px-6 py-2 font-semibold cursor-pointer transition",
                        debtManagementConfidence === opt ? "border-white bg-white text-[#23273a] shadow-md" : "border-[#38405a]"
                      )}
                    >{opt}</RadioGroupItem>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </>
        );
      case 5:
        return (
          <>
            <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="text-sm text-[#a9b4c8] font-medium">{`Step ${step + 1} of ${steps.length}`}</div>
                <div className="font-extrabold text-2xl text-white mt-2">{steps[step]}</div>
              </div>
              <div className="flex gap-3 items-center mt-4 md:mt-0">
                {steps.map((_, idx) => (
                  <span key={idx} className={clsx(
                    "w-3 h-3 rounded-full transition-all",
                    idx === step ? "bg-white shadow-lg scale-110" :
                    idx < step ? "bg-[#a9b4c8]/80" : "bg-[#262c3c]"
                  )} />
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold mb-6 text-white">Additional Notes</h2>
              <div className="mb-6">
                <label className="block font-semibold mb-2 text-[#a9b4c8]" htmlFor="freeResponse">
                  Anything else you'd like to share?
                </label>
                <Textarea
                  id="freeResponse"
                  placeholder="Leave any comments or special needs here…"
                  value={freeTextComments}
                  onChange={e => setFreeTextComments(e.target.value)}
                  className="resize-vertical min-h-[80px] bg-[#23273a] text-white border-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-[#afbad9] mt-2">Optional</p>
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  }

  function renderSuccess() {
    return (
      <div className="flex flex-col items-center justify-center min-h-[42vh] py-12">
        <h2 className="text-2xl font-bold mb-4 text-white">Thank you!</h2>
        <div className="text-lg font-semibold mb-2 text-[#89c5e6]">Assessment completed 🎉</div>
        <p className="mb-2 text-[#b5b5cc] text-center">
          We’re analyzing your responses to personalize your financial profile, tools and action steps.
        </p>
        <div className="bg-muted rounded-lg p-4 mt-3 text-sm text-[#b5b5cc] text-center">
          <strong>What's next?</strong> You’ll soon be able to: review your answers, set detailed budgets/goals, get a personalized roadmap, and play with powerful financial calculators.
        </div>
        <Button className="mt-6" onClick={() => window.location.reload()}>Close</Button>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStep(step + 1);
  };

  return (
    <div className="w-full min-h-screen relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#202336] via-[#28365a] to-[#191d29]">
      {/* Aurora and starfield */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute left-0 top-0 w-[120%] h-[90%] -translate-x-1/12 -translate-y-1/12 bg-gradient-to-br from-[#211e50] via-[#253472] to-transparent animate-[move-bg_16s_ease-in-out_infinite_alternate] opacity-60 blur-2xl" />
        <div className="absolute right-[-15%] bottom-[-8%] w-[600px] h-[400px] bg-gradient-to-br from-[#46b1ea] via-transparent to-[#9989c4] rounded-full blur-3xl opacity-30 animate-pulse" />
        {/* Subtle starfield */}
        <svg className="absolute inset-0 w-full h-full opacity-20" style={{zIndex:1}} xmlns="http://www.w3.org/2000/svg">
          <circle cx="10%" cy="20%" r="1" fill="#fff" />
          <circle cx="30%" cy="80%" r="1" fill="#fff" />
          <circle cx="70%" cy="15%" r="0.7" fill="#fff" />
          <circle cx="85%" cy="50%" r="1.2" fill="#fff" />
          <circle cx="52%" cy="72%" r="0.6" fill="#fff" />
          <circle cx="60%" cy="35%" r="1.4" fill="#fff" />
          <circle cx="24%" cy="64%" r="1" fill="#fff" />
          <circle cx="45%" cy="38%" r="0.7" fill="#fff" />
        </svg>
      </div>
      {/* MAIN HERO CONTENT */}
      <main className="relative z-10 w-full flex flex-col items-center mt-6 md:mt-8 px-2">
        <h1 className="text-3xl md:text-5xl font-extrabold mb-4 md:mb-8 text-center tracking-tight bg-gradient-to-r from-[#89c5e6] via-[#fac778] to-[#9bf0e1] text-transparent bg-clip-text animate-fade-in">
          Get a clear picture of your finances – no jargon, no stress
        </h1>
        <p className="text-lg text-[#b5b5cc] mb-10 max-w-xl text-center animate-fade-in">
          Start your journey to financial clarity. Take a quick assessment to receive tailored insights, education, and actionable next steps. Private, secure, and stress‑free.
        </p>
        {/* Carousel panel */}
        <section className="w-full max-w-2xl mb-10">
          <Carousel opts={{ align: "center", loop: true }} className="w-full">
            <CarouselContent>
              {adventurousPanels.map((panel, i) => (
                <CarouselItem key={i} className="px-1 py-4">
                  <div className="bg-[#22273c] border border-[#393e54]/60 rounded-2xl shadow-xl p-6 flex flex-col items-center gap-2 transition-all hover-scale">
                    <span className="text-4xl">{panel.emoji}</span>
                    <span className="font-bold text-xl text-sky-200">{panel.title}</span>
                    <span className="text-base text-[#b5b5cc] text-center">{panel.description}</span>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        </section>
        {/* Embedded Survey Card */}
        <CenteredCard>
          <form onSubmit={handleSubmit} autoComplete="off">
            {step <= 5 ? renderStep() : renderSuccess()}
            {/* Navigation */}
            {step <= 5 && (
              <div className="flex justify-between items-center mt-10 pt-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex gap-1 items-center rounded-lg px-6 py-2"
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
                    className="flex gap-1 items-center rounded-lg px-8 py-2 text-lg font-bold"
                    disabled={!canGoNext}
                  >
                    Next
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                )}
                {step === steps.length - 1 && (
                  <Button
                    type="submit"
                    className="flex gap-1 items-center rounded-lg px-8 py-2 text-lg font-bold"
                  >
                    Finish
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                )}
              </div>
            )}
          </form>
        </CenteredCard>
      </main>
      <footer className="mt-10 mb-6 text-xs text-[#7d7ead] z-10 text-center">
        &copy; {new Date().getFullYear()} ClearFin.AI&nbsp;&nbsp;|&nbsp;&nbsp;No financial advice, just clarity.
      </footer>
      {/* Keyframes */}
      <style>
        {`
          @keyframes move-bg {
            0% { transform: translate(-10%, -10%) scale(1);}
            100% { transform: translate(-3%, 10%) scale(1.1);}
          }
        `}
      </style>
    </div>
  );
}
