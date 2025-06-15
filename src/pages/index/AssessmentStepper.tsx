import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import clsx from "clsx";
import ProgressMilestones from "./ProgressMilestones";
import AssessmentSummary from "./AssessmentSummary";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import DebtReductionChart from "./DebtReductionChart";
import {
  questions,
  PRELOADED_EXPENSE_CATEGORIES,
  employmentStatuses,
  financialKnowledgeLevels,
  investmentTypes,
  goalOptions,
  goalTimeframes,
  debtTypeOptions,
  debtConfidenceOptions,
  type DebtDetail,
  PRELOADED_INCOME_CATEGORIES,
  INCOME_FREQUENCIES,
} from "./assessmentHooks";

const CenteredCard = ({ children }: { children: React.ReactNode }) => (
  <section className="w-full flex flex-col items-center min-h-[100dvh] justify-center px-4 pt-8 pb-10">
    <div className="relative w-full max-w-2xl rounded-2xl shadow-2xl p-8 md:p-12 bg-white border border-gray-200">
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
  expenseItems: { category: string, amount: string, frequency: string }[];
  setExpenseItems: React.Dispatch<React.SetStateAction<{ category: string, amount: string, frequency: string }[]>>;
  step: number;
  setStep: (n: number) => void;
  showAssessment: boolean;
  setShowAssessment: (b: boolean) => void;
  employmentStatus: string | undefined;
  setEmploymentStatus: (val: string) => void;
  hasRegularIncome: boolean | undefined;
  setHasRegularIncome: (val: boolean) => void;
  incomeSources: { category: string; amount: string; frequency: string }[];
  setIncomeSources: React.Dispatch<React.SetStateAction<{ category: string; amount: string; frequency: string }[]>>;
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
  debtDetails: DebtDetail[];
  setDebtDetails: React.Dispatch<React.SetStateAction<DebtDetail[]>>;
  debtManagementConfidence: string | undefined;
  setDebtManagementConfidence: (val: string) => void;
  freeTextComments: string;
  setFreeTextComments: (val: string) => void;
  generateSummary: () => void;
  isGeneratingSummary: boolean;
  aiSummary: string | null;
  chartData: any | null;
}

