
import React from 'react';
import { type DebtDetail } from './assessmentHooks';

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

const SummaryItem = ({ label, value }: { label: string; value?: string | string[] | boolean | null }) => {
  if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
    return null;
  }
  
  const displayValue = Array.isArray(value) ? value.join(', ') : 
                       typeof value === 'boolean' ? (value ? 'Yes' : 'No') :
                       value;

  if (!displayValue) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-4">
      <p className="font-medium text-gray-600 col-span-1">{label}</p>
      <p className="text-gray-800 col-span-2">{displayValue}</p>
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
    </div>
  );
};

export default AssessmentSummary;
