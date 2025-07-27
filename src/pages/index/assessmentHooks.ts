
import React, { useState } from "react";
import { PRELOADED_EXPENSE_CATEGORIES as PreloadedExpenseCategories, INCOME_FREQUENCIES as freqs, PRELOADED_INCOME_CATEGORIES as PreloadedIncomeCategories } from "@/lib/budgetCategories";

export type DebtDetail = {
  type: string;
  loanAmount: string;
  balance: string;
  repayments: string;
  repaymentFrequency: string;
  interestRate: string;
};

export const questions = [
  {
    id: "employment",
    title: "Employment Status",
    subtitle: "What is your current employment situation?",
    type: "radio",
    options: [
      "Full-Time",
      "Part-Time",
      "Casual/Contract",
      "Self-Employed",
      "Unemployed",
      "Retired",
      "Other",
    ],
  },
  {
    id: "incomeSources",
    title: "Gross Income Sources",
    subtitle: "Please specify your sources of pre-tax income.",
    type: "income-list",
  },
  {
    id: "upload",
    title: "Upload Financial Data",
    subtitle:
      "Import your bank statements or manually enter your income and expenses.",
    type: "upload",
  },
  {
    id: "expenses",
    title: "Expenses",
    subtitle: "What are your typical monthly expenses?",
    type: "expense-list",
  },
  {
    id: "financialKnowledge",
    title: "Financial Knowledge",
    subtitle: "How would you rate your financial knowledge?",
    type: "radio",
    options: ["High", "Medium", "Low"],
  },
  {
    id: "investmentExperience",
    title: "Investment Experience",
    subtitle: "Do you have any investment experience?",
    type: "checkbox",
    options: [
      "Stocks or ETFs",
      "Property",
      "Cryptocurrency",
      "Managed Funds",
      "None",
    ],
  },
  {
    id: "debtTypes",
    title: "Debts & Liabilities",
    subtitle: "Which debts/liabilities do you currently hold?",
    type: "checkbox",
    options: [
      "Credit Card",
      "Personal Loan",
      "Car Loan",
      "Boat/Leisure Loan",
      "BNPL (e.g. Afterpay)",
      "Mortgage",
      "Education Loan",
      "No current debt",
    ],
  },
  {
    id: "debtDetails",
    title: "Debt Details",
    subtitle: "Enter the details for each debt.",
    type: "debt-details-list",
  },
  {
    id: "debtConfidence",
    title: "Debt Management Confidence",
    subtitle: "Are you confident in your ability to manage your debts?",
    type: "radio",
    options: ["Yes", "Somewhat", "No"],
  },
  {
    id: "additionalNotes",
    title: "Additional Notes",
    subtitle: "Is there anything else you'd like to share?",
    type: "textarea",
  },
];

// Additional questions for Full Financial Health Check
export const healthCheckQuestions = [
  {
    id: "postcode",
    title: "Location",
    subtitle: "What's your postcode?",
    type: "text",
  },
  {
    id: "age",
    title: "Age",
    subtitle: "What's your age?",
    type: "number",
  },
  {
    id: "superBalance",
    title: "Superannuation Balance",
    subtitle: "What's your current super balance?",
    type: "number",
  },
  {
    id: "superFund",
    title: "Super Fund",
    subtitle: "Which super fund are you with? (if known)",
    type: "text",
  },
  {
    id: "mortgageRate",
    title: "Current Mortgage Rate",
    subtitle: "What's your current mortgage interest rate? (if applicable)",
    type: "number",
  },
  {
    id: "insurances",
    title: "Insurance Coverage",
    subtitle: "Which insurances do you currently have?",
    type: "checkbox",
    options: [
      "Life Insurance",
      "Income Protection",
      "TPD (Total Permanent Disability)",
      "Home Insurance",
      "Car Insurance",
      "Health Insurance",
      "None",
    ],
  },
  {
    id: "assets",
    title: "Assets Breakdown",
    subtitle: "What assets do you currently own?",
    type: "asset-list",
  },
];

export const INCOME_FREQUENCIES = freqs;
export const PRELOADED_INCOME_CATEGORIES = PreloadedIncomeCategories;
export const PRELOADED_EXPENSE_CATEGORIES = PreloadedExpenseCategories;

export function useAssessmentState() {
  const [step, setStep] = useState(0);
  const [showAssessment, setShowAssessment] = useState(false);
  const [goals, setGoals] = useState<string[]>([]);
  const [otherGoal, setOtherGoal] = useState("");
  const [debtTypes, setDebtTypes] = useState<string[]>([]);
  const [debtDetails, setDebtDetails] = useState<DebtDetail[]>([]);
  const [debtManagementConfidence, setDebtManagementConfidence] =
    useState<string | undefined>();
  const [freeTextComments, setFreeTextComments] = useState("");
  const [financialKnowledgeLevel, setFinancialKnowledgeLevel] =
    useState<string | undefined>();
  const [investmentExperience, setInvestmentExperience] = useState<string[]>([]);
  const [employmentStatus, setEmploymentStatus] = useState<string | undefined>();
  const [hasRegularIncome, setHasRegularIncome] = useState<boolean | undefined>();
  const [incomeSources, setIncomeSources] = useState([
    { category: "", amount: "", frequency: "Monthly" },
  ]);
  const [expenseItems, setExpenseItems] = useState<{
    category: string;
    amount: string;
    frequency: string;
  }[]>(
    PreloadedExpenseCategories.map((c) => ({
      category: c,
      amount: "",
      frequency: "Weekly",
    }))
  );
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Additional fields for Full Financial Health Check
  const [postcode, setPostcode] = useState("");
  const [age, setAge] = useState<number | undefined>();
  const [superBalance, setSuperBalance] = useState<number | undefined>();
  const [superFund, setSuperFund] = useState("");
  const [mortgageRate, setMortgageRate] = useState<number | undefined>();
  const [insurances, setInsurances] = useState<string[]>([]);
  const [assets, setAssets] = useState<{
    type: string;
    value: string;
    description: string;
  }[]>([]);

  return {
    step,
    setStep,
    showAssessment,
    setShowAssessment,
    goals,
    setGoals,
    otherGoal,
    setOtherGoal,
    debtTypes,
    setDebtTypes,
    debtDetails,
    setDebtDetails,
    debtManagementConfidence,
    setDebtManagementConfidence,
    freeTextComments,
    setFreeTextComments,
    financialKnowledgeLevel,
    setFinancialKnowledgeLevel,
    investmentExperience,
    setInvestmentExperience,
    employmentStatus,
    setEmploymentStatus,
    hasRegularIncome,
    setHasRegularIncome,
    incomeSources,
    setIncomeSources,
    expenseItems,
    setExpenseItems,
    uploadedFile,
    setUploadedFile,
    fileInputRef,
    // Additional health check fields
    postcode,
    setPostcode,
    age,
    setAge,
    superBalance,
    setSuperBalance,
    superFund,
    setSuperFund,
    mortgageRate,
    setMortgageRate,
    insurances,
    setInsurances,
    assets,
    setAssets,
  };
}
