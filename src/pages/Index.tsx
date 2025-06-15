
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
import { ArrowRight, ArrowLeft, X } from "lucide-react";
import clsx from "clsx";

const adventurousPanels = [
  { title: "Chart Your Journey", description: "Imagine your financial path as a wild trek — we help you map it out.", emoji: "🗺️" },
  { title: "Climb Your Goals", description: "Reach summits: home, wealth, freedom. We’re with you at every step.", emoji: "⛰️" },
  { title: "Navigate Uncertainty", description: "Weather every storm with insight and clarity, no matter the terrain.", emoji: "🌌" },
  { title: "Unlock Hidden Opportunities", description: "Discover financial secrets hidden in plain sight.", emoji: "🧭" },
  { title: "Equip for Adventure", description: "Tools, knowledge, confidence — your pack for the future.", emoji: "🛡️" },
];

// Survey options (mirror original logic)
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

// Main assessment form logic
const Index = () => {
  const [step, setStep] = useState(0);

  // Form State (Mirror logic)
  const [employmentStatus, setEmploymentStatus] = useState();
  const [hasRegularIncome, setHasRegularIncome] = useState();
  const [incomeConfidence, setIncomeConfidence] = useState();
  const [incomeSources, setIncomeSources] = useState([{ description: "", amount: "" }]);
  const [expenseItems, setExpenseItems] = useState([{ category: "", amount: "" }]);
  const [uploadBank, setUploadBank] = useState(null);
  const [financialKnowledgeLevel, setFinancialKnowledgeLevel] = useState();
  const [investmentExperience, setInvestmentExperience] = useState([]);
  const [goals, setGoals] = useState([]);
  const [otherGoal, setOtherGoal] = useState("");
  const [goalTimeframe, setGoalTimeframe] = useState();
  const [debtTypes, setDebtTypes] = useState([]);
  const [debtManagementConfidence, setDebtManagementConfidence] = useState();
  const [freeTextComments, setFreeTextComments] = useState("");

  // Budget form manual add income/expense functions
  const handleIncomeChange = (idx, key, value) => {
    setIncomeSources((prev) => {
      const next = [...prev];
      next[idx][key] = value;
      return next;
    });
  };
  const addIncomeSource = () => setIncomeSources([...incomeSources, { description: "", amount: "" }]);
  const removeIncomeSource = (idx) =>
    setIncomeSources(incomeSources.length === 1 ? incomeSources : incomeSources.filter((_, i) => i !== idx));
  const handleExpenseChange = (idx, key, value) => {
    setExpenseItems((prev) => {
      const next = [...prev];
      next[idx][key] = value;
      return next;
    });
  };
  const addExpenseItem = () => setExpenseItems([...expenseItems, { category: "", amount: "" }]);
  const removeExpenseItem = (idx) =>
    setExpenseItems(expenseItems.length === 1 ? expenseItems : expenseItems.filter((_, i) => i !== idx));
  // File upload
  const onBankFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) setUploadBank(e.target.files[0]);
    else setUploadBank(null);
  };

  // Step logic
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

  // Step content
  function renderStep() {
    switch (step) {
      case 0:
        return (
          <section>
            <h2 className="text-2xl font-semibold mb-3">Employment & Income</h2>
            <div className="flex flex-col gap-6">
              <div>
                <label className="font-medium mb-2 block">Employment Status</label>
                <RadioGroup value={employmentStatus} onValueChange={val => setEmploymentStatus(val)} className="flex flex-wrap gap-2">
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
                <span className="font-medium block mb-2">Do you have a regular income?</span>
                <div className="flex gap-5">
                  <Button
                    type="button"
                    variant={hasRegularIncome === true ? "default" : "outline"}
                    onClick={() => setHasRegularIncome(true)}
                  >Yes</Button>
                  <Button
                    type="button"
                    variant={hasRegularIncome === false ? "default" : "outline"}
                    onClick={() => setHasRegularIncome(false)}
                  >No</Button>
                </div>
              </div>
              <div>
                <span className="font-medium mb-2 block">Are you confident in your income stability?</span>
                <RadioGroup value={incomeConfidence} onValueChange={val => setIncomeConfidence(val)} className="flex gap-2">
                  {incomeConfidenceOptions.map(opt => (
                    <RadioGroupItem
                      key={opt}
                      value={opt}
                      className={clsx("rounded p-2", incomeConfidence === opt && "border-primary ring-2 ring-primary")}
                    >{opt}</RadioGroupItem>
                  ))}
                </RadioGroup>
              </div>
            </div>
          </section>
        );
      case 1:
        return (
          <section>
            <h2 className="text-2xl font-semibold mb-3">Budget (Income & Expenses)</h2>
            <div className="mb-4">
              <label className="font-medium mb-2 block">Income Sources</label>
              <div className="space-y-2">
                {incomeSources.map((src, idx) => (
                  <div className="flex gap-2" key={idx}>
                    <Input placeholder="Income description" value={src.description} onChange={e => handleIncomeChange(idx, "description", e.target.value)} className="flex-1"/>
                    <Input placeholder="Amount" type="number" min={0} value={src.amount} onChange={e => handleIncomeChange(idx, "amount", e.target.value)} className="w-[120px]"/>
                    <Button size="icon" variant="ghost" onClick={() => removeIncomeSource(idx)} aria-label="Remove income source">
                      <X size={18} />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" className="mt-1" size="sm" onClick={addIncomeSource}>+ Add Income Source</Button>
              </div>
            </div>
            <div className="mb-4">
              <label className="font-medium mb-2 block">Expenses (by category)</label>
              <div className="space-y-2">
                {expenseItems.map((exp, idx) => (
                  <div className="flex gap-2" key={idx}>
                    <Input placeholder="Expense category" value={exp.category} onChange={e => handleExpenseChange(idx, "category", e.target.value)} className="flex-1"/>
                    <Input placeholder="Amount" type="number" min={0} value={exp.amount} onChange={e => handleExpenseChange(idx, "amount", e.target.value)} className="w-[120px]"/>
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
              <Input type="file" accept=".pdf,.csv" onChange={onBankFileChange} className="file:border-none file:bg-muted file:font-medium file:py-1 file:px-3"/>
              {uploadBank && (<span className="text-xs text-muted-foreground mt-1 block">Uploaded: {uploadBank.name}</span>)}
            </div>
          </section>
        );
      case 2:
        return (
          <section>
            <h2 className="text-2xl font-semibold mb-3">Financial Knowledge</h2>
            <div className="mb-4">
              <span className="block font-medium mb-2">How would you rate your financial knowledge?</span>
              <RadioGroup value={financialKnowledgeLevel} onValueChange={val => setFinancialKnowledgeLevel(val)} className="flex gap-2">
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
              <span className="block font-medium mb-2">Investment experience (select all that apply):</span>
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
          <section>
            <h2 className="text-2xl font-semibold mb-3">Financial Goals</h2>
            <div className="mb-4">
              <span className="block font-medium mb-2">What are your current financial goals?</span>
              <div className="flex flex-wrap gap-2">
                {goalOptions.map(goal => (
                  goal === "Other" ? (
                    <label key={goal} className="flex items-center gap-1">
                      <Checkbox
                        checked={goals.includes("Other")}
                        onCheckedChange={checked =>
                          setGoals(checked
                            ? [...goals, "Other"]
                            : goals.filter(g => g !== "Other"))
                        }
                      />
                      <span>Other</span>
                      {goals.includes("Other") && (
                        <Input className="ml-1" value={otherGoal} onChange={e => setOtherGoal(e.target.value)} placeholder="Describe your goal" />
                      )}
                    </label>
                  ) : (
                    <label className="flex items-center gap-1" key={goal}>
                      <Checkbox
                        checked={goals.includes(goal)}
                        onCheckedChange={checked =>
                          setGoals(checked
                            ? [...goals, goal]
                            : goals.filter(g => g !== goal))
                        }
                      />
                      <span>{goal}</span>
                    </label>
                  )
                ))}
              </div>
            </div>
            <div className="mb-4">
              <span className="block font-medium mb-2">What is your goal timeframe?</span>
              <RadioGroup value={goalTimeframe} onValueChange={(val) => setGoalTimeframe(val)} className="flex flex-wrap gap-2">
                {goalTimeframes.map(g => (
                  <RadioGroupItem
                    key={g}
                    value={g}
                    className={clsx("rounded p-2", goalTimeframe === g && "border-primary ring-2 ring-primary")}
                  >{g}</RadioGroupItem>
                ))}
              </RadioGroup>
            </div>
          </section>
        );
      case 4:
        return (
          <section>
            <h2 className="text-2xl font-semibold mb-3">Debts & Liabilities</h2>
            <div className="mb-4">
              <span className="block font-medium mb-2">Which debts/liabilities do you currently hold?</span>
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
              <span className="block font-medium mb-2">Are you confident in your ability to manage your debts?</span>
              <RadioGroup value={debtManagementConfidence} onValueChange={val => setDebtManagementConfidence(val)} className="flex gap-2">
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
      case 5:
        return (
          <section>
            <h2 className="text-2xl font-semibold mb-3">Additional Notes</h2>
            <div className="mb-4">
              <label className="block font-medium mb-2" htmlFor="freeResponse">
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

  function renderSuccess() {
    return (
      <section className="bg-[#1f2330]/85 p-10 rounded-2xl shadow-2xl max-w-2xl mx-auto flex flex-col items-center mt-10 animate-fade-in border border-[#393e54]/60">
        <h2 className="text-2xl font-bold mb-4">Thank you!</h2>
        <div className="text-xl font-semibold mb-2">Assessment completed 🎉</div>
        <p className="mb-2 text-muted-foreground text-center">
          We’re analyzing your responses to personalize your financial profile, tools and action steps.
        </p>
        <div className="bg-muted rounded-lg p-4 mt-3 text-sm text-muted-foreground text-center">
          <strong>What's next?</strong> You’ll soon be able to: review your answers, set detailed budgets/goals, get a personalized roadmap, and play with powerful financial calculators.
        </div>
        <Button className="mt-6" onClick={() => window.location.reload()}>Close</Button>
      </section>
    );
  }

  // Submit handler placeholder
  const handleSubmit = (e) => {
    e.preventDefault();
    setStep(step + 1);
  };

  return (
    <div className="w-full min-h-screen relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#191d29] via-[#23263a] to-[#282e3a]">
      {/* Aurora and starfield background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Animated aurora */}
        <div className="absolute left-0 top-0 w-[120%] h-[90%] -translate-x-1/12 -translate-y-1/12 bg-gradient-to-br from-[#211e50] via-[#253472] to-transparent animate-[move-bg_16s_ease-in-out_infinite_alternate] opacity-50 blur-2xl" style={{animationName:"move-bg"}} />
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
      <main className="relative z-10 w-full flex flex-col items-center mt-8 px-2">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-5 text-center tracking-tight bg-gradient-to-r from-[#89c5e6] via-[#fac778] to-[#9bf0e1] text-transparent bg-clip-text animate-fade-in">
          Get a clear picture of your finances – no jargon, no stress
        </h1>
        <p className="text-lg text-[#b5b5cc] mb-8 max-w-xl text-center animate-fade-in">
          Start your journey to financial clarity. Take a quick assessment to receive tailored insights, education, and actionable next steps. Private, secure, and stress‑free.
        </p>
        {/* Rolling selection panel / carousel */}
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

        {/* Modern embedded survey form */}
        <section className="w-full flex items-center justify-center">
          <form
            onSubmit={handleSubmit}
            className="w-full max-w-2xl bg-[#171b25]/80 border border-[#393e54]/50 rounded-2xl shadow-2xl p-[2.6rem] mx-auto z-20 animate-fade-in backdrop-blur-xl"
            style={{
              minHeight: '420px'
            }}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <div className="mb-2 md:mb-0">
                <span className="text-sm text-muted-foreground font-medium">Step {step + 1} of {steps.length}</span>
                <div className="font-semibold text-xl mt-2 text-white">{steps[step]}</div>
              </div>
              {/* Stepper */}
              <div className="flex gap-3 items-center flex-1 md:justify-end">
                {steps.map((label, idx) => (
                  <span key={idx} className={clsx(
                    "w-2 h-2 rounded-full transition-all",
                    idx === step ? "bg-primary scale-125 shadow-lg shadow-primary/15" :
                    idx < step ? "bg-primary/50" : "bg-muted"
                  )} />
                ))}
              </div>
            </div>
            <div className="mb-10">{step <= 5 ? renderStep() : renderSuccess()}</div>
            {/* Navigation buttons */}
            {step <= 5 && (
            <div className="flex justify-between items-center mt-2">
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
            )}
          </form>
        </section>
      </main>
      <footer className="mt-20 mb-6 text-xs text-[#7d7ead] z-10 text-center">
        &copy; {new Date().getFullYear()} ClearFin.AI&nbsp;&nbsp;|&nbsp;&nbsp;No financial advice, just clarity.
      </footer>
      {/* Extra aurora gradient keyframes */}
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
};

export default Index;
