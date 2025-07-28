
import React from 'react';
import { type DebtDetail } from './assessmentHooks';
import { calculateMonthlyAmount, calculateAustralianIncomeTax } from '@/lib/financialCalculations';

interface AssessmentSummaryProps {
  employmentStatus?: string;
  hasRegularIncome?: boolean;
  incomeSources: { category: string; amount: string; frequency: string }[];
  expenseItems: { category: string; amount: string; frequency: string }[];
  uploadedFile?: File | null;
  financialKnowledgeLevel?: string;
  investmentExperience: string[];
  goals: string[];
  otherGoal?: string;
  goalTimeframe?: string;
  debtTypes: string[];
  debtDetails: DebtDetail[];
  debtManagementConfidence?: string;
  freeTextComments?: string;
}

const SummaryItem = ({ label, value }: { label: string; value?: string | string[] | boolean | null | React.ReactNode }) => {
  if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
    return null;
  }
  
  const displayValue = React.isValidElement(value) ? value : 
                       Array.isArray(value) ? value.join(', ') : 
                       typeof value === 'boolean' ? (value ? 'Yes' : 'No') :
                       value;

  if (!displayValue && typeof displayValue !== 'number') return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-4">
      <p className="font-medium text-gray-600 col-span-1">{label}</p>
      <div className="text-gray-800 col-span-2">{displayValue}</div>
    </div>
  );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-800 border-b pb-2 mb-4">{title}</h3>
        <div className="space-y-3">
            {children}
        </div>
    </div>
);


const AssessmentSummary: React.FC<AssessmentSummaryProps> = (props) => {
  const {
    employmentStatus,
    hasRegularIncome,
    incomeSources,
    expenseItems,
    uploadedFile,
    financialKnowledgeLevel,
    investmentExperience,
    goals,
    otherGoal,
    goalTimeframe,
    debtTypes,
    debtDetails,
    debtManagementConfidence,
    freeTextComments,
  } = props;

  const filteredIncomeSources = incomeSources.filter(s => s.category && s.amount);
  const filteredExpenseItems = expenseItems.filter(e => e.amount);

  const totalMonthlyGrossIncome = calculateMonthlyAmount(incomeSources);
  const totalAnnualGrossIncome = totalMonthlyGrossIncome * 12;
  const annualTax = calculateAustralianIncomeTax(totalAnnualGrossIncome);
  const totalMonthlyNetIncome = totalAnnualGrossIncome > 0 ? (totalAnnualGrossIncome - annualTax) / 12 : 0;
  
  const totalMonthlyExpenses = calculateMonthlyAmount(expenseItems);

  const monthlySavings = totalMonthlyNetIncome - totalMonthlyExpenses;
  const savingsPercentage = totalMonthlyNetIncome > 0 ? (monthlySavings / totalMonthlyNetIncome) * 100 : 0;


  return (
    <div className="space-y-8 text-sm">
      <Section title="Primary Goal">
        <SummaryItem label="Your Goal" value={goals.includes('Other') && otherGoal ? otherGoal : goals.join(', ')} />
        <SummaryItem label="Timeframe" value={goalTimeframe} />
      </Section>

      <Section title="Employment & Income">
        <SummaryItem label="Employment" value={employmentStatus} />
        <SummaryItem label="Regular Income" value={hasRegularIncome} />
        {uploadedFile && <SummaryItem label="Uploaded Statement" value={uploadedFile.name} />}
      </Section>

      {filteredIncomeSources.length > 0 && (
          <Section title="Gross Income Sources">
              <ul className="list-disc list-inside text-gray-800 space-y-1 pl-1">
                {filteredIncomeSources.map((source, index) => (
                  <li key={index}>
                    {source.category}: ${source.amount} ({source.frequency})
                  </li>
                ))}
              </ul>
          </Section>
        )}
        
      {filteredExpenseItems.length > 0 && (
        <Section title="Expenses">
            <ul className="list-disc list-inside text-gray-800 space-y-1 pl-1">
              {filteredExpenseItems.map((item, index) => (
                <li key={index}>
                  {item.category}: ${item.amount} ({item.frequency})
                </li>
              ))}
            </ul>
        </Section>
      )}
      
      <Section title="Financial Knowledge">
        <SummaryItem label="Knowledge Level" value={financialKnowledgeLevel} />
        <SummaryItem label="Investment Experience" value={investmentExperience} />
      </Section>

      <Section title="Debts & Liabilities">
        <SummaryItem label="Debts Held" value={debtTypes.join(', ')} />
        <SummaryItem label="Confidence" value={debtManagementConfidence} />
        {debtDetails.length > 0 && (
          <div className="pt-2">
            <p className="font-medium text-gray-600 mb-2">Debt Details:</p>
            <ul className="list-disc list-inside text-gray-800 space-y-2 pl-1">
              {debtDetails.map((debt, index) => (
                <li key={index}>
                  <strong>{debt.type}</strong>
                  <div className="pl-4 text-gray-700">
                    Balance: ${debt.balance} | Repayments: ${debt.repayments} | Rate: {debt.interestRate}%
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Section>
      
      {freeTextComments && (
        <Section title="Additional Notes">
            <p className="text-gray-700 italic">"{freeTextComments}"</p>
        </Section>
      )}

      <Section title="Financial Summary">
          <SummaryItem label="Total Monthly Expenses" value={`$${totalMonthlyExpenses.toFixed(2)}`} />
          <SummaryItem 
            label="Potential Monthly Savings" 
            value={
              <span className={monthlySavings >= 0 ? 'text-green-600 font-medium' : 'text-destructive font-medium'}>
                  {`${monthlySavings >= 0 ? '' : '-'}$${Math.abs(monthlySavings).toFixed(2)}`}
              </span>
            } 
          />
          {totalMonthlyNetIncome > 0 && (
            <SummaryItem 
                label="Savings as % of Net Income" 
                value={
                    <span className={monthlySavings >= 0 ? 'text-green-600 font-medium' : 'text-destructive font-medium'}>
                        {`${savingsPercentage.toFixed(1)}%`}
                    </span>
                } 
            />
          )}
      </Section>
    </div>
  );
};

export default AssessmentSummary;
