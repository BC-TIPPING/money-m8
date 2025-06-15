
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
import { Progress } from "@/components/ui/progress";
import { ArrowRight, ArrowLeft } from "lucide-react";
import clsx from "clsx";

const adventurousPanels = [
  { title: "Chart Your Journey", description: "Imagine your financial path as a wild trek — we help you map it out.", emoji: "🗺️" },
  { title: "Climb Your Goals", description: "Reach summits: home, wealth, freedom. We're with you at every step.", emoji: "⛰️" },
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

const questions = [
  {
    id: "employment",
    title: "What's your employment status?",
    subtitle: "This helps us understand your income stability",
    type: "radio",
    options: employmentStatuses
  },
  {
    id: "regularIncome",
    title: "Do you have a regular income?",
    subtitle: "Regular income helps with financial planning",
    type: "boolean"
  },
  {
    id: "incomeConfidence",
    title: "Are you confident in your income stability?",
    subtitle: "Understanding your confidence helps us tailor advice",
    type: "radio",
    options: incomeConfidenceOptions
  },
  {
    id: "incomeSources",
    title: "What are your income sources?",
    subtitle: "Add your main sources of income",
    type: "income-list"
  },
  {
    id: "expenses",
    title: "What are your main expenses?",
    subtitle: "Add your regular expense categories",
    type: "expense-list"
  },
  {
    id: "financialKnowledge",
    title: "How would you rate your financial knowledge?",
    subtitle: "This helps us provide appropriate guidance",
    type: "radio",
    options: financialKnowledgeLevels
  },
  {
    id: "investmentExperience",
    title: "What investment experience do you have?",
    subtitle: "Select all that apply",
    type: "checkbox",
    options: investmentTypes
  },
  {
    id: "goals",
    title: "What are your current financial goals?",
    subtitle: "Select all that apply",
    type: "checkbox",
    options: goalOptions
  },
  {
    id: "goalTimeframe",
    title: "What is your goal timeframe?",
    subtitle: "When do you want to achieve your main goal?",
    type: "radio",
    options: goalTimeframes
  },
  {
    id: "debtTypes",
    title: "Which debts/liabilities do you currently hold?",
    subtitle: "Select all that apply",
    type: "checkbox",
    options: debtTypeOptions
  },
  {
    id: "debtConfidence",
    title: "Are you confident in your ability to manage your debts?",
    subtitle: "Understanding your confidence helps us provide support",
    type: "radio",
    options: debtConfidenceOptions
  },
  {
    id: "additionalNotes",
    title: "Anything else you'd like to share?",
    subtitle: "Optional - any comments or special needs",
    type: "textarea"
  }
];

const CenteredCard = ({ children }: { children: React.ReactNode }) => (
  <section className="w-full flex flex-col items-center min-h-[100dvh] justify-center px-4 pt-8 pb-10">
    <div className="relative w-full max-w-2xl rounded-2xl shadow-2xl p-8 md:p-12 bg-white border border-gray-200">
      {children}
    </div>
  </section>
);

export default function Index() {
  const [step, setStep] = useState(0);
  const [showAssessment, setShowAssessment] = useState(false);

  // Form state
  const [employmentStatus, setEmploymentStatus] = useState<string | undefined>();
  const [hasRegularIncome, setHasRegularIncome] = useState<boolean | undefined>();
  const [incomeConfidence, setIncomeConfidence] = useState<string | undefined>();
  const [incomeSources, setIncomeSources] = useState([{ description: "", amount: "" }]);
  const [expenseItems, setExpenseItems] = useState([{ category: "", amount: "" }]);
  const [financialKnowledgeLevel, setFinancialKnowledgeLevel] = useState<string | undefined>();
  const [investmentExperience, setInvestmentExperience] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [otherGoal, setOtherGoal] = useState("");
  const [goalTimeframe, setGoalTimeframe] = useState<string | undefined>();
  const [debtTypes, setDebtTypes] = useState<string[]>([]);
  const [debtManagementConfidence, setDebtManagementConfidence] = useState<string | undefined>();
  const [freeTextComments, setFreeTextComments] = useState("");

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

  const getCurrentValue = (questionId: string) => {
    switch (questionId) {
      case "employment": return employmentStatus;
      case "regularIncome": return hasRegularIncome;
      case "incomeConfidence": return incomeConfidence;
      case "incomeSources": return incomeSources.some(src => src.description && src.amount);
      case "expenses": return expenseItems.some(exp => exp.category && exp.amount);
      case "financialKnowledge": return financialKnowledgeLevel;
      case "investmentExperience": return investmentExperience.length > 0;
      case "goals": return goals.length > 0;
      case "goalTimeframe": return goalTimeframe;
      case "debtTypes": return debtTypes.length > 0;
      case "debtConfidence": return debtManagementConfidence;
      case "additionalNotes": return true; // Always valid since optional
      default: return false;
    }
  };

  const canGoNext = getCurrentValue(questions[step]?.id);
  const progress = ((step + 1) / questions.length) * 100;

  const renderQuestion = (question: typeof questions[0]) => {
    switch (question.type) {
      case "radio":
        return (
          <RadioGroup 
            value={question.id === "employment" ? employmentStatus : 
                   question.id === "incomeConfidence" ? incomeConfidence :
                   question.id === "financialKnowledge" ? financialKnowledgeLevel :
                   question.id === "goalTimeframe" ? goalTimeframe :
                   question.id === "debtConfidence" ? debtManagementConfidence : ""} 
            onValueChange={(value) => {
              if (question.id === "employment") setEmploymentStatus(value);
              else if (question.id === "incomeConfidence") setIncomeConfidence(value);
              else if (question.id === "financialKnowledge") setFinancialKnowledgeLevel(value);
              else if (question.id === "goalTimeframe") setGoalTimeframe(value);
              else if (question.id === "debtConfidence") setDebtManagementConfidence(value);
            }}
            className="space-y-3"
          >
            {question.options?.map(option => (
              <div key={option} className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                <RadioGroupItem value={option} id={option} />
                <label htmlFor={option} className="flex-1 cursor-pointer text-gray-900 font-medium">
                  {option}
                </label>
              </div>
            ))}
          </RadioGroup>
        );
      
      case "boolean":
        return (
          <div className="space-y-3">
            <div 
              className={clsx(
                "flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all",
                hasRegularIncome === true ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
              )}
              onClick={() => setHasRegularIncome(true)}
            >
              <div className={clsx(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                hasRegularIncome === true ? "border-blue-500 bg-blue-500" : "border-gray-300"
              )}>
                {hasRegularIncome === true && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <span className="flex-1 text-gray-900 font-medium">Yes</span>
            </div>
            <div 
              className={clsx(
                "flex items-center space-x-3 p-4 rounded-lg border cursor-pointer transition-all",
                hasRegularIncome === false ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"
              )}
              onClick={() => setHasRegularIncome(false)}
            >
              <div className={clsx(
                "w-5 h-5 rounded-full border-2 flex items-center justify-center",
                hasRegularIncome === false ? "border-blue-500 bg-blue-500" : "border-gray-300"
              )}>
                {hasRegularIncome === false && <div className="w-2 h-2 rounded-full bg-white" />}
              </div>
              <span className="flex-1 text-gray-900 font-medium">No</span>
            </div>
          </div>
        );
      
      case "checkbox":
        const currentValues = question.id === "investmentExperience" ? investmentExperience :
                             question.id === "goals" ? goals :
                             question.id === "debtTypes" ? debtTypes : [];
        const setCurrentValues = question.id === "investmentExperience" ? setInvestmentExperience :
                                question.id === "goals" ? setGoals :
                                question.id === "debtTypes" ? setDebtTypes : () => {};
        
        return (
          <div className="space-y-3">
            {question.options?.map(option => (
              <div key={option} className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50">
                <Checkbox
                  checked={currentValues.includes(option)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setCurrentValues([...currentValues, option]);
                    } else {
                      setCurrentValues(currentValues.filter(item => item !== option));
                    }
                  }}
                />
                <label className="flex-1 cursor-pointer text-gray-900 font-medium">
                  {option}
                  {option === "Other" && goals.includes("Other") && (
                    <Input 
                      className="mt-2" 
                      value={otherGoal} 
                      onChange={e => setOtherGoal(e.target.value)} 
                      placeholder="Describe your goal" 
                    />
                  )}
                </label>
              </div>
            ))}
          </div>
        );
      
      case "income-list":
        return (
          <div className="space-y-4">
            {incomeSources.map((src, idx) => (
              <div className="flex gap-3" key={idx}>
                <Input
                  placeholder="Income description (e.g., Salary, Freelance)"
                  value={src.description}
                  onChange={e => handleIncomeChange(idx, "description", e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Amount ($)"
                  type="number"
                  min={0}
                  value={src.amount}
                  onChange={e => handleIncomeChange(idx, "amount", e.target.value)}
                  className="w-32"
                />
                <Button size="icon" variant="ghost" onClick={() => removeIncomeSource(idx)} aria-label="Remove">
                  ×
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addIncomeSource}>+ Add Income Source</Button>
          </div>
        );
      
      case "expense-list":
        return (
          <div className="space-y-4">
            {expenseItems.map((exp, idx) => (
              <div className="flex gap-3" key={idx}>
                <Input
                  placeholder="Expense category (e.g., Rent, Food)"
                  value={exp.category}
                  onChange={e => handleExpenseChange(idx, "category", e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Amount ($)"
                  type="number"
                  min={0}
                  value={exp.amount}
                  onChange={e => handleExpenseChange(idx, "amount", e.target.value)}
                  className="w-32"
                />
                <Button size="icon" variant="ghost" onClick={() => removeExpenseItem(idx)} aria-label="Remove">
                  ×
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addExpenseItem}>+ Add Expense</Button>
          </div>
        );
      
      case "textarea":
        return (
          <Textarea
            placeholder="Leave any comments or special needs here…"
            value={freeTextComments}
            onChange={e => setFreeTextComments(e.target.value)}
            className="min-h-[100px] resize-vertical"
          />
        );
      
      default:
        return null;
    }
  };

  const handleNext = () => {
    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      // Handle completion
      setStep(step + 1); // Go to success screen
    }
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  if (!showAssessment) {
    return (
      <div className="w-full min-h-screen relative flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-[#202336] via-[#28365a] to-[#191d29]">
        {/* Aurora and starfield background effects */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          <div className="absolute left-0 top-0 w-[120%] h-[90%] -translate-x-1/12 -translate-y-1/12 bg-gradient-to-br from-[#211e50] via-[#253472] to-transparent animate-[move-bg_16s_ease-in-out_infinite_alternate] opacity-60 blur-2xl" />
          <div className="absolute right-[-15%] bottom-[-8%] w-[600px] h-[400px] bg-gradient-to-br from-[#46b1ea] via-transparent to-[#9989c4] rounded-full blur-3xl opacity-30 animate-pulse" />
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

        {/* Main content */}
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

          <Button 
            size="lg" 
            className="text-lg px-8 py-4 rounded-xl"
            onClick={() => setShowAssessment(true)}
          >
            Start Assessment
          </Button>
        </main>

        <footer className="mt-10 mb-6 text-xs text-[#7d7ead] z-10 text-center">
          &copy; {new Date().getFullYear()} ClearFin.AI&nbsp;&nbsp;|&nbsp;&nbsp;No financial advice, just clarity.
        </footer>

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

  // Assessment screens
  if (step >= questions.length) {
    return (
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center">
        <CenteredCard>
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">Thank you!</h2>
            <div className="text-xl font-semibold mb-4 text-blue-600">Assessment completed 🎉</div>
            <p className="text-gray-600 mb-6 max-w-md">
              We're analyzing your responses to personalize your financial profile, tools and action steps.
            </p>
            <div className="bg-blue-50 rounded-lg p-6 mb-8 text-sm text-gray-700">
              <strong className="text-blue-900">What's next?</strong> You'll soon be able to: review your answers, set detailed budgets/goals, get a personalized roadmap, and play with powerful financial calculators.
            </div>
            <Button onClick={() => window.location.reload()}>Close</Button>
          </div>
        </CenteredCard>
      </div>
    );
  }

  const currentQuestion = questions[step];

  return (
    <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center">
      <CenteredCard>
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
            <span className="text-sm text-gray-500">{step + 1} of {questions.length}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question content */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {currentQuestion.title}
          </h2>
          <p className="text-gray-600 mb-8">
            {currentQuestion.subtitle}
          </p>
          
          {renderQuestion(currentQuestion)}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={step === 0}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={!canGoNext}
            className="flex items-center gap-2"
          >
            {step === questions.length - 1 ? "Finish" : "Next"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CenteredCard>
    </div>
  );
}
