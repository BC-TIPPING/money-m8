import { useState, useRef } from "react";

// All config, enums and initial arrays moved here for reuse
export const PRELOADED_EXPENSE_CATEGORIES = [
  "Rent/Mortgage","Groceries","Transport","Utilities","Internet/Phone","Insurance","Medical/Health","Dining Out",
  "Entertainment","Subscriptions","Education","Childcare","Savings/Investments","Other"
];

export const PRELOADED_INCOME_CATEGORIES = [
  "Salary", "Investments", "Business Income", "Rental Income", "Other"
];

export const INCOME_FREQUENCIES = [
  "Weekly", "Fortnightly", "Monthly", "Yearly"
];

export const employmentStatuses = [
  "Full-Time","Part-Time","Casual/Contract","Self-Employed","Unemployed","Retired","Other"
];
export const financialKnowledgeLevels = ["High", "Medium", "Low"];
export const investmentTypes = [
  "Stocks or ETFs","Property","Cryptocurrency","Managed Funds","None"
];
export const goalOptions = [
  "Buy a house","Improve financial literacy","Set a budget","Reduce debt","Grow investments",
  "Save for a purchase","Maximise Super","Pay off home loan sooner","Other"
];
export const goalTimeframes = [
  "0–6 months", "6–12 months", "1–3 years", "3–5 years", "5+ years"
];
export const debtTypeOptions = [
  "Credit Card","Personal Loan","Car Loan","Boat/Leisure Loan","BNPL (e.g. Afterpay)","Mortgage","Education Loan","No current debt"
];
export const debtConfidenceOptions = ["Yes", "Somewhat", "No"];

export interface DebtDetail {
  type: string;
  loanAmount: string;
  balance: string;
  repayments: string;
  interestRate: string;
}

export const questions = [
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
    id: "incomeSources",
    title: "What are your income sources?",
    subtitle: "Add your main sources of income",
    type: "income-list"
  },
  {
    id: "upload",
    title: "Import Your Budget (Optional)",
    subtitle: "Upload a CSV or PDF to fill in your info faster, or continue manually.",
    type: "upload"
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
    id: "debtDetails",
    title: "Tell us more about your debts",
    subtitle: "Provide details for each loan you have. You can fill this in later.",
    type: "debt-details-list"
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

// Main assessment state management hook
export function useAssessmentState() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [expenseItems, setExpenseItems] = useState(
    PRELOADED_EXPENSE_CATEGORIES.map((cat) => ({ category: cat, amount: "" }))
  );
  const [step, setStep] = useState(0);
  const [showAssessment, setShowAssessment] = useState(false);

  const [employmentStatus, setEmploymentStatus] = useState<string | undefined>();
  const [hasRegularIncome, setHasRegularIncome] = useState<boolean | undefined>();
  const [incomeSources, setIncomeSources] = useState([{ category: "", amount: "", frequency: "Monthly" }]);
  const [financialKnowledgeLevel, setFinancialKnowledgeLevel] = useState<string | undefined>();
  const [investmentExperience, setInvestmentExperience] = useState<string[]>([]);
  const [goals, setGoals] = useState<string[]>([]);
  const [otherGoal, setOtherGoal] = useState("");
  const [goalTimeframe, setGoalTimeframe] = useState<string | undefined>();
  const [debtTypes, setDebtTypes] = useState<string[]>([]);
  const [debtDetails, setDebtDetails] = useState<DebtDetail[]>([]);
  const [debtManagementConfidence, setDebtManagementConfidence] = useState<string | undefined>();
  const [freeTextComments, setFreeTextComments] = useState("");

  return {
    uploadedFile, setUploadedFile, fileInputRef, expenseItems, setExpenseItems,
    step, setStep, showAssessment, setShowAssessment,
    employmentStatus, setEmploymentStatus, hasRegularIncome, setHasRegularIncome,
    incomeSources, setIncomeSources,
    financialKnowledgeLevel, setFinancialKnowledgeLevel, investmentExperience, setInvestmentExperience,
    goals, setGoals, otherGoal, setOtherGoal, goalTimeframe, setGoalTimeframe,
    debtTypes, setDebtTypes, debtDetails, setDebtDetails, debtManagementConfidence, setDebtManagementConfidence,
    freeTextComments, setFreeTextComments
  };
}
