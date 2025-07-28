
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
  const [investmentExperience, setInvestmentExperience] = useState<string[]>([]);
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
  const [insurances, setInsurances] = useState<string[]>([]);
  
  // Standard assessment fields
  const [employmentStatus, setEmploymentStatus] = useState<string | undefined>();
  const [financialKnowledgeLevel, setFinancialKnowledgeLevel] = useState<string | undefined>();
  const [debtManagementConfidence, setDebtManagementConfidence] = useState<string | undefined>();
  const [freeTextComments, setFreeTextComments] = useState("");
  const [superFund, setSuperFund] = useState("");
  const [mortgageRate, setMortgageRate] = useState<number | undefined>();
  const [assets, setAssets] = useState<{ type: string; value: string; description: string }[]>([]);

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
    investmentExperience,
    setInvestmentExperience,
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
    insurances,
    setInsurances,
    // Standard assessment fields
    employmentStatus,
    setEmploymentStatus,
    financialKnowledgeLevel,
    setFinancialKnowledgeLevel,
    debtManagementConfidence,
    setDebtManagementConfidence,
    freeTextComments,
    setFreeTextComments,
    superFund,
    setSuperFund,
    mortgageRate,
    setMortgageRate,
    assets,
    setAssets,
  };
}
