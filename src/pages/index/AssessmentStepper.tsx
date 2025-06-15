
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import clsx from "clsx";
import ProgressMilestones from "./ProgressMilestones";
// ... import all hooks/config ...
import {
  questions,
  PRELOADED_EXPENSE_CATEGORIES,
  employmentStatuses,
  incomeConfidenceOptions,
  financialKnowledgeLevels,
  investmentTypes,
  goalOptions,
  goalTimeframes,
  debtTypeOptions,
  debtConfidenceOptions,
} from "./assessmentHooks";

const CenteredCard = ({ children }: { children: React.ReactNode }) => (
  <section className="w-full flex flex-col items-center min-h-[100dvh] justify-center px-4 pt-8 pb-10">
    <div className="relative w-full max-w-2xl rounded-2xl shadow-2xl p-8 md:p-12 bg-card border border-border">
      {children}
    </div>
  </section>
);

// Props: all assessment form state, handlers, etc.
interface AssessmentStepperProps {
  // include all state/handlers needed from useAssessmentState!
  uploadedFile: File | null;
  setUploadedFile: (file: File | null) => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  expenseItems: { category: string, amount: string }[];
  setExpenseItems: React.Dispatch<React.SetStateAction<{ category: string, amount: string }[]>>;
  step: number;
  setStep: (n: number) => void;
  showAssessment: boolean;
  setShowAssessment: (b: boolean) => void;
  employmentStatus: string | undefined;
  setEmploymentStatus: (val: string) => void;
  hasRegularIncome: boolean | undefined;
  setHasRegularIncome: (val: boolean) => void;
  incomeConfidence: string | undefined;
  setIncomeConfidence: (val: string) => void;
  incomeSources: { description: string, amount: string }[];
  setIncomeSources: React.Dispatch<React.SetStateAction<{ description: string, amount: string }[]>>;
  financialKnowledgeLevel: string | undefined;
  setFinancialKnowledgeLevel: (val: string) => void;
  investmentExperience: string[];
  setInvestmentExperience: (val: string[]) => void;
  goals: string[];
  setGoals: (val: string[]) => void;
  otherGoal: string;
  setOtherGoal: (val: string) => void;
  goalTimeframe: string | undefined;
  setGoalTimeframe: (val: string) => void;
  debtTypes: string[];
  setDebtTypes: (val: string[]) => void;
  debtManagementConfidence: string | undefined;
  setDebtManagementConfidence: (val: string) => void;
  freeTextComments: string;
  setFreeTextComments: (val: string) => void;
}