const AssessmentStepper: React.FC<AssessmentStepperProps> = (props) => {
  // ... keep handler utilities from original Index.tsx (getCurrentValue, income/expense manipulation) ...
  const {
    uploadedFile, setUploadedFile, fileInputRef, expenseItems, setExpenseItems,
    step, setStep, showAssessment, setShowAssessment,
    employmentStatus, setEmploymentStatus, hasRegularIncome, setHasRegularIncome,
    incomeSources, setIncomeSources,
    financialKnowledgeLevel, setFinancialKnowledgeLevel, investmentExperience, setInvestmentExperience,
    goals, setGoals, otherGoal, setOtherGoal, goalTimeframe, setGoalTimeframe,
    debtTypes, setDebtTypes, debtDetails, setDebtDetails, debtManagementConfidence, setDebtManagementConfidence,
    freeTextComments, setFreeTextComments,
    generateSummary, isGeneratingSummary, aiSummary, chartData
  } = props;

  React.useEffect(() => {
    const newDetails = debtTypes
      .filter(type => type !== "No current debt")
      .map(type => {
        const existingDetail = debtDetails.find(d => d.type === type);
        return existingDetail || {
          type,
          loanAmount: "",
          balance: "",
          repayments: "",
          interestRate: "",
        };
      });

    if (JSON.stringify(newDetails) !== JSON.stringify(debtDetails)) {
        setDebtDetails(newDetails);
    }
  }, [debtTypes, debtDetails, setDebtDetails]);

  const handleDebtDetailChange = (idx: number, key: keyof Omit<DebtDetail, "type">, value: string) => {
    setDebtDetails(prev => {
        const next = [...prev];
        next[idx] = { ...next[idx], [key]: value };
        return next;
    });
  };

  // Handler fns as in old file...
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
      const item = next[idx] as any;
      item[key] = value;
      return next;
    });
  };
  const addExpenseItem = () => setExpenseItems([...expenseItems, { category: "", amount: "", frequency: "Weekly" }]);
  const removeExpenseItem = (idx: number) =>
    setExpenseItems(expenseItems.length === 1 ? expenseItems : expenseItems.filter((_, i) => i !== idx));

  const getCurrentValue = (questionId: string) => {
    switch (questionId) {
      case "employment": return employmentStatus;
      case "regularIncome": return hasRegularIncome;
      case "incomeSources": return incomeSources.some(src => src.category && src.amount);
      case "expenses": return expenseItems.some(exp => exp.category && exp.amount);
      case "financialKnowledge": return financialKnowledgeLevel;
      case "investmentExperience": return investmentExperience.length > 0;
      case "goals": return goals.length > 0;
      case "goalTimeframe": return goalTimeframe;
      case "debtTypes": return debtTypes.length > 0;
      case "debtDetails": return true;
      case "debtConfidence": return debtManagementConfidence;
      case "additionalNotes": return true;
      default: return false;
    }
  };

  const questionsWithUpload = questions;

  const pastGoalsStep = goals.length > 0;

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
    ? 0
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
            <div className="text-gray-500 text-xs">
              You can import your bank statement, budget, or expenses PDF/CSV.
            </div>
          </div>
          <div className="flex items-center justify-center mt-2">
            <span className="text-gray-500 text-sm">Or</span>
          </div>
          <div className="mt-2 text-center text-gray-700 text-base">
            Continue to manually enter your financial details.
          </div>
        </div>
      );
    }
    // Preloaded categories for expense step
    if (question.type === "expense-list") {
        const handleAllExpenseFrequenciesChange = (newFrequency: string) => {
            setExpenseItems(prevItems =>
              prevItems.map(item => ({ ...item, frequency: newFrequency }))
            );
        };
      return (
        <div>
          <div className="flex justify-end items-center gap-2 mb-4">
            <label className="text-sm font-medium text-gray-700">Set all to:</label>
            <Select onValueChange={handleAllExpenseFrequenciesChange}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select Frequency" />
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
            <div className="space-y-4">
            {expenseItems.map((exp, idx) => (
                <div className="grid grid-cols-[1fr_auto_auto] md:grid-cols-[1fr_120px_150px] gap-3 items-center" key={idx}>
                <span className="flex-1 text-gray-900">{exp.category}</span>
                <Input
                    placeholder="Amount ($)"
                    type="number"
                    min={0}
                    value={exp.amount}
                    onChange={e => handleExpenseChange(idx, "amount", e.target.value)}
                />
                <Select value={exp.frequency} onValueChange={val => handleExpenseChange(idx, "frequency", val)}>
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
                </div>
            ))}
            </div>
        </div>
      );
    }
    return (
      (() => {
        switch (question.type) {
          case "radio":
            return (
              <RadioGroup 
                value={question.id === "employment" ? employmentStatus : 
                       question.id === "financialKnowledge" ? financialKnowledgeLevel :
                       question.id === "goalTimeframe" ? goalTimeframe :
                       question.id === "debtConfidence" ? debtManagementConfidence : ""} 
                onValueChange={(value) => {
                  if (question.id === "employment") setEmploymentStatus(value);
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
                  <label key={option} className="flex items-center space-x-3 p-4 rounded-lg border border-gray-200 hover:bg-gray-50 cursor-pointer">
                    <Checkbox
                      checked={currentValues.includes(option)}
                      onCheckedChange={(checked) => {
                        if (question.id === 'debtTypes') {
                            const setDebtTypesTyped = setCurrentValues as React.Dispatch<React.SetStateAction<string[]>>;
                            const typedCurrent = currentValues as string[];
                            if (option === 'No current debt') {
                                setDebtTypesTyped(checked ? ['No current debt'] : []);
                            } else {
                                let newDebtTypes = typedCurrent.filter(item => item !== 'No current debt');
                                if (checked) {
                                    newDebtTypes.push(option);
                                } else {
                                    newDebtTypes = newDebtTypes.filter(item => item !== option);
                                }
                                setDebtTypesTyped(newDebtTypes);
                            }
                        } else {
                          if (checked) {
                            setCurrentValues([...currentValues, option]);
                          } else {
                            setCurrentValues(currentValues.filter(item => item !== option));
                          }
                        }
                      }}
                    />
                    <span className="flex-1 text-gray-900 font-medium">
                      {option}
                      {option === "Other" && goals.includes("Other") && (
                        <Input 
                          className="mt-2" 
                          value={otherGoal} 
                          onChange={e => {
                            e.preventDefault();
                            setOtherGoal(e.target.value)
                          }} 
                          onClick={e => e.preventDefault()}
                          placeholder="Describe your goal" 
                        />
                      )}
                    </span>
                  </label>
                ))}
              </div>
            );
          
          case "income-list":
            return (
              <div className="space-y-4">
                {incomeSources.map((src, idx) => (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center" key={idx}>
                    <Select
                      value={src.category}
                      onValueChange={(value) => handleIncomeChange(idx, "category", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
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
                      placeholder="Amount ($)"
                      type="number"
                      min={0}
                      value={src.amount}
                      onChange={(e) => handleIncomeChange(idx, "amount", e.target.value)}
                    />
                    <div className="flex gap-2 items-center">
                      <Select
                        value={src.frequency}
                        onValueChange={(value) => handleIncomeChange(idx, "frequency", value)}
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
                      <Button size="icon" variant="ghost" onClick={() => removeIncomeSource(idx)} aria-label="Remove">
                        ×
                      </Button>
                    </div>
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
                     <Select value={exp.frequency} onValueChange={val => handleExpenseChange(idx, "frequency", val)}>
                      <SelectTrigger className="w-[150px]">
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
                    <Button size="icon" variant="ghost" onClick={() => removeExpenseItem(idx)} aria-label="Remove">
                      ×
                    </Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addExpenseItem}>+ Add Expense</Button>
              </div>
            );
          
          case "debt-details-list":
            if (debtDetails.length === 0) {
              return (
                <div className="text-center text-gray-600">
                  <p>You have no debts selected.</p>
                  <p className="text-sm">You can go back to add debts or click Next to continue.</p>
                </div>
              )
            }
            return (
              <div className="space-y-6">
                {debtDetails.map((detail, idx) => (
                  <div key={idx} className="p-4 border rounded-lg space-y-4 bg-gray-50/50">
                    <h3 className="font-semibold text-lg text-gray-800">{detail.type}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Balance</label>
                        <Input
                          placeholder="e.g. 15000"
                          type="number"
                          min={0}
                          value={detail.balance}
                          onChange={e => handleDebtDetailChange(idx, "balance", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Repayments</label>
                        <Input
                          placeholder="e.g. 400"
                          type="number"
                          min={0}
                          value={detail.repayments}
                          onChange={e => handleDebtDetailChange(idx, "repayments", e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate (%)</label>
                        <Input
                          placeholder="e.g. 5.5"
                          type="number"
                          min={0}
                          step={0.01}
                          value={detail.interestRate}
                          onChange={e => handleDebtDetailChange(idx, "interestRate", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
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
      <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <CenteredCard>
          <div className="text-center pb-8">
            <h2 className="text-3xl font-bold mb-2 text-gray-900">Thank You!</h2>
            <p className="text-gray-600 mb-6">
              Your financial assessment is complete. Here is a summary of your responses.
            </p>
          </div>

          <div className="max-h-[40vh] overflow-y-auto p-4 bg-white rounded-lg border border-gray-200">
            <AssessmentSummary {...props} />
          </div>

          {aiSummary ? (
            <>
              <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-xl font-bold text-blue-900 mb-4">Your Personalized Summary</h3>
                <div className="text-sm text-gray-800 space-y-4">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      p: ({node, ...props}) => <p className="leading-relaxed" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-1" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-semibold text-blue-900" {...props} />,
                    }}
                  >
                    {aiSummary}
                  </ReactMarkdown>
                </div>
              </div>
              {chartData && chartData.debtReductionData && (
                 <div className="mt-8">
                    <DebtReductionChart data={chartData.debtReductionData} />
                 </div>
              )}
            </>
          ) : (
            <div className="bg-blue-50 rounded-lg p-6 my-8 text-sm text-gray-700 text-left">
              <strong className="text-blue-900 block mb-2">What's next?</strong>
              <p>Get a personalized summary of your financial goals and a comparison to what you've entered.</p> 
              <div className="text-center mt-6">
                 <Button onClick={generateSummary} disabled={isGeneratingSummary}>
                  {isGeneratingSummary ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : "Generate My Financial Summary"}
                </Button>
              </div>
            </div>
          )}

          <div className="text-center mt-8">
             <Button variant="outline" onClick={() => window.location.reload()}>Start Over</Button>
          </div>
        </CenteredCard>
      </div>
    );
  }

  const currentQuestion = questionsWithUpload[step];
  return (
    <div className="w-full min-h-screen bg-gray-50 flex items-center justify-center">
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
            {step === questionsWithUpload.length - 1 ? "Finish" : "Next"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </CenteredCard>
    </div>
  );
};

export default AssessmentStepper;