const AssessmentStepper: React.FC<AssessmentStepperProps> = (props) => {
  // ... keep handler utilities from original Index.tsx (getCurrentValue, income/expense manipulation) ...
  const {
    uploadedFile, setUploadedFile, fileInputRef, expenseItems, setExpenseItems,
    step, setStep, showAssessment, setShowAssessment,
    employmentStatus, setEmploymentStatus, hasRegularIncome, setHasRegularIncome,
    incomeConfidence, setIncomeConfidence, incomeSources, setIncomeSources,
    financialKnowledgeLevel, setFinancialKnowledgeLevel, investmentExperience, setInvestmentExperience,
    goals, setGoals, otherGoal, setOtherGoal, goalTimeframe, setGoalTimeframe,
    debtTypes, setDebtTypes, debtManagementConfidence, setDebtManagementConfidence,
    freeTextComments, setFreeTextComments
  } = props;

  // Handler fns as in old file...
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
      case "additionalNotes": return true;
      default: return false;
    }
  };

  const questionsWithUpload = questions;

  const goalsStepIdx = questionsWithUpload.findIndex(q => q.id === "goals");
  const pastGoalsStep = step >= goalsStepIdx && goals.length > 0;

  const progressMilestones = pastGoalsStep ? goals :
    questionsWithUpload.filter(q => q.id !== "upload" && q.id !== "additionalNotes").map((q, idx) => `Step ${idx + 1}`);

  const canGoNext = (() => {
    if (questionsWithUpload[step]?.id === "upload") return true;
    if (questionsWithUpload[step]?.id === "expenses") {
      return expenseItems.some(exp => exp.amount && !isNaN(Number(exp.amount)));
    }
    return getCurrentValue(questionsWithUpload[step]?.id);
  })();

  const progress = ((step + 1) / questionsWithUpload.length) * 100;
  const currentMilestoneIdx = pastGoalsStep
    ? Math.min(goals.length - 1, step - goalsStepIdx)
    : step;

  // ... renderQuestion (entire switch/case) logic from main file ...

  const renderQuestion = (question: typeof questionsWithUpload[0]) => {
    if (question.type === "upload") {
      return (
        <div className="space-y-6">
          <div className="flex flex-col items-center gap-4">
            <input
              type="file"
              accept=".csv,application/pdf"
              className="hidden"
              ref={fileInputRef}
              onChange={e => {
                if (e.target.files && e.target.files.length > 0) {
                  setUploadedFile(e.target.files[0]);
                }
              }}
            />
            <Button
              variant="outline"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
            >
              {uploadedFile ? `Uploaded: ${uploadedFile.name}` : "Upload CSV or PDF"}
            </Button>
            <div className="text-muted-foreground text-xs">
              You can import your bank statement, budget, or expenses PDF/CSV.
            </div>
          </div>
          <div className="flex items-center justify-center mt-2">
            <span className="text-muted-foreground text-sm">Or</span>
          </div>
          <div className="mt-2 text-center text-foreground/80 text-base">
            Continue to manually enter your financial details.
          </div>
        </div>
      );
    }
    // Preloaded categories for expense step
    if (question.type === "expense-list") {
      return (
        <div className="space-y-4">
          {expenseItems.map((exp, idx) => (
            <div className="flex gap-3 items-center" key={exp.category}>
              <span className="flex-1 text-foreground">{exp.category}</span>
              <Input
                placeholder="Amount ($)"
                type="number"
                min={0}
                value={exp.amount}
                onChange={e => {
                  const value = e.target.value;
                  setExpenseItems(items => {
                    const arr = [...items];
                    arr[idx].amount = value;
                    return arr;
                  });
                }}
                className="w-32"
              />
            </div>
          ))}
        </div>
      );
    }
    return (
      (() => {
        switch (question.type) {
          case "radio":
            const radioValue = question.id === "employment" ? employmentStatus : 
                       question.id === "incomeConfidence" ? incomeConfidence :
                       question.id === "financialKnowledge" ? financialKnowledgeLevel :
                       question.id === "goalTimeframe" ? goalTimeframe :
                       question.id === "debtConfidence" ? debtManagementConfidence : "";
            const onRadioChange = (value: string) => {
              if (question.id === "employment") setEmploymentStatus(value);
              else if (question.id === "incomeConfidence") setIncomeConfidence(value);
              else if (question.id === "financialKnowledge") setFinancialKnowledgeLevel(value);
              else if (question.id === "goalTimeframe") setGoalTimeframe(value);
              else if (question.id === "debtConfidence") setDebtManagementConfidence(value);
            }
            return (
              <RadioGroup 
                value={radioValue}
                onValueChange={onRadioChange}
                className="space-y-3"
              >
                {question.options?.map(option => (
                  <label key={option} htmlFor={option} className={clsx(
                    "flex items-center space-x-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                    radioValue === option
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  )}>
                    <RadioGroupItem value={option} id={option} className="hidden" />
                    <div className={clsx(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                      radioValue === option ? "border-primary bg-primary" : "border-muted-foreground"
                    )}>
                      {radioValue === option && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                    <span className="flex-1 cursor-pointer text-foreground font-medium">
                      {option}
                    </span>
                  </label>
                ))}
              </RadioGroup>
            );
          
          case "boolean":
            return (
              <div className="space-y-3">
                {[ { label: "Yes", value: true }, { label: "No", value: false } ].map(opt => (
                  <div
                    key={opt.label}
                    className={clsx(
                      "flex items-center space-x-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                      hasRegularIncome === opt.value ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                    )}
                    onClick={() => setHasRegularIncome(opt.value)}
                  >
                    <div className={clsx(
                      "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                      hasRegularIncome === opt.value ? "border-primary bg-primary" : "border-muted-foreground"
                    )}>
                      {hasRegularIncome === opt.value && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>
                    <span className="flex-1 text-foreground font-medium">{opt.label}</span>
                  </div>
                ))}
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
                  <label key={option} htmlFor={option} className={clsx(
                    "flex items-start space-x-4 p-4 rounded-lg border-2 cursor-pointer transition-all",
                    currentValues.includes(option) ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
                  )}>
                    <Checkbox
                      id={option}
                      checked={currentValues.includes(option)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setCurrentValues([...currentValues, option]);
                        } else {
                          setCurrentValues(currentValues.filter(item => item !== option));
                        }
                      }}
                      className="hidden"
                    />
                    <div className={clsx(
                      "w-5 h-5 mt-1 rounded-md border-2 flex items-center justify-center shrink-0",
                      currentValues.includes(option) ? "border-primary bg-primary" : "border-muted-foreground"
                    )}>
                      {currentValues.includes(option) && <Check className="w-3 h-3 text-primary-foreground" />}
                    </div>

                    <div className="flex-1 cursor-pointer">
                      <span className="font-medium text-foreground">{option}</span>
                      {option === "Other" && goals.includes("Other") && (
                        <Input 
                          className="mt-2" 
                          value={otherGoal} 
                          onChange={e => setOtherGoal(e.target.value)} 
                          placeholder="Describe your goal" 
                        />
                      )}
                    </div>
                  </label>
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
      })()
    );
  }; // end renderQuestion

  const handleNext = () => {
    if (step < questionsWithUpload.length - 1) {
      setStep(step + 1);
    } else {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(step - 1);
  };

  if (step >= questionsWithUpload.length) {
    return (
      <div className="w-full min-h-screen bg-background flex items-center justify-center">
        <CenteredCard>
          <div className="text-center py-12">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Thank you!</h2>
            <div className="text-xl font-semibold mb-4 text-primary">Assessment completed 🎉</div>
            <p className="text-muted-foreground mb-6 max-w-md">
              We're analyzing your responses to personalize your financial profile, tools and action steps.
            </p>
            <div className="bg-card rounded-lg p-6 mb-8 text-sm text-muted-foreground border border-border">
              <strong className="text-foreground">What's next?</strong> You'll soon be able to: review your answers, set detailed budgets/goals, get a personalized roadmap, and play with powerful financial calculators.
            </div>
            <Button onClick={() => window.location.reload()}>Close</Button>
          </div>
        </CenteredCard>
      </div>
    );
  }

  const currentQuestion = questionsWithUpload[step];
  return (
    <div className="w-full min-h-screen bg-background flex items-center justify-center">
      <CenteredCard>
        <ProgressMilestones
          progress={progress}
          step={step}
          total={questionsWithUpload.length}
          milestones={progressMilestones}
          currentMilestoneIdx={currentMilestoneIdx}
        />

        {/* Question content */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {currentQuestion.title}
          </h2>
          <p className="text-muted-foreground mb-8">
            {currentQuestion.subtitle}
          </p>
          
          {renderQuestion(currentQuestion)}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center pt-6 border-t border-border">
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
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {step === questionsWithUpload.length - 1 ? "Finish" : "Next"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CenteredCard>
    </div>
  );
};

export default AssessmentStepper;
